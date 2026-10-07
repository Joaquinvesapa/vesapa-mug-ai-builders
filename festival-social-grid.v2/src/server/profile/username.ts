import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/server/db";

export const USERNAME_MIN_LENGTH = 3; // RF-12
export const USERNAME_MAX_LENGTH = 30; // RF-12

export const USERNAME_ERRORS = {
  invalid_length: "El nombre de usuario debe tener entre 3 y 30 caracteres.",
  taken: "Ese nombre de usuario ya está en uso.",
} as const;

export type SetUsernameResult =
  | { ok: true; username: string }
  | { ok: false; reason: "invalid_length" | "taken" };

export async function setUsername(
  userId: string,
  raw: string,
): Promise<SetUsernameResult> {
  const username = raw.trim();
  // Spread counts code points, so "ñ" is one character.
  const length = [...username].length;
  if (length < USERNAME_MIN_LENGTH || length > USERNAME_MAX_LENGTH) {
    return { ok: false, reason: "invalid_length" };
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { username, usernameKey: username.toLowerCase() },
    });
    return { ok: true, username };
  } catch (error) {
    // The unique index on usernameKey enforces RF-13 even under races.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { ok: false, reason: "taken" };
    }
    throw error;
  }
}
