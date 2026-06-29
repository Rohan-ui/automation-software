import { PrismaClient } from "@prisma/client"

// Validate at module load time — fail fast with a clear message
// rather than a cryptic TypeError at the first DB call
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL environment variable is not set. " +
    "Please configure it before starting the server."
  )
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  })

// Cache in globalThis for ALL environments so serverless functions
// (including production) reuse the same connection pool across invocations
// instead of creating a new pool on every hot function call.
globalForPrisma.prisma = prisma
