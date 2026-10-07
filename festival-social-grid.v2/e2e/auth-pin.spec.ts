import { expect, test } from "@playwright/test";
import { signInWithPin, uniqueUsername } from "./helpers";

const PIN = "482916";

test("creates the account with username and PIN on first access (AC-07)", async ({
  page,
}) => {
  const username = uniqueUsername();

  await signInWithPin(page, username, PIN);

  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { name: `Hola, ${username}` })).toBeVisible();
});

test("asks a registered username for its PIN (AC-08)", async ({ page }) => {
  const username = uniqueUsername();
  await signInWithPin(page, username, PIN);
  await expect(page).toHaveURL(/\/$/);
  await page.goto("/profile");
  await page.getByRole("button", { name: "Cerrar sesión" }).click();
  await expect(page).toHaveURL(/\/login$/);

  await page.getByLabel("Nombre de usuario").fill(username.toUpperCase());
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByLabel("PIN").fill(PIN);
  await page.getByRole("button", { name: "Entrar", exact: true }).click();

  await expect(page.getByRole("heading", { name: `Hola, ${username}` })).toBeVisible();
});

test("shows an error for a wrong PIN and stays on login (AC-09)", async ({ page }) => {
  const username = uniqueUsername();
  await signInWithPin(page, username, PIN);
  await expect(page).toHaveURL(/\/$/);
  await page.context().clearCookies();

  await page.goto("/login");
  await page.getByLabel("Nombre de usuario").fill(username);
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByLabel("PIN").fill("000000");
  await page.getByRole("button", { name: "Entrar", exact: true }).click();

  await expect(
    page.getByRole("alert").filter({ hasText: "El PIN no es correcto o la cuenta está bloqueada." }),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);
});

test("shows why a new username was rejected (AC-13)", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Nombre de usuario").fill("ab");
  await page.getByRole("button", { name: "Continuar" }).click();

  await expect(
    page.getByRole("alert").filter({ hasText: "El nombre de usuario debe tener entre 3 y 30 caracteres." }),
  ).toBeVisible();
});

test("rejects a PIN that is not 6 digits (AC-06)", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Nombre de usuario").fill(uniqueUsername());
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByLabel("PIN").fill("12345");
  await page.getByRole("button", { name: "Crear cuenta" }).click();

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: /Hola/ })).toHaveCount(0);
});
