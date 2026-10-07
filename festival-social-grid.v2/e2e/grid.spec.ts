import { expect, test, type Page } from "@playwright/test";
import { signUp } from "./helpers";

// Shows from data/lineup-lollapalooza-2027.csv:
// Tiger Mood     Fri 14:30–15:15
// Victoria Whynot Fri 14:45–15:30  (overlaps Tiger Mood)
// Mora Fisz      Fri 13:45–14:30  (ends exactly when Tiger Mood starts)
// Joaquina       Sat 14:30–15:15

const lineupItem = (page: Page, artist: string) =>
  page.getByRole("list", { name: "Shows" }).getByRole("listitem").filter({ hasText: artist });

const gridItems = (page: Page) =>
  page.getByRole("list", { name: /^Shows del / }).getByRole("listitem");

async function addFromLineup(page: Page, artist: string, day = "2027-03-05") {
  await page.goto(`/lineup?day=${day}`);
  const item = lineupItem(page, artist);
  await item.getByRole("button", { name: `Agregar ${artist} a mi grilla` }).click();
  await expect(item.getByRole("button", { name: `Quitar ${artist} de mi grilla` })).toBeVisible();
}

test("anonymous visitors cannot see a grid (AC-99)", async ({ page }) => {
  await page.goto("/grid");

  await expect(page).toHaveURL(/\/login$/);
});

test.describe("personal grid", () => {
  test.beforeEach(async ({ page }) => {
    await signUp(page);
  });

  test("starts empty", async ({ page }) => {
    await page.goto("/grid");

    await expect(page.getByText("Todavía no agregaste shows")).toBeVisible();
  });

  test("adds a show from the line-up (AC-36)", async ({ page }) => {
    await addFromLineup(page, "Tiger Mood");

    await page.goto("/grid");
    await expect(gridItems(page).filter({ hasText: "Tiger Mood" })).toHaveCount(1);
  });

  test("adds and removes a show from the detail (AC-37, AC-39)", async ({ page }) => {
    await page.goto("/lineup/tiger-mood");
    await page.getByRole("button", { name: "Agregar Tiger Mood a mi grilla" }).click();
    await expect(page.getByRole("button", { name: "Quitar Tiger Mood de mi grilla" })).toBeVisible();
    await page.goto("/grid");
    await expect(gridItems(page)).toHaveCount(1);

    await page.goto("/lineup/tiger-mood");
    await page.getByRole("button", { name: "Quitar Tiger Mood de mi grilla" }).click();
    await expect(page.getByRole("button", { name: "Agregar Tiger Mood a mi grilla" })).toBeVisible();
    await page.goto("/grid");
    await expect(gridItems(page)).toHaveCount(0);
  });

  test("removes a show from the line-up (AC-38)", async ({ page }) => {
    await addFromLineup(page, "Tiger Mood");

    await lineupItem(page, "Tiger Mood")
      .getByRole("button", { name: "Quitar Tiger Mood de mi grilla" })
      .click();
    await expect(
      lineupItem(page, "Tiger Mood").getByRole("button", { name: "Agregar Tiger Mood a mi grilla" }),
    ).toBeVisible();

    await page.goto("/grid");
    await expect(gridItems(page)).toHaveCount(0);
  });

  test("groups shows by day (AC-40)", async ({ page }) => {
    await addFromLineup(page, "Tiger Mood");
    await addFromLineup(page, "Mora Fisz");
    await addFromLineup(page, "Joaquina", "2027-03-06");

    await page.goto("/grid");

    await expect(page.getByRole("list", { name: "Shows del viernes 05/03" }).getByRole("listitem")).toHaveCount(2);
    await expect(page.getByRole("list", { name: "Shows del sábado 06/03" }).getByRole("listitem")).toHaveCount(1);
  });

  test("warns about overlapping shows and keeps both (AC-41, AC-43)", async ({ page }) => {
    await addFromLineup(page, "Tiger Mood");
    await addFromLineup(page, "Victoria Whynot");

    await page.goto("/grid");

    await expect(gridItems(page)).toHaveCount(2);
    await expect(
      page.getByRole("status").filter({ hasText: "Tiger Mood se superpone con Victoria Whynot" }),
    ).toBeVisible();
  });

  test("does not warn when shows only touch (AC-42)", async ({ page }) => {
    await addFromLineup(page, "Tiger Mood");
    await addFromLineup(page, "Mora Fisz");

    await page.goto("/grid");

    await expect(gridItems(page)).toHaveCount(2);
    await expect(page.getByText(/se superpone con/)).toHaveCount(0);
  });
});

test("one person cannot see another person's grid (AC-101)", async ({ browser }) => {
  const ana = await (await browser.newContext()).newPage();
  await signUp(ana);
  await addFromLineup(ana, "Tiger Mood");

  const beto = await (await browser.newContext()).newPage();
  await signUp(beto);
  await beto.goto("/grid");

  await expect(beto.getByText("Tiger Mood")).toHaveCount(0);
  await expect(beto.getByText("Todavía no agregaste shows")).toBeVisible();
});
