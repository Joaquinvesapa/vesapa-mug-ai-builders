import { afterAll, describe, expect, it } from "vitest";
import { prisma } from "@/server/db";

describe("test database", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("connects to festival_test, never to the development database", async () => {
    const [row] = await prisma.$queryRaw<
      { name: string }[]
    >`SELECT current_database() AS name`;

    expect(row.name).toBe("festival_test");
  });
});
