import type { FestivalConfig } from "@/config/festival";
import { prisma } from "@/server/db";
import { parseLineupCsv } from "./parse-lineup-csv";

export type ImportLineupResult =
  | { ok: true; created: number; updated: number; removed: number }
  | { ok: false; errors: string[] };

/**
 * Replaces the line-up with the CSV contents. Everything is validated first
 * and written in one transaction, so a failure leaves the previous line-up
 * intact (RF-04, RNF-06).
 */
export async function importLineupCsv(
  text: string,
  festival: FestivalConfig,
): Promise<ImportLineupResult> {
  const parsed = parseLineupCsv(text, festival);
  if (!parsed.ok) return parsed;

  const ids = parsed.shows.map((s) => s.id);

  return prisma.$transaction(async (tx) => {
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
