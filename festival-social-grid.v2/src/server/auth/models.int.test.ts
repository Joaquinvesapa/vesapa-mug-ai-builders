import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/server/db";
import { resetDatabase } from "@/test/integration/reset-database";

describe("auth persistence", () => {
  beforeEach(resetDatabase);
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("rejects a second account with the same email", async () => {
    await prisma.user.create({ data: { email: "ana@example.com" } });

    await expect(
      prisma.user.create({ data: { email: "ana@example.com" } }),
    ).rejects.toThrow();
  });

  it("rejects a username that differs only in case (AC-14)", async () => {
    await prisma.user.create({
      data: { email: "a@example.com", username: "Ana", usernameKey: "ana" },
    });

    await expect(
      prisma.user.create({
        data: { email: "b@example.com", username: "aNA", usernameKey: "ana" },
      }),
    ).rejects.toThrow();
  });

  it("allows many users without a username yet", async () => {
    await prisma.user.create({ data: { email: "a@example.com" } });
    await prisma.user.create({ data: { email: "b@example.com" } });

    expect(await prisma.user.count()).toBe(2);
  });

  it("stores an email code with its expiry and attempt counter", async () => {
    const expiresAt = new Date("2026-11-20T03:10:00Z");
    const code = await prisma.emailCode.create({
      data: { email: "a@example.com", codeHash: "hash", expiresAt },
    });

    expect(code.failedAttempts).toBe(0);
    expect(code.usedAt).toBeNull();
    expect(code.expiresAt).toEqual(expiresAt);
  });

  it("links a Google account to its user", async () => {
    const user = await prisma.user.create({
      data: {
        email: "a@example.com",
        accounts: {
          create: {
            type: "oidc",
            provider: "google",
            providerAccountId: "google-123",
          },
        },
      },
      include: { accounts: true },
    });

    expect(user.accounts).toHaveLength(1);
  });
});
