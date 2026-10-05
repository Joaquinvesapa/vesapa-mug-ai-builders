import { prisma } from "@/server/db";

// Callers must authorize first (requireUser); the line-up is never public (RF-65).

export type ShowFilters = { day?: string; stage?: string };

const SHOW_FIELDS = {
  id: true,
  artist: true,
  description: true,
  day: true,
  stage: true,
  startsAt: true,
  endsAt: true,
} as const;

export type Show = {
  id: string;
  artist: string;
  description: string;
  day: string;
  stage: string;
  startsAt: Date;
  endsAt: Date;
};

export function listShows({ day, stage }: ShowFilters): Promise<Show[]> {
  return prisma.show.findMany({
    where: { day, stage },
    orderBy: [{ day: "asc" }, { startsAt: "asc" }, { artist: "asc" }],
    select: SHOW_FIELDS,
  });
}

export async function listStages(): Promise<string[]> {
  const rows = await prisma.show.findMany({
    distinct: ["stage"],
    select: { stage: true },
    orderBy: { stage: "asc" },
  });
  return rows.map((r) => r.stage);
}

export function getShow(id: string): Promise<Show | null> {
  return prisma.show.findUnique({ where: { id }, select: SHOW_FIELDS });
}
