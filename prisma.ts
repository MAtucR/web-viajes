// src/lib/prisma.ts
//
// Singleton del Prisma Client.
// En desarrollo, Next.js recarga los módulos con HMR y sin esto
// se crean múltiples conexiones a la DB agotando el connection pool.

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
