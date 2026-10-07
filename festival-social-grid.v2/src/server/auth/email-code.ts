import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import { prisma } from "@/server/db";
import type { EmailSender } from "@/server/email/email-sender";

const CODE_TTL_MS = 10 * 60_000; // RNF-08
const MAX_FAILED_ATTEMPTS = 5; // RNF-10
const MAX_REQUESTS = 5; // RNF-11
const REQUEST_WINDOW_MS = 15 * 60_000; // RNF-11

export type EmailCodeDeps = {
  /** Server UTC instant; injectable so tests can probe the exact limits. */
  now: () => Date;
  sender: EmailSender;
  /** HMAC key, so a leaked table cannot be brute-forced offline. */
  secret?: string;
};

export type RequestEmailCodeResult =
  | { ok: true }
  | { ok: false; reason: "invalid_email" | "rate_limited" };

export type VerifiedUser = { id: string; email: string | null };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(raw: string): string | null {
  const email = raw.trim().toLowerCase();
  return email.length <= 254 && EMAIL_PATTERN.test(email) ? email : null;
}

function hashCode(email: string, code: string, secret?: string): string {
  const key = secret ?? process.env.AUTH_SECRET;
  if (!key) throw new Error("AUTH_SECRET is not set");
  return createHmac("sha256", key).update(`${email}:${code}`).digest("hex");
}

function sameHash(a: string, b: string): boolean {
  return a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

function generateCode(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

/**
 * Issues and emails a new code. The response never depends on whether the
 * email has an account, so it cannot be used to enumerate users (RNF-12).
 */
export async function requestEmailCode(
  rawEmail: string,
  deps: EmailCodeDeps,
): Promise<RequestEmailCodeResult> {
  const email = normalizeEmail(rawEmail);
  if (!email) return { ok: false, reason: "invalid_email" };

  const now = deps.now();
  const code = await prisma.$transaction(async (tx) => {
    // Serializes concurrent requests for one email so the limit holds.
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${email}))`;

    const recent = await tx.emailCode.findMany({
      where: {
        email,
        createdAt: { gt: new Date(now.getTime() - REQUEST_WINDOW_MS) },
      },
    });
    if (recent.length >= MAX_REQUESTS) return null;

    const previous = await tx.emailCode.findFirst({
      where: { email },
      orderBy: { createdAt: "desc" },
    });
    // RF-08: never repeat the previous code.
    let code = generateCode();
    while (previous && sameHash(previous.codeHash, hashCode(email, code, deps.secret))) {
      code = generateCode();
    }

    await tx.emailCode.create({
      data: {
        email,
        codeHash: hashCode(email, code, deps.secret),
        expiresAt: new Date(now.getTime() + CODE_TTL_MS),
        createdAt: now,
      },
    });
    return code;
  });

  if (!code) return { ok: false, reason: "rate_limited" };

  await deps.sender.send({
    to: email,
    subject: "Tu código para entrar",
    text: `Tu código es ${code}. Vence en 10 minutos.`,
  });
  return { ok: true };
}

/**
 * Checks a code against the latest one issued for the email and, on success,
 * returns the account, creating it on first sign-in (RF-07, RF-09).
 */
export async function verifyEmailCode(
  rawEmail: string,
  code: string,
  deps: Pick<EmailCodeDeps, "now" | "secret">,
): Promise<VerifiedUser | null> {
  const email = normalizeEmail(rawEmail);
  if (!email || !/^\d{6}$/.test(code)) return null;

  const now = deps.now();
  const latest = await prisma.emailCode.findFirst({
    where: { email },
    orderBy: { createdAt: "desc" },
  });
  if (
    !latest ||
    latest.usedAt ||
    latest.expiresAt <= now ||
    latest.failedAttempts >= MAX_FAILED_ATTEMPTS
  ) {
    return null;
  }

  if (!sameHash(latest.codeHash, hashCode(email, code, deps.secret))) {
    await prisma.emailCode.update({
      where: { id: latest.id },
      data: { failedAttempts: { increment: 1 } },
    });
    return null;
  }

  // Conditional update: only one concurrent verification can consume it.
  const consumed = await prisma.emailCode.updateMany({
    where: {
      id: latest.id,
      usedAt: null,
      failedAttempts: { lt: MAX_FAILED_ATTEMPTS },
    },
    data: { usedAt: now },
  });
  if (consumed.count === 0) return null;

  const user = await prisma.user.upsert({
    where: { email },
    create: { email, emailVerified: now },
    update: {},
    select: { id: true, email: true },
  });
  return user;
}
