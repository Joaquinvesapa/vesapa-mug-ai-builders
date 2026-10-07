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
