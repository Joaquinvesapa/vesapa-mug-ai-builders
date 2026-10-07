import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { lookupPinAccount, signInWithPin } from "@/server/auth/pin";
import { prisma } from "@/server/db";
import { resetDatabase } from "@/test/integration/reset-database";

const T0 = new Date("2026-11-20T23:00:00.000Z");
const at = (ms: number) => new Date(T0.getTime() + ms);
const MIN = 60_000;
const SEC = 1_000;
const PIN = "482916";
const WRONG = "000000";

const signIn = (username: string, pin: string, now = T0) =>
  signInWithPin(username, pin, { now: () => now, secret: "test-secret" });

async function failTimes(username: string, times: number, now = T0) {
  for (let i = 0; i < times; i++) await signIn(username, WRONG, now);
}

describe("username + PIN sign-in", () => {
  beforeEach(resetDatabase);
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it.each(["12345", "1234567", "12a456", ""])(
    "rejects the malformed PIN %j (AC-06)",
    async (pin) => {
      expect(await signIn("ana", pin)).toEqual({ ok: false, reason: "invalid_pin" });
      expect(await prisma.user.count()).toBe(0);
    },
  );

  it("creates the account with that username on first sign-in (AC-07)", async () => {
    const result = await signIn("Ana", PIN);

    expect(result).toMatchObject({ ok: true, user: { username: "Ana" } });
    const saved = await prisma.user.findUniqueOrThrow({ where: { usernameKey: "ana" } });
    expect(saved.username).toBe("Ana");
    expect(saved.email).toBeNull();
  });

  it.each([2, 31])("rejects a new username of %i characters (AC-13)", async (length) => {
    expect(await signIn("a".repeat(length), PIN)).toEqual({
      ok: false,
      reason: "invalid_username",
    });
    expect(await prisma.user.count()).toBe(0);
  });

  it("signs in a registered username without duplicating it, case-insensitively (AC-08)", async () => {
    const created = await signIn("Ana", PIN);

    const again = await signIn("aNA", PIN);

    expect(again).toEqual(created);
    expect(await prisma.user.count()).toBe(1);
  });

  it("rejects a wrong PIN for a registered username (AC-09)", async () => {
    await signIn("ana", PIN);

    expect(await signIn("ana", WRONG)).toEqual({ ok: false, reason: "rejected" });
  });

  it("never stores the PIN in plain text (AC-20)", async () => {
    await signIn("ana", PIN);

    const saved = await prisma.user.findUniqueOrThrow({ where: { usernameKey: "ana" } });
    expect(saved.pinHash).toBeTruthy();
    expect(saved.pinHash).not.toContain(PIN);
  });

  it("rejects any PIN for an account created with Google (AC-21)", async () => {
    await prisma.user.create({
      data: { email: "ana@example.com", username: "ana", usernameKey: "ana" },
    });

    expect(await signIn("ana", PIN)).toEqual({ ok: false, reason: "rejected" });
    expect(await prisma.user.count()).toBe(1);
  });

  it("accepts the right PIN after 4 consecutive failures (AC-15)", async () => {
    await signIn("ana", PIN);
    await failTimes("ana", 4);

    expect(await signIn("ana", PIN)).toMatchObject({ ok: true });
  });

  it("rejects the right PIN within 15 min of the 5th failure (AC-16)", async () => {
    await signIn("ana", PIN);
    await failTimes("ana", 5);

    expect(await signIn("ana", PIN, at(15 * MIN - SEC))).toEqual({
      ok: false,
      reason: "rejected",
    });
  });

  it("accepts the right PIN 15 min 00 s after the 5th failure (AC-17)", async () => {
    await signIn("ana", PIN);
    await failTimes("ana", 5);

    expect(await signIn("ana", PIN, at(15 * MIN))).toMatchObject({ ok: true });
  });

  it("resets the failure count after a successful sign-in (AC-18)", async () => {
    await signIn("ana", PIN);
    await failTimes("ana", 4);
    await signIn("ana", PIN);
    await failTimes("ana", 4);

    expect(await signIn("ana", PIN)).toMatchObject({ ok: true });
  });

  it("answers a wrong PIN and a locked account the same way (AC-19)", async () => {
    await signIn("ana", PIN);
    const wrong = await signIn("ana", WRONG);
    await failTimes("ana", 4);

    const locked = await signIn("ana", PIN);

    expect(locked).toEqual(wrong);
  });

  it("does not let concurrent attempts exceed the 5-failure limit", async () => {
    await signIn("ana", PIN);
    await Promise.all(Array.from({ length: 8 }, () => signIn("ana", WRONG)));

    expect(await signIn("ana", PIN)).toEqual({ ok: false, reason: "rejected" });
  });

  it("tells the login form whether to ask for a PIN or to create one", async () => {
    await signIn("Ana", PIN);
    await prisma.user.create({
      data: { email: "g@example.com", username: "Gus", usernameKey: "gus" },
    });

    expect(await lookupPinAccount("aNA")).toBe("existing");
    expect(await lookupPinAccount("nueva")).toBe("new");
    expect(await lookupPinAccount("gus")).toBe("google");
    expect(await lookupPinAccount("ab")).toBe("invalid");
  });
});
