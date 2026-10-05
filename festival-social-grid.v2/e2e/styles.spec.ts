import { expect, test } from "@playwright/test";

test("applies Tailwind utilities to the page", async ({ page }) => {
  await page.goto("/login");

  const fontFamily = await page
    .locator("body")
    .evaluate((body) => getComputedStyle(body).fontFamily);

  expect(fontFamily).toMatch(/Geist/);
});
