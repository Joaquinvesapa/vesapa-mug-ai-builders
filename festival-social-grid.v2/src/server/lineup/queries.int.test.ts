import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { FestivalConfig } from "@/config/festival";
import { prisma } from "@/server/db";
import { importLineupCsv } from "@/server/lineup/import-lineup";
import { getShow, listShows, listStages } from "@/server/lineup/queries";
import { resetDatabase } from "@/test/integration/reset-database";

const festival: FestivalConfig = {
  name: "Test Fest",
  city: "Buenos Aires",
  province: "Buenos Aires",
  startDate: "2026-11-20",
  endDate: "2026-11-22",
};

const CSV = [
  "id,artist,description,day,stage,start,end",
  "fri-north,Fri North,Rock,2026-11-20,Norte,2026-11-20 20:00,2026-11-20 21:00",
  "sat-south,Sat South,Pop,2026-11-21,Sur,2026-11-21 19:00,2026-11-21 20:00",
  "sat-north,Sat North,Jazz,2026-11-21,Norte,2026-11-21 18:00,2026-11-21 19:00",
  // Saturday show ending at 1:00 on Sunday (AC-04).
  "sat-late,Sat Late,Techno,2026-11-21,Norte,2026-11-21 23:30,2026-11-22 01:00",
  "sun-south,Sun South,Folk,2026-11-22,Sur,2026-11-22 16:00,2026-11-22 17:00",
].join("\n");

const ids = (shows: { id: string }[]) => shows.map((s) => s.id);

describe("line-up queries", () => {
  beforeAll(async () => {
    await resetDatabase();
    await importLineupCsv(CSV, festival);
  });
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("lists every show ordered by day and start time (AC-31)", async () => {
    expect(ids(await listShows({}))).toEqual([
      "fri-north",
      "sat-north",
      "sat-south",
      "sat-late",
      "sun-south",
    ]);
  });

  it("filters by day (AC-32)", async () => {
    expect(ids(await listShows({ day: "2026-11-22" }))).toEqual(["sun-south"]);
  });

  it("keeps an after-midnight show on its CSV day (AC-04)", async () => {
    expect(ids(await listShows({ day: "2026-11-21" }))).toContain("sat-late");
    expect(ids(await listShows({ day: "2026-11-22" }))).not.toContain("sat-late");
  });

  it("filters by stage (AC-33)", async () => {
    expect(ids(await listShows({ stage: "Sur" }))).toEqual(["sat-south", "sun-south"]);
  });

  it("combines day and stage filters (AC-34)", async () => {
    expect(ids(await listShows({ day: "2026-11-21", stage: "Norte" }))).toEqual([
      "sat-north",
      "sat-late",
    ]);
  });

  it("lists the stages alphabetically", async () => {
    expect(await listStages()).toEqual(["Norte", "Sur"]);
  });

  it("returns every detail field of a show (AC-35)", async () => {
    expect(await getShow("sat-late")).toEqual({
      id: "sat-late",
      artist: "Sat Late",
      description: "Techno",
      day: "2026-11-21",
      stage: "Norte",
      startsAt: new Date("2026-11-22T02:30:00.000Z"),
      endsAt: new Date("2026-11-22T04:00:00.000Z"),
    });
  });

  it("returns null for an unknown show", async () => {
    expect(await getShow("nope")).toBeNull();
  });
});
