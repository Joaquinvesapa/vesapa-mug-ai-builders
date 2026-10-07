import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { auth } from "@/auth";
import { prisma } from "@/server/db";

export type CurrentUser = { id: string; email: string | null; username: string | null };

/** The signed-in user as stored now, or null. Deduplicated per request. */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) return null;
  // A JWT can outlive its account; the database is the source of truth.
  return prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, username: true },
  });
});

/**
 * Gate for every protected page and action (RF-65): anonymous visitors go to
 * login, and people without a username go to the welcome step (RF-11).
 */
export async function requireUser(): Promise<CurrentUser & { username: string }> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.username) redirect("/welcome");
  return { ...user, username: user.username };
}
