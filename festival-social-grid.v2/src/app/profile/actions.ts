"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth/current-user";
import { updateAvatar } from "@/server/profile/profile";
import { setUsername, USERNAME_ERRORS } from "@/server/profile/username";

export type FormState = { error?: string; saved?: boolean };

// Server Actions are public POST endpoints: the owner always comes from the
// session, never from the form (RF-70).
async function ownerId(): Promise<string> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user.id;
}

export async function saveUsername(_prev: FormState, formData: FormData): Promise<FormState> {
  const result = await setUsername(await ownerId(), String(formData.get("username") ?? ""));
  if (!result.ok) return { error: USERNAME_ERRORS[result.reason] };
  refresh();
  return { saved: true };
}

export async function saveAvatar(_prev: FormState, formData: FormData): Promise<FormState> {
  const result = await updateAvatar(await ownerId(), {
    shape: String(formData.get("shape") ?? ""),
    color: String(formData.get("color") ?? ""),
  });
  if (!result.ok) {
    return {
      error: result.reason === "invalid_shape" ? "Elegí una forma de la lista." : "Elegí un color de la paleta.",
    };
  }
  refresh();
  return { saved: true };
}
