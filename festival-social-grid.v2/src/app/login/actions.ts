"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { requestEmailCode } from "@/server/auth/email-code";
import { smtpEmailSenderFromEnv } from "@/server/email/smtp-email-sender";

export type LoginState =
  | { step: "email"; error?: string }
  | { step: "code"; email: string; error?: string };

export async function signInWithGoogle(): Promise<void> {
  await signIn("google", { redirectTo: "/" });
}

export async function requestCode(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "");
  const result = await requestEmailCode(email, {
    now: () => new Date(),
    sender: smtpEmailSenderFromEnv(),
  });

  if (result.ok) return { step: "code", email: email.trim() };
  return {
    step: "email",
    error:
      result.reason === "rate_limited"
        ? "Pediste demasiados códigos. Probá de nuevo en unos minutos."
        : "Ingresá un email válido.",
  };
}

export async function verifyCode(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "");
  const code = String(formData.get("code") ?? "").trim();
  try {
    await signIn("email-code", { email, code, redirectTo: "/" });
  } catch (error) {
    // signIn redirects by throwing; only auth failures are handled here.
    if (error instanceof AuthError) {
      return { step: "code", email, error: "El código no es válido o venció." };
    }
    throw error;
  }
  return { step: "code", email };
}
