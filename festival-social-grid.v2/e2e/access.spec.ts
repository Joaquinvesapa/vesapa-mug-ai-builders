import { expect, test } from "@playwright/test";
import { readCode, signInWithEmail, uniqueEmail, uniqueUsername } from "./helpers";

test("redirects an anonymous visitor to login without exposing content (AC-98)", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("button", { name: "Entrar con Google" })).toBeVisible();
});

test("asks for a username on first access and blocks the app until set (AC-11)", async ({
  page,
}) => {
  await signInWithEmail(page, uniqueEmail());
  await expect(page).toHaveURL(/\/welcome$/);

  await page.goto("/");
  await expect(page).toHaveURL(/\/welcome$/);

  const username = uniqueUsername();
  await page.getByLabel("Nombre de usuario").fill(username);
  await page.getByRole("button", { name: "Guardar" }).click();

  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { name: `Hola, ${username}` })).toBeVisible();
});

test("shows why a username was rejected (AC-13)", async ({ page }) => {
  await signInWithEmail(page, uniqueEmail());
  await expect(page).toHaveURL(/\/welcome$/);

  await page.getByLabel("Nombre de usuario").fill("ab");
  await page.getByRole("button", { name: "Guardar" }).click();

  await expect(page.getByRole("alert").filter({ hasText: "El nombre de usuario debe tener entre 3 y 30 caracteres." })).toBeVisible();
  await expect(page).toHaveURL(/\/welcome$/);
});

test("shows an error for a wrong code and stays on login", async ({ page }) => {
  const email = uniqueEmail();
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByRole("button", { name: "Enviar código" }).click();
  const code = await readCode(email);

  await page.getByLabel("Código").fill(code === "000000" ? "111111" : "000000");
  await page.getByRole("button", { name: "Entrar", exact: true }).click();

  await expect(page.getByRole("alert").filter({ hasText: "El código no es válido o venció." })).toBeVisible();
});

test("denies authenticated content after signing out (AC-10)", async ({ page }) => {
  await signInWithEmail(page, uniqueEmail());
  await page.getByLabel("Nombre de usuario").fill(uniqueUsername());
  await page.getByRole("button", { name: "Guardar" }).click();
  await expect(page).toHaveURL(/\/$/);

  await page.goto("/profile");
  await page.getByRole("button", { name: "Cerrar sesión" }).click();
  await expect(page).toHaveURL(/\/login$/);

  await page.goto("/");
  await expect(page).toHaveURL(/\/login$/);
});
