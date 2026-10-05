import { existsSync } from "node:fs";
import { defineConfig, devices } from "@playwright/test";

if (existsSync(".env")) process.loadEnvFile(".env");

const port = 3100;
const baseURL = `http://localhost:${port}`;

export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `pnpm dev --port ${port}`,
    url: baseURL,
    // Never reuse a server that may be pointed at the development database.
    reuseExistingServer: false,
    timeout: 120_000,
    // Variables already in the environment take precedence over .env in Next.js.
    env: {
      DATABASE_URL: process.env.TEST_DATABASE_URL ?? "",
      AUTH_URL: baseURL,
    },
  },
});
