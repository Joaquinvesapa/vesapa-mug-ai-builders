import {
  DEFAULT_AVATAR,
  isAvatarShape,
  normalizeAvatarColor,
  type Avatar,
} from "@/lib/avatar";
import { prisma } from "@/server/db";

// Both functions take the owner's id from the session, never from the
// request: nobody can read or change someone else's full profile (RF-70).

export type Profile = { email: string | null; username: string | null; avatar: Avatar };

export async function getProfile(userId: string): Promise<Profile | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, username: true, avatarShape: true, avatarColor: true },
  });
  if (!user) return null;
  return {
    email: user.email,
    username: user.username,
    avatar: {
      shape: isAvatarShape(user.avatarShape) ? user.avatarShape : DEFAULT_AVATAR.shape,
      color: normalizeAvatarColor(user.avatarColor) ?? DEFAULT_AVATAR.color,
    },
  };
}

export type UpdateAvatarResult =
  | { ok: true }
  | { ok: false; reason: "invalid_shape" | "invalid_color" };

export async function updateAvatar(
  userId: string,
  input: { shape: string; color: string },
): Promise<UpdateAvatarResult> {
  if (!isAvatarShape(input.shape)) return { ok: false, reason: "invalid_shape" };
  const color = normalizeAvatarColor(input.color);
  if (!color) return { ok: false, reason: "invalid_color" };

  await prisma.user.update({
    where: { id: userId },
    data: { avatarShape: input.shape, avatarColor: color },
  });
  return { ok: true };
}
