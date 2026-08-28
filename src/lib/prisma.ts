import { PrismaClient } from "@prisma/client";

/** Neon/Vercel injects POSTGRES_URL, not DATABASE_URL. Prisma only reads DATABASE_URL. */
const resolved =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL ||
  "";
if (resolved && !process.env.DATABASE_URL) {
  process.env.DATABASE_URL = resolved;
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
