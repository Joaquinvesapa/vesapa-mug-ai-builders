import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/server/db";
import type { Show } from "@/server/lineup/queries";

// Every function takes the owner's id from the session, never from the
// request, so a person can only read or change their own grid (RF-66).

export type AddSelectionResult = { ok: true } | { ok: false; reason: "not_found" };

export async function addSelection(userId: string, showId: string): Promise<AddSelectionResult> {
  try {
    await prisma.selection.upsert({
      where: { userId_showId: { userId, showId } },
      create: { userId, showId },
      update: {},
    });
    return { ok: true };
  } catch (error) {
    // Foreign key violation: the show does not exist.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      return { ok: false, reason: "not_found" };
    }
    throw error;
  }
}

export async function removeSelection(userId: string, showId: string): Promise<void> {
  await prisma.selection.deleteMany({ where: { userId, showId } });
}

export async function listSelectedShowIds(userId: string): Promise<Set<string>> {
  const rows = await prisma.selection.findMany({ where: { userId }, select: { showId: true } });
  return new Set(rows.map((r) => r.showId));
}

export function listSelectedShows(userId: string): Promise<Show[]> {
  return prisma.show.findMany({
    where: { selections: { some: { userId } } },
    orderBy: [{ day: "asc" }, { startsAt: "asc" }, { artist: "asc" }],
    select: {
      id: true,
      artist: true,
      description: true,
      day: true,
      stage: true,
      startsAt: true,
      endsAt: true,
    },
  });
}
