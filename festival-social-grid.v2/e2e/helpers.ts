import { expect, type Page } from "@playwright/test";
import { latestMessageTo } from "../src/test/integration/mailpit";

export const uniqueEmail = () =>
  `e2e-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;

export const uniqueUsername = () =>
  `u${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export async function readCode(email: string): Promise<string> {
  await expect.poll(() => latestMessageTo(email)).not.toBeNull();
  return /\b(\d{6})\b/.exec((await latestMessageTo(email))!.text)![1];
}

export async function signInWithEmail(page: Page, email: string): Promise<void> {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByRole("button", { name: "Enviar código" }).click();
  await page.getByLabel("Código").fill(await readCode(email));
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
}

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
