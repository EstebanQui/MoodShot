import { PrismaClient } from '../generated/prisma'
import { config } from 'dotenv'

// Load test environment variables if in test mode
if (process.env.NODE_ENV === 'test') {
  config({ path: '.env.test' })
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma 