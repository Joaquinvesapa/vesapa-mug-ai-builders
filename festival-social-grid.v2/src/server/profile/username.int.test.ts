import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/server/db";
import { setUsername } from "@/server/profile/username";
import { resetDatabase } from "@/test/integration/reset-database";

const newUser = (email: string) => prisma.user.create({ data: { email } });

describe("setUsername", () => {
  beforeEach(resetDatabase);
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it.each([3, 30])("accepts a username of %i characters (AC-12)", async (length) => {
    const user = await newUser("a@example.com");
    const username = "a".repeat(length);

    expect(await setUsername(user.id, username)).toEqual({ ok: true, username });
    const saved = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
    expect(saved.username).toBe(username);
  });

  it.each([2, 31])("rejects a username of %i characters (AC-13)", async (length) => {
    const user = await newUser("a@example.com");

    expect(await setUsername(user.id, "a".repeat(length))).toEqual({
      ok: false,
      reason: "invalid_length",
    });
    const saved = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
    expect(saved.username).toBeNull();
  });

  it("counts characters, not bytes", async () => {
    const user = await newUser("a@example.com");

    expect(await setUsername(user.id, "ñ".repeat(30))).toMatchObject({ ok: true });
  });

  it("ignores surrounding whitespace", async () => {
    const user = await newUser("a@example.com");

    expect(await setUsername(user.id, "  Ana  ")).toEqual({ ok: true, username: "Ana" });
    expect(await setUsername(user.id, "  ab  ")).toMatchObject({ ok: false });
  });

  it("rejects a username taken with different case (AC-14)", async () => {
    const ana = await newUser("ana@example.com");
    const other = await newUser("other@example.com");
    await setUsername(ana.id, "Ana");

    expect(await setUsername(other.id, "aNA")).toEqual({
      ok: false,
      reason: "taken",
    });
  });

  it("lets a person keep their own username with different case", async () => {
    const ana = await newUser("ana@example.com");
    await setUsername(ana.id, "Ana");

    expect(await setUsername(ana.id, "ANA")).toEqual({ ok: true, username: "ANA" });
  });
});
