import { createHmac, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/server/db";
import { normalizeUsername, usernameKey } from "@/server/profile/username";

export const MAX_FAILED_ATTEMPTS = 5; // RNF-10
export const LOCKOUT_MS = 15 * 60_000; // RNF-10

const PIN_PATTERN = /^\d{6}$/; // RNF-08

export type PinDeps = { now: () => Date; secret?: string };

export type PinUser = { id: string; username: string };

export type PinSignInResult =
  | { ok: true; user: PinUser }
  // "rejected" covers wrong PIN, lockout and Google accounts alike (RNF-12).
  | { ok: false; reason: "invalid_pin" | "invalid_username" | "rejected" };

export type PinAccountKind = "existing" | "new" | "google" | "invalid";

const scryptAsync = promisify(scrypt) as (
  password: Buffer,
  salt: Buffer,
  keylen: number,
) => Promise<Buffer>;

// A 6-digit PIN is trivially brute-forced offline, so it is first keyed with
// a server secret (pepper) kept out of the database, then stretched.
function pepper(pin: string, secret?: string): Buffer {
  const key = secret ?? process.env.AUTH_SECRET;
  if (!key) throw new Error("AUTH_SECRET is not set");
  return createHmac("sha256", key).update(pin).digest();
}

async function hashPin(pin: string, secret?: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scryptAsync(pepper(pin, secret), salt, 32);
  return `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`;
}

async function pinMatches(pin: string, stored: string, secret?: string) {
  const [, salt, hash] = stored.split("$");
  const expected = Buffer.from(hash, "hex");
  const actual = await scryptAsync(pepper(pin, secret), Buffer.from(salt, "hex"), 32);
  return timingSafeEqual(actual, expected);
}

/** Lets the login form ask for the PIN or offer to create the account. */
export async function lookupPinAccount(rawUsername: string): Promise<PinAccountKind> {
  const username = normalizeUsername(rawUsername);
  if (!username) return "invalid";
  const user = await prisma.user.findUnique({
    where: { usernameKey: usernameKey(username) },
    select: { pinHash: true },
  });
  if (!user) return "new";
  return user.pinHash ? "existing" : "google";
}

/**
 * Signs in with username + PIN, creating the account the first time the
 * username is used (RF-06, RF-07, RF-09).
 */
export async function signInWithPin(
  rawUsername: string,
  pin: string,
  deps: PinDeps,
): Promise<PinSignInResult> {
  if (!PIN_PATTERN.test(pin)) return { ok: false, reason: "invalid_pin" };
  const username = normalizeUsername(rawUsername);
  if (!username) return { ok: false, reason: "invalid_username" };
  const key = usernameKey(username);

  const existing = await verifyExisting(key, pin, deps);
  if (existing !== "missing") return existing;

  try {
    const user = await prisma.user.create({
      data: { username, usernameKey: key, pinHash: await hashPin(pin, deps.secret) },
      select: { id: true, username: true },
    });
    return { ok: true, user: { id: user.id, username: user.username! } };
  } catch (error) {
    // Someone created the same username meanwhile: verify against theirs.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const retry = await verifyExisting(key, pin, deps);
      return retry === "missing" ? { ok: false, reason: "rejected" } : retry;
    }
    throw error;
  }
}

async function verifyExisting(
  key: string,
  pin: string,
  deps: PinDeps,
): Promise<PinSignInResult | "missing"> {
  const now = deps.now();
  const rejected = { ok: false, reason: "rejected" } as const;

  // The row lock serializes attempts per user, so concurrent guesses cannot
  // slip past the failure limit.
  return prisma.$transaction(async (tx) => {
    const [user] = await tx.$queryRaw<
      {
        id: string;
        username: string;
        pinHash: string | null;
        pinFailedAttempts: number;
        pinLockedUntil: Date | null;
      }[]
    >`SELECT id, username, "pinHash", "pinFailedAttempts", "pinLockedUntil"
      FROM "User" WHERE "usernameKey" = ${key} FOR UPDATE`;
    if (!user) return "missing";
    if (!user.pinHash) return rejected;
    if (user.pinLockedUntil && user.pinLockedUntil > now) return rejected;

    if (await pinMatches(pin, user.pinHash, deps.secret)) {
      await tx.user.update({
        where: { id: user.id },
        data: { pinFailedAttempts: 0, pinLockedUntil: null },
      });
      return { ok: true, user: { id: user.id, username: user.username } };
    }

    const failures = user.pinFailedAttempts + 1;
    const locks = failures >= MAX_FAILED_ATTEMPTS;
    await tx.user.update({
      where: { id: user.id },
      data: {
        pinFailedAttempts: locks ? 0 : failures,
        pinLockedUntil: locks ? new Date(now.getTime() + LOCKOUT_MS) : null,
      },
    });
    return rejected;
  });
}
