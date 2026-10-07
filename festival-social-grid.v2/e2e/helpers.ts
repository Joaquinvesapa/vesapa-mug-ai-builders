import { expect, type Page } from "@playwright/test";

export const uniqueUsername = () =>
  `u${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

/** Signs in with username + PIN; the first time, this creates the account. */
export async function signInWithPin(
  page: Page,
  username: string,
  pin: string,
): Promise<void> {
  await page.goto("/login");
  await page.getByLabel("Nombre de usuario").fill(username);
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByLabel("PIN").fill(pin);
  await page.getByRole("button", { name: /^(Entrar|Crear cuenta)$/ }).click();
}

/** Signs up a brand-new person and lands on the home page. */
export async function signUp(page: Page): Promise<string> {
  const username = uniqueUsername();
  await signInWithPin(page, username, "482916");
  await expect(page).toHaveURL(/\/$/);
  return username;
}
