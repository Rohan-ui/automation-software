import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  process.env.NODE_ENV === "production" && !process.env.DATABASE_URL
    ? (null as any) // Fallback for build time when DATABASE_URL might not be available
    : (globalForPrisma.prisma ?? new PrismaClient())

if (process.env.NODE_ENV !== "production" && prisma) {
  globalForPrisma.prisma = prisma
}
