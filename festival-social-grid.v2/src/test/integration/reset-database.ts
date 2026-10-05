import { prisma } from "@/server/db";

/** Empties every application table. Only for the test database. */
export async function resetDatabase(): Promise<void> {
  const [row] = await prisma.$queryRaw<
    { name: string }[]
  >`SELECT current_database() AS name`;
  if (row.name !== "festival_test") {
    throw new Error(`Refusing to reset database "${row.name}"`);
  }

  const tables = await prisma.$queryRaw<{ tablename: string }[]>`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'`;
  if (tables.length === 0) return;

  const list = tables.map((t) => `"public"."${t.tablename}"`).join(", ");
  await prisma.$executeRawUnsafe(`TRUNCATE ${list} CASCADE`);
}
