import type { FestivalConfig } from "@/config/festival";
import { prisma } from "@/server/db";
import { parseLineupCsv } from "./parse-lineup-csv";

export type ImportLineupResult =
  | { ok: true; created: number; updated: number; removed: number }
  | { ok: false; errors: string[] };

/**
 * Replaces the line-up with the CSV contents. Everything is validated first
 * and written in one transaction, so a failure leaves the previous line-up
 * intact (RF-04, RNF-06). Removing a show that is in someone's grid needs
 * allowRemovals, so selections are never dropped by accident.
 */
export async function importLineupCsv(
  text: string,
  festival: FestivalConfig,
  { allowRemovals = false }: { allowRemovals?: boolean } = {},
): Promise<ImportLineupResult> {
  const parsed = parseLineupCsv(text, festival);
  if (!parsed.ok) return parsed;

  const ids = parsed.shows.map((s) => s.id);

  return prisma.$transaction(async (tx): Promise<ImportLineupResult> => {
    if (!allowRemovals) {
      const blocked = await tx.selection.groupBy({
        by: ["showId"],
        where: { showId: { notIn: ids } },
        _count: { _all: true },
        orderBy: { showId: "asc" },
      });
      if (blocked.length > 0) {
        return {
          ok: false,
          errors: blocked.map(
            (b) =>
              `show "${b.showId}" would be removed but is in ${b._count._all} personal grid(s); rerun with --allow-removals`,
          ),
        };
      }
    }

    const existing = new Set(
      (await tx.show.findMany({ select: { id: true } })).map((s) => s.id),
    );

    const { count: removed } = await tx.show.deleteMany({
      where: { id: { notIn: ids } },
    });

    for (const { id, ...data } of parsed.shows) {
      await tx.show.upsert({ where: { id }, create: { id, ...data }, update: data });
    }

    const updated = ids.filter((id) => existing.has(id)).length;
    return { ok: true, created: ids.length - updated, updated, removed };
  });
}
