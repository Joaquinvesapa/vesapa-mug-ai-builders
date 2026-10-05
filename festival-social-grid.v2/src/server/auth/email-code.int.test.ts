import { afterAll, beforeEach, describe, expect, it } from "vitest";
import {
  requestEmailCode,
  verifyEmailCode,
  type EmailCodeDeps,
} from "@/server/auth/email-code";
import { prisma } from "@/server/db";
import type { EmailMessage } from "@/server/email/email-sender";
import { resetDatabase } from "@/test/integration/reset-database";

const EMAIL = "ana@example.com";
const T0 = new Date("2026-11-20T23:00:00.000Z");
const at = (ms: number) => new Date(T0.getTime() + ms);
const MIN = 60_000;

let sent: EmailMessage[];
const deps = (now: Date): EmailCodeDeps => ({
  now: () => now,
  sender: { send: async (m) => void sent.push(m) },
});

const lastCode = () => /\b(\d{6})\b/.exec(sent.at(-1)!.text)![1];
const wrong = (code: string) => (code === "000000" ? "111111" : "000000");

async function requestCode(now = T0) {
  await requestEmailCode(EMAIL, deps(now));
  return lastCode();
}

describe("email sign-in codes", () => {
  beforeEach(async () => {
    sent = [];
    await resetDatabase();
  });
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("emails a code of exactly six digits (AC-06)", async () => {
    const result = await requestEmailCode(EMAIL, deps(T0));

    expect(result).toEqual({ ok: true });
    expect(sent).toHaveLength(1);
    expect(sent[0].to).toBe(EMAIL);
    expect(lastCode()).toMatch(/^\d{6}$/);
  });

  it("never stores the code in plain text", async () => {
    const code = await requestCode();

    const [row] = await prisma.emailCode.findMany();
    expect(row.codeHash).not.toContain(code);
  });

  it("issues a different code on each request (AC-09)", async () => {
    const codes = new Set<string>();
    for (let i = 0; i < 5; i++) codes.add(await requestCode(at(i * MIN)));

    // Each code differs from the previous one; with 5 draws, all distinct.
    expect(codes.size).toBe(5);
  });

  it("creates the account on first verification of a new email (AC-07)", async () => {
    const code = await requestCode();

    const user = await verifyEmailCode(EMAIL, code, deps(at(MIN)));

    expect(user?.email).toBe(EMAIL);
    expect(await prisma.user.count()).toBe(1);
  });

  it("signs in an existing account without duplicating it (AC-08)", async () => {
    const existing = await prisma.user.create({ data: { email: EMAIL } });
    const code = await requestCode();

    const user = await verifyEmailCode(EMAIL, code, deps(at(MIN)));

    expect(user?.id).toBe(existing.id);
    expect(await prisma.user.count()).toBe(1);
  });

  it("treats emails case-insensitively", async () => {
    await requestEmailCode("Ana@Example.com", deps(T0));

    const user = await verifyEmailCode(" ANA@example.com ", lastCode(), deps(at(MIN)));

    expect(user?.email).toBe(EMAIL);
  });

  it("accepts a code at 9 min 59 s (AC-15)", async () => {
    const code = await requestCode();

    expect(await verifyEmailCode(EMAIL, code, deps(at(10 * MIN - 1000)))).not.toBeNull();
  });

  it("rejects a code at exactly 10 min (AC-16)", async () => {
    const code = await requestCode();

    expect(await verifyEmailCode(EMAIL, code, deps(at(10 * MIN)))).toBeNull();
  });

  it("rejects a code after its first successful use (AC-17)", async () => {
    const code = await requestCode();
    await verifyEmailCode(EMAIL, code, deps(at(MIN)));

    expect(await verifyEmailCode(EMAIL, code, deps(at(2 * MIN)))).toBeNull();
  });

  it("accepts the right code after 4 failed attempts (AC-18)", async () => {
    const code = await requestCode();
    for (let i = 0; i < 4; i++) {
      expect(await verifyEmailCode(EMAIL, wrong(code), deps(at(MIN)))).toBeNull();
    }

    expect(await verifyEmailCode(EMAIL, code, deps(at(MIN)))).not.toBeNull();
  });

  it("rejects the right code after 5 failed attempts (AC-19)", async () => {
    const code = await requestCode();
    for (let i = 0; i < 5; i++) {
      await verifyEmailCode(EMAIL, wrong(code), deps(at(MIN)));
    }

    expect(await verifyEmailCode(EMAIL, code, deps(at(MIN)))).toBeNull();
  });

  it("only accepts the latest code for an email", async () => {
    const first = await requestCode();
    await requestCode(at(MIN));

    expect(await verifyEmailCode(EMAIL, first, deps(at(2 * MIN)))).toBeNull();
  });

  it("rejects a 6th request within 15 min and sends nothing (AC-20)", async () => {
    for (let i = 0; i < 5; i++) await requestCode(at(i * MIN));

    const result = await requestEmailCode(EMAIL, deps(at(14 * MIN)));

    expect(result).toEqual({ ok: false, reason: "rate_limited" });
    expect(sent).toHaveLength(5);
  });

  it("accepts requests again once the 15 min window has passed", async () => {
    for (let i = 0; i < 5; i++) await requestCode(T0);

    const result = await requestEmailCode(EMAIL, deps(at(15 * MIN)));

    expect(result).toEqual({ ok: true });
  });

  it("answers the same for registered and unregistered emails (AC-21)", async () => {
    await prisma.user.create({ data: { email: "registered@example.com" } });

    const registered = await requestEmailCode("registered@example.com", deps(T0));
    const unregistered = await requestEmailCode("new@example.com", deps(T0));

    expect(registered).toEqual(unregistered);
  });

  it("rejects a malformed email without sending", async () => {
    const result = await requestEmailCode("not-an-email", deps(T0));

    expect(result).toEqual({ ok: false, reason: "invalid_email" });
    expect(sent).toHaveLength(0);
  });
});
