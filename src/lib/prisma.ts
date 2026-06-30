import { PrismaClient } from "@prisma/client";

/*
 * Cliente Prisma como singleton.
 * En desarrollo Next recarga los módulos con frecuencia; sin el singleton se
 * crearían muchas conexiones. Se guarda en globalThis para reutilizarlo.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
