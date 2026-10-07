import { expect, test, type Page } from "@playwright/test";
import { signUp } from "./helpers";

// Shows from data/lineup-lollapalooza-2027.csv (Friday 2027-03-05).

/** Width and height from the PNG IHDR chunk. */
function pngSize(body: Buffer): { width: number; height: number } {
  expect(body.subarray(1, 4).toString()).toBe("PNG");
  return { width: body.readUInt32BE(16), height: body.readUInt32BE(20) };
}

async function addFromLineup(page: Page, artist: string) {
  await page.goto("/lineup?day=2027-03-05");
  const item = page.getByRole("list", { name: "Shows" }).getByRole("listitem").filter({ hasText: artist });
  await item.getByRole("button", { name: `Agregar ${artist} a mi grilla` }).click();
  await expect(item.getByRole("button", { name: `Quitar ${artist} de mi grilla` })).toBeVisible();
}

test("anonymous visitors cannot get an export (AC-100)", async ({ request }) => {
  const response = await request.get("/grid/export?day=2027-03-05&size=story", {
    maxRedirects: 0,
  });

  expect(response.status()).toBe(401);
  expect(response.headers()["content-type"]).not.toContain("image/png");
});

test.describe("personal export", () => {
  test.beforeEach(async ({ page }) => {
    await signUp(page);
    await addFromLineup(page, "Tiger Mood");
    await addFromLineup(page, "Mora Fisz");
  });

  test("downloads a 1080 × 1920 PNG (AC-87)", async ({ page }) => {
    const response = await page.request.get("/grid/export?day=2027-03-05&size=story");

    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toBe("image/png");
    expect(response.headers()["content-disposition"]).toContain("attachment");
    expect(pngSize(await response.body())).toEqual({ width: 1080, height: 1920 });
  });

  test("downloads a 1080 × 1350 PNG (AC-88)", async ({ page }) => {
    const response = await page.request.get("/grid/export?day=2027-03-05&size=portrait");

    expect(pngSize(await response.body())).toEqual({ width: 1080, height: 1350 });
  });

  test("returns 404 for a day without selected shows", async ({ page }) => {
    const response = await page.request.get("/grid/export?day=2027-03-06&size=story");

    expect(response.status()).toBe(404);
  });

  for (const query of ["day=2027-03-05", "day=2027-03-05&size=huge", "day=nope&size=story", "size=story"]) {
    test(`rejects the invalid query ${query}`, async ({ page }) => {
      const response = await page.request.get(`/grid/export?${query}`);

      expect(response.status()).toBe(400);
    });
  }

  test("downloads the chosen day from the grid screen", async ({ page }) => {
    await page.goto("/grid");
    await page.getByLabel("Día").selectOption("2027-03-05");
    await page.getByLabel("Formato").selectOption("portrait");

    const download = page.waitForEvent("download");
    await page.getByRole("button", { name: "Descargar PNG" }).click();

    expect((await download).suggestedFilename()).toBe("mi-grilla-2027-03-05.png");
  });
});
