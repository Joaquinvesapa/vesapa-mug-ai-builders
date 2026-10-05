import { expect, test } from "@playwright/test";
import { signUp } from "./helpers";

// Based on data/lineup.csv, loaded by the e2e global setup.

test.describe("anonymous visitors", () => {
  test("cannot see the line-up (AC-98)", async ({ page }) => {
    await page.goto("/lineup");

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByText("Astro Rave")).toHaveCount(0);
  });

  test("cannot see a show detail (AC-98)", async ({ page }) => {
    await page.goto("/lineup/astro-rave");

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByText("Astro Rave")).toHaveCount(0);
  });
});

test.describe("signed-in people", () => {
  test.beforeEach(async ({ page }) => {
    await signUp(page);
  });

  const shows = (page: import("@playwright/test").Page) =>
    page.getByRole("list", { name: "Shows" }).getByRole("listitem");

  test("see every show of the festival (AC-31)", async ({ page }) => {
    await page.goto("/lineup");

    await expect(shows(page)).toHaveCount(14);
  });

  test("filter by day (AC-32) and keep after-midnight shows on their day (AC-04)", async ({
    page,
  }) => {
    await page.goto("/lineup");
    await page.getByRole("navigation", { name: "Filtrar por día" }).getByRole("link", { name: "sábado 21/11" }).click();

    await expect(page).toHaveURL(/day=2026-11-21/);
    await expect(shows(page)).toHaveCount(5);
    await expect(shows(page).filter({ hasText: "Astro Rave" })).toHaveCount(1);

    await page.getByRole("navigation", { name: "Filtrar por día" }).getByRole("link", { name: "domingo 22/11" }).click();
    await expect(shows(page).filter({ hasText: "Astro Rave" })).toHaveCount(0);
  });

  test("filter by stage (AC-33)", async ({ page }) => {
    await page.goto("/lineup");
    await page.getByRole("navigation", { name: "Filtrar por escenario" }).getByRole("link", { name: "Escenario Sur" }).click();

    await expect(shows(page)).toHaveCount(6);
    await expect(shows(page).filter({ hasText: "Escenario Norte" })).toHaveCount(0);
  });

  test("combine day and stage filters (AC-34)", async ({ page }) => {
    await page.goto("/lineup?day=2026-11-21&stage=Escenario%20Norte");

    await expect(shows(page)).toHaveCount(3);
  });

  test("open a show detail with every field (AC-35)", async ({ page }) => {
    await page.goto("/lineup?day=2026-11-21");
    await page.getByRole("link", { name: /Astro Rave/ }).click();

    await expect(page).toHaveURL(/\/lineup\/astro-rave$/);
    await expect(page.getByRole("heading", { name: "Astro Rave" })).toBeVisible();
    await expect(page.getByText("el sábado a la 1 del domingo sigue siendo sábado")).toBeVisible();
    await expect(page.getByText("sábado 21/11")).toBeVisible();
    await expect(page.getByText("Escenario Norte")).toBeVisible();
    await expect(page.getByText("23:30 – 01:00")).toBeVisible();
  });

  test("get a not-found page for an unknown show", async ({ page }) => {
    const response = await page.goto("/lineup/no-existe");

    expect(response?.status()).toBe(404);
  });
});
