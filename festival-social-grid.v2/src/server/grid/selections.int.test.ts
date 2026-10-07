import { afterAll, beforeEach, describe, expect, it } from "vitest";
import type { FestivalConfig } from "@/config/festival";
import { prisma } from "@/server/db";
import {
  addSelection,
  listSelectedShowIds,
  listSelectedShows,
  removeSelection,
} from "@/server/grid/selections";
import { importLineupCsv } from "@/server/lineup/import-lineup";
import { resetDatabase } from "@/test/integration/reset-database";

const festival: FestivalConfig = {
  name: "Test Fest",
  city: "Buenos Aires",
  province: "Buenos Aires",
  startDate: "2027-03-05",
  endDate: "2027-03-06",
};

const CSV = [
  "id,artist,description,day,stage,start,end",
  "fri-a,Fri A,Rock,2027-03-05,Norte,2027-03-05 20:00,2027-03-05 21:00",
  "fri-b,Fri B,Pop,2027-03-05,Sur,2027-03-05 20:30,2027-03-05 21:30",
  "sat-a,Sat A,Jazz,2027-03-06,Norte,2027-03-06 18:00,2027-03-06 19:00",
].join("\n");

let ana: string;
let beto: string;

describe("personal selections", () => {
  beforeEach(async () => {
    await resetDatabase();
    await importLineupCsv(CSV, festival);
    ana = (await prisma.user.create({ data: { email: "ana@example.com" } })).id;
    beto = (await prisma.user.create({ data: { email: "beto@example.com" } })).id;
  });
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("adds a show to the grid (AC-36, AC-37)", async () => {
    expect(await addSelection(ana, "fri-a")).toEqual({ ok: true });

    expect(await listSelectedShowIds(ana)).toEqual(new Set(["fri-a"]));
  });

  it("is idempotent when adding the same show twice", async () => {
    await addSelection(ana, "fri-a");

    expect(await addSelection(ana, "fri-a")).toEqual({ ok: true });
    expect(await prisma.selection.count()).toBe(1);
  });

  it("rejects an unknown show", async () => {
    expect(await addSelection(ana, "nope")).toEqual({ ok: false, reason: "not_found" });
  });

  it("keeps both overlapping shows selected (AC-43)", async () => {
    await addSelection(ana, "fri-a");
    await addSelection(ana, "fri-b");

    expect(await listSelectedShowIds(ana)).toEqual(new Set(["fri-a", "fri-b"]));
  });

  it("removes a show without touching other people's selections (AC-38, AC-39)", async () => {
    await addSelection(ana, "fri-a");
    await addSelection(beto, "fri-a");

    await removeSelection(ana, "fri-a");

    expect(await listSelectedShowIds(ana)).toEqual(new Set());
    expect(await listSelectedShowIds(beto)).toEqual(new Set(["fri-a"]));
  });

  it("only lists the owner's shows, ordered by day and time (AC-101)", async () => {
    await addSelection(ana, "sat-a");
    await addSelection(ana, "fri-a");
    await addSelection(beto, "fri-b");

    const shows = await listSelectedShows(ana);

    expect(shows.map((s) => s.id)).toEqual(["fri-a", "sat-a"]);
  });
});
