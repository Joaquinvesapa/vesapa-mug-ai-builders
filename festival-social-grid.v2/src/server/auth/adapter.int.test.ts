import type { AdapterAccount } from "next-auth/adapters";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { authAdapter } from "@/server/auth/adapter";
import { prisma } from "@/server/db";
import { resetDatabase } from "@/test/integration/reset-database";

const googleAccount = (userId: string): AdapterAccount => ({
  userId,
  type: "oidc",
  provider: "google",
  providerAccountId: "google-123",
});

describe("Auth.js Prisma adapter on Prisma 7", () => {
  beforeEach(resetDatabase);
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("creates a user and links a Google account on first sign-in (AC-05)", async () => {
    const user = await authAdapter.createUser!({
      id: "ignored",
      email: "ana@example.com",
      emailVerified: null,
    });
    await authAdapter.linkAccount!(googleAccount(user.id));

    const found = await authAdapter.getUserByAccount!({
      provider: "google",
      providerAccountId: "google-123",
    });

    expect(found?.email).toBe("ana@example.com");
  });

  it("finds an existing user by email without duplicating it", async () => {
    await prisma.user.create({ data: { email: "ana@example.com" } });

    const found = await authAdapter.getUserByEmail!("ana@example.com");

    expect(found).not.toBeNull();
    expect(await prisma.user.count()).toBe(1);
  });
});
