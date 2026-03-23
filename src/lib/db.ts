import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Only create Prisma client if DATABASE_URL is defined
export const db = process.env.DATABASE_URL 
  ? (globalForPrisma.prisma ?? new PrismaClient())
  : null;

if (process.env.NODE_ENV !== 'production' && process.env.DATABASE_URL) {
  globalForPrisma.prisma = db as PrismaClient;
}
