import { execFileSync } from "node:child_process";

/** E2E runs against the test database; make sure its schema is current. */
export default function setup(): void {
  execFileSync("pnpm", ["exec", "prisma", "migrate", "deploy"], {
    env: { ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL },
    stdio: "inherit",
  });
}
