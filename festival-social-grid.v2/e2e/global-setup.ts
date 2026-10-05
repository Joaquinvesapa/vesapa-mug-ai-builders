import { execFileSync } from "node:child_process";

/** E2E runs against the test database: migrate it and load the sample line-up. */
export default function setup(): void {
  const env = { ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL };
  execFileSync("pnpm", ["exec", "prisma", "migrate", "deploy"], { env, stdio: "inherit" });
  execFileSync("pnpm", ["lineup:import", "data/lineup.csv"], { env, stdio: "inherit" });
}
