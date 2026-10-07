"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { lookupPinAccount } from "@/server/auth/pin";
import { USERNAME_ERRORS } from "@/server/profile/username";

export type PinLoginState =
  | { step: "username"; error?: string }
  | { step: "existing" | "new"; username: string; error?: string };

/** Advances the login form: username first, then the PIN. */
export async function pinLogin(
  prev: PinLoginState,
  formData: FormData,
): Promise<PinLoginState> {
  return prev.step === "username"
    ? continueWithUsername(formData)
    : submitPin(prev.step, formData);
}

async function continueWithUsername(formData: FormData): Promise<PinLoginState> {
  const username = String(formData.get("username") ?? "").trim();
  const kind = await lookupPinAccount(username);

  if (kind === "invalid") {
    return { step: "username", error: USERNAME_ERRORS.invalid_length };
  }
  if (kind === "google") {
    return { step: "username", error: "Esta cuenta entra con Google." };
  }
  return { step: kind, username };
}

async function submitPin(
  step: "existing" | "new",
  formData: FormData,
): Promise<PinLoginState> {
  const username = String(formData.get("username") ?? "");
  const pin = String(formData.get("pin") ?? "").trim();

  if (!/^\d{6}$/.test(pin)) {
    return { step, username, error: "El PIN debe tener exactamente 6 dígitos." };
  }
  try {
    await signIn("pin", { username, pin, redirectTo: "/" });
  } catch (error) {
    // signIn redirects by throwing; only auth failures are handled here.
    if (error instanceof AuthError) {
      return {
        step,
        username,
        error: "El PIN no es correcto o la cuenta está bloqueada.",
      };
    }
    throw error;
  }
  return { step, username };
}
