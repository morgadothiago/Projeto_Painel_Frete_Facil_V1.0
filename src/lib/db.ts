import { PrismaClient } from "@prisma/client";

// Singleton — evita múltiplas conexões no hot reload do Next.js dev
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["error"] : ["error"],
});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
