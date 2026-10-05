import { afterAll, beforeEach, describe, expect, it } from "vitest";
import type { FestivalConfig } from "@/config/festival";
import { prisma } from "@/server/db";
import { importLineupCsv } from "@/server/lineup/import-lineup";
import { resetDatabase } from "@/test/integration/reset-database";

const festival: FestivalConfig = {
  name: "Test Fest",
  city: "Buenos Aires",
  province: "Buenos Aires",
  startDate: "2026-11-20",
  endDate: "2026-11-22",
};

const HEADER = "id,artist,description,day,stage,start,end";
const bandA = "band-a,Band A,Rock,2026-11-21,Norte,2026-11-21 20:00,2026-11-21 21:00";
const bandB = "band-b,Band B,Pop,2026-11-21,Sur,2026-11-21 23:30,2026-11-22 01:00";
const csv = (...rows: string[]) => [HEADER, ...rows].join("\n");

describe("importLineupCsv", () => {
  beforeEach(resetDatabase);
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("loads every show of a valid CSV (AC-01)", async () => {
    const result = await importLineupCsv(csv(bandA, bandB), festival);

    expect(result).toEqual({ ok: true, created: 2, updated: 0, removed: 0 });
    const shows = await prisma.show.findMany({ orderBy: { id: "asc" } });
    expect(shows.map((s) => s.id)).toEqual(["band-a", "band-b"]);
    expect(shows[1]).toMatchObject({
      day: "2026-11-21",
      startsAt: new Date("2026-11-22T02:30:00.000Z"),
      endsAt: new Date("2026-11-22T04:00:00.000Z"),
    });
  });

  it("loads 0 shows when any row is invalid (AC-03)", async () => {
    const noStage = "band-c,Band C,Jazz,2026-11-21,,2026-11-21 18:00,2026-11-21 19:00";

    const result = await importLineupCsv(csv(bandA, noStage), festival);

    expect(result.ok).toBe(false);
    expect(await prisma.show.count()).toBe(0);
  });

  it("leaves the current line-up untouched when a reimport is invalid", async () => {
    await importLineupCsv(csv(bandA), festival);

    await importLineupCsv(csv(bandA.replace("Band A", ""), bandB), festival);

    const shows = await prisma.show.findMany();
    expect(shows.map((s) => [s.id, s.artist])).toEqual([["band-a", "Band A"]]);
  });

  it("updates shows in place by their stable id", async () => {
    await importLineupCsv(csv(bandA, bandB), festival);

    const result = await importLineupCsv(csv(bandA.replace("Norte", "Este"), bandB), festival);

    expect(result).toEqual({ ok: true, created: 0, updated: 2, removed: 0 });
    const show = await prisma.show.findUniqueOrThrow({ where: { id: "band-a" } });
    expect(show.stage).toBe("Este");
  });

  it("removes shows that are no longer in the CSV", async () => {
    await importLineupCsv(csv(bandA, bandB), festival);

    const result = await importLineupCsv(csv(bandA), festival);

    expect(result).toEqual({ ok: true, created: 0, updated: 1, removed: 1 });
    expect(await prisma.show.count()).toBe(1);
  });
});
