import { expect, test, type Page } from "@playwright/test";
import { signUp } from "./helpers";

// Based on data/lineup-lollapalooza-2027.csv, loaded by the e2e global setup.

test.describe("anonymous visitors", () => {
  test("cannot see the line-up (AC-98)", async ({ page }) => {
    await page.goto("/lineup");

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByText("Peggy Gou")).toHaveCount(0);
  });

  test("cannot see a show detail (AC-98)", async ({ page }) => {
    await page.goto("/lineup/peggy-gou");

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByText("Peggy Gou")).toHaveCount(0);
  });
});

test.describe("signed-in people", () => {
  test.beforeEach(async ({ page }) => {
    await signUp(page);
  });

  const shows = (page: Page) => page.getByRole("list", { name: "Shows" }).getByRole("listitem");
  const dayFilter = (page: Page, name: string) =>
    page.getByRole("navigation", { name: "Filtrar por día" }).getByRole("link", { name });
  const stageFilter = (page: Page, name: string) =>
    page.getByRole("navigation", { name: "Filtrar por escenario" }).getByRole("link", { name });

  test("see every show of the festival (AC-31)", async ({ page }) => {
    await page.goto("/lineup");

    await expect(shows(page)).toHaveCount(60);
  });

  test("filter by day (AC-32) and keep after-midnight shows on their day (AC-04)", async ({
    page,
  }) => {
    await page.goto("/lineup");
    await dayFilter(page, "viernes 05/03").click();

    await expect(page).toHaveURL(/day=2027-03-05/);
    await expect(shows(page)).toHaveCount(30);
    await expect(shows(page).filter({ hasText: "Peggy Gou" })).toHaveCount(1);

    await dayFilter(page, "sábado 06/03").click();
    await expect(shows(page).filter({ hasText: "Peggy Gou" })).toHaveCount(0);
  });

  test("filter by stage (AC-33)", async ({ page }) => {
    await page.goto("/lineup");
    await stageFilter(page, "Samsung Stage").click();

    await expect(shows(page)).toHaveCount(12);
    await expect(shows(page).filter({ hasText: "Flow Stage" })).toHaveCount(0);
  });

  test("combine day and stage filters (AC-34)", async ({ page }) => {
    await page.goto("/lineup?day=2027-03-05&stage=Samsung%20Stage");

    await expect(shows(page)).toHaveCount(6);
  });

  test("open a show detail with every field (AC-35)", async ({ page }) => {
    await page.goto("/lineup?day=2027-03-05");
    await page.getByRole("link", { name: /Peggy Gou/ }).click();

    await expect(page).toHaveURL(/\/lineup\/peggy-gou$/);
    await expect(page.getByRole("heading", { name: "Peggy Gou" })).toBeVisible();
    await expect(page.getByText("Live at Lollapalooza Argentina")).toBeVisible();
    await expect(page.getByText("viernes 05/03")).toBeVisible();
    await expect(page.getByText("Samsung Stage")).toBeVisible();
    await expect(page.getByText("23:30 – 01:00")).toBeVisible();
  });

  test("get a not-found page for an unknown show", async ({ page }) => {
    const response = await page.goto("/lineup/no-existe");

    expect(response?.status()).toBe(404);
  });
});
