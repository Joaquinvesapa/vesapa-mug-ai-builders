import { execFile } from "node:child_process";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/server/db";
import { resetDatabase } from "@/test/integration/reset-database";

const run = promisify(execFile);

async function importFile(path: string, ...flags: string[]) {
  try {
    const { stdout } = await run("pnpm", ["exec", "tsx", "scripts/import-lineup.ts", path, ...flags], {
      env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
    });
    return { code: 0, output: stdout };
  } catch (error) {
    const e = error as { code: number; stdout: string; stderr: string };
    return { code: e.code, output: e.stdout + e.stderr };
  }
}

describe("pnpm lineup:import", () => {
  beforeEach(resetDatabase);
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("imports the versioned line-up", async () => {
    const result = await importFile("data/lineup-lollapalooza-2027.csv");

    expect(result.code).toBe(0);
    expect(result.output).toMatch(/Imported \d+ shows/);
    expect(await prisma.show.count()).toBeGreaterThan(0);
  });

  it("fails with every error and loads nothing for an invalid CSV (AC-03)", async () => {
    const dir = await mkdtemp(join(tmpdir(), "lineup-"));
    const path = join(dir, "bad.csv");
    await writeFile(
      path,
      "id,artist,description,day,stage,start,end\n" +
        "a,A,Rock,2026-11-21,,2026-11-21 20:00,2026-11-21 21:00\n",
    );

    const result = await importFile(path);

    expect(result.code).toBe(1);
    expect(result.output).toContain("line 2: stage is required");
    expect(await prisma.show.count()).toBe(0);
  });

  it("fails clearly when the file does not exist", async () => {
    const result = await importFile("nope.csv");

    expect(result.code).toBe(1);
    expect(result.output).toContain("Cannot read nope.csv");
  });

  it("blocks removing selected shows unless --allow-removals is passed", async () => {
    await importFile("data/lineup-lollapalooza-2027.csv");
    const user = await prisma.user.create({ data: { email: "ana@example.com" } });
    await prisma.selection.create({ data: { userId: user.id, showId: "peggy-gou" } });
    const dir = await mkdtemp(join(tmpdir(), "lineup-"));
    const path = join(dir, "smaller.csv");
    await writeFile(
      path,
      "id,artist,description,day,stage,start,end\n" +
        "tiger-mood,Tiger Mood,Live,2027-03-05,Flow Stage,2027-03-05 14:30,2027-03-05 15:15\n",
    );

    const blocked = await importFile(path);
    expect(blocked.code).toBe(1);
    expect(blocked.output).toContain('show "peggy-gou" would be removed');

    const allowed = await importFile(path, "--allow-removals");
    expect(allowed.code).toBe(0);
    expect(await prisma.show.count()).toBe(1);
  });
});
