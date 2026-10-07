import { expect, test } from "@playwright/test";
import { signUp } from "./helpers";

test("redirects an anonymous visitor to login without exposing content (AC-98)", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("button", { name: "Entrar con Google" })).toBeVisible();
});

test("denies authenticated content after signing out (AC-10)", async ({ page }) => {
  await signUp(page);

  await page.goto("/profile");
  await page.getByRole("button", { name: "Cerrar sesión" }).click();
  await expect(page).toHaveURL(/\/login$/);

  await page.goto("/");
  await expect(page).toHaveURL(/\/login$/);
});
