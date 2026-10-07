/**
 * Loads the versioned line-up CSV into the database (RF-03).
 * Usage: pnpm lineup:import <file.csv> [--allow-removals]
 */
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";

// Variables already set (e.g. by tests) win over .env.
if (existsSync(".env")) process.loadEnvFile(".env");

async function main(): Promise<number> {
  const args = process.argv.slice(2);
  const allowRemovals = args.includes("--allow-removals");
  const path = args.find((a) => !a.startsWith("--"));
  if (!path) {
    console.error("Usage: pnpm lineup:import <file.csv> [--allow-removals]");
    return 1;
  }

  let text: string;
  try {
    text = await readFile(path, "utf8");
  } catch {
    console.error(`Cannot read ${path}`);
    return 1;
  }

  // Imported after .env is loaded, since the client reads DATABASE_URL.
  const { festival } = await import("@/config/festival");
  const { importLineupCsv } = await import("@/server/lineup/import-lineup");
  const { prisma } = await import("@/server/db");

  try {
    const result = await importLineupCsv(text, festival, { allowRemovals });
    if (!result.ok) {
      console.error(`Line-up rejected; nothing was loaded:\n${result.errors.map((e) => `  - ${e}`).join("\n")}`);
      return 1;
    }
    const total = result.created + result.updated;
    console.log(
      `Imported ${total} shows (${result.created} created, ${result.updated} updated, ${result.removed} removed).`,
    );
    return 0;
  } finally {
    await prisma.$disconnect();
  }
}

main().then((code) => process.exit(code));
