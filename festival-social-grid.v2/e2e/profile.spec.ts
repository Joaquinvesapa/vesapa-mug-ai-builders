import { expect, test } from "@playwright/test";
import { signUp, uniqueUsername } from "./helpers";

test("anonymous visitors cannot see a profile", async ({ page }) => {
  await page.goto("/profile");

  await expect(page).toHaveURL(/\/login$/);
});

test.describe("own profile", () => {
  let username: string;

  test.beforeEach(async ({ page }) => {
    username = await signUp(page);
    await page.goto("/profile");
  });

  test("shows the full profile (AC-23)", async ({ page }) => {
    await expect(page.getByRole("heading", { name: username })).toBeVisible();
    await expect(page.getByText(/@example\.com$/)).toBeVisible();
    await expect(page.getByRole("img", { name: "Avatar: Círculo" }).first()).toBeVisible();
  });

  test("changes the username (AC-24)", async ({ page }) => {
    const next = uniqueUsername();
    await page.getByLabel("Nombre de usuario").fill(next);
    await page.getByRole("button", { name: "Guardar nombre" }).click();

    await expect(page.getByRole("heading", { name: next })).toBeVisible();
  });

  test("rejects an invalid username and keeps the old one", async ({ page }) => {
    await page.getByLabel("Nombre de usuario").fill("ab");
    await page.getByRole("button", { name: "Guardar nombre" }).click();

    await expect(
      page.getByRole("alert").filter({ hasText: "entre 3 y 30 caracteres" }),
    ).toBeVisible();
    await page.reload();
    await expect(page.getByRole("heading", { name: username })).toBeVisible();
  });

  test("picks a shape (AC-25) and a color (AC-26)", async ({ page }) => {
    await page.getByRole("radio", { name: "Hexágono" }).check();
    await page.getByLabel("Color").fill("#10b981");
    await page.getByRole("button", { name: "Guardar avatar" }).click();
    const saved = page.getByRole("link", { name: "Mi perfil" }).getByRole("img");
    await expect(saved).toHaveAccessibleName("Avatar: Hexágono");

    await page.reload();
    await expect(saved).toHaveAccessibleName("Avatar: Hexágono");
    await expect(saved.locator("path")).toHaveAttribute("fill", "#10b981");
  });
});

test("one person never sees another person's profile (AC-29)", async ({ browser }) => {
  const ana = await (await browser.newContext()).newPage();
  const anaName = await signUp(ana);

  const beto = await (await browser.newContext()).newPage();
  await signUp(beto);
  await beto.goto("/profile");

  await expect(beto.getByText(anaName)).toHaveCount(0);
});
