"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth/current-user";
import { setUsername, USERNAME_ERRORS } from "@/server/profile/username";

export type WelcomeState = { error?: string };

export async function saveUsername(
  _prev: WelcomeState,
  formData: FormData,
): Promise<WelcomeState> {
  // Server Actions are public POST endpoints; check the session here too.
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const result = await setUsername(user.id, String(formData.get("username") ?? ""));
  if (!result.ok) return { error: USERNAME_ERRORS[result.reason] };
  redirect("/");
}
