"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth/current-user";
import { addSelection, removeSelection } from "@/server/grid/selections";

// Server Actions are public POST endpoints: the owner always comes from the
// session, never from the form (RF-66).
async function ownerId(): Promise<string> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.username) redirect("/welcome");
  return user.id;
}

export async function toggleSelection(formData: FormData): Promise<void> {
  const userId = await ownerId();
  const showId = String(formData.get("showId") ?? "");
  if (formData.get("selected") === "true") {
    await removeSelection(userId, showId);
  } else {
    await addSelection(userId, showId);
  }
  refresh();
}
