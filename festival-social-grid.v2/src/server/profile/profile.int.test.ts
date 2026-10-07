import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/server/db";
import { getProfile, updateAvatar } from "@/server/profile/profile";
import { setUsername } from "@/server/profile/username";
import { resetDatabase } from "@/test/integration/reset-database";

let ana: string;
let beto: string;

describe("profile", () => {
  beforeEach(async () => {
    await resetDatabase();
    ana = (await prisma.user.create({ data: { email: "ana@example.com" } })).id;
    beto = (await prisma.user.create({ data: { email: "beto@example.com" } })).id;
    await setUsername(ana, "Ana");
    await setUsername(beto, "Beto");
  });
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("returns the owner's full profile with a default avatar (AC-23)", async () => {
    expect(await getProfile(ana)).toEqual({
      email: "ana@example.com",
      username: "Ana",
      avatar: { shape: "circle", color: "#7c3aed" },
    });
  });

  it("shows the new username after a change (AC-24)", async () => {
    await setUsername(ana, "Anita");

    expect((await getProfile(ana))?.username).toBe("Anita");
  });

  it("saves a shape from the set (AC-25) and a new color (AC-26)", async () => {
    expect(await updateAvatar(ana, { shape: "hexagon", color: "#059669" })).toEqual({ ok: true });

    expect((await getProfile(ana))?.avatar).toEqual({ shape: "hexagon", color: "#059669" });
  });

  it("rejects a shape outside the set", async () => {
    expect(await updateAvatar(ana, { shape: "blob", color: "#059669" })).toEqual({
      ok: false,
      reason: "invalid_shape",
    });
  });

  it.each(["#10b981", "#ffffff", "red", "#gggggg", ""])("rejects the color %j outside the palette", async (color) => {
    expect(await updateAvatar(ana, { shape: "circle", color })).toEqual({
      ok: false,
      reason: "invalid_color",
    });
  });

  it("only changes the owner's avatar, never another person's (AC-30)", async () => {
    await updateAvatar(ana, { shape: "star", color: "#db2777" });

    expect((await getProfile(beto))?.avatar).toEqual({ shape: "circle", color: "#7c3aed" });
  });
});
