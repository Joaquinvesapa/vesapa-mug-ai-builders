"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth/current-user";
import { setUsername } from "@/server/profile/username";

export type WelcomeState = { error?: string };

const ERRORS = {
  invalid_length: "El nombre de usuario debe tener entre 3 y 30 caracteres.",
  taken: "Ese nombre de usuario ya está en uso.",
} as const;

export async function saveUsername(
  _prev: WelcomeState,
  formData: FormData,
): Promise<WelcomeState> {
  // Server Actions are public POST endpoints; check the session here too.
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const result = await setUsername(user.id, String(formData.get("username") ?? ""));
  if (!result.ok) return { error: ERRORS[result.reason] };
  redirect("/");
}
