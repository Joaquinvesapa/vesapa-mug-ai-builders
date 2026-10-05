import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Adapter } from "next-auth/adapters";
import { prisma } from "@/server/db";

export const authAdapter: Adapter = PrismaAdapter(prisma);
