import { PrismaClient } from '../generated/prisma'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Load test environment variables if in test mode
if (process.env.NODE_ENV === 'test') {
  try {
    const envPath = resolve('.env.test')
    const envContent = readFileSync(envPath, 'utf8')
    
    // Parse the .env file
    envContent.split('\n').forEach(line => {
      const trimmedLine = line.trim()
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=')
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').replace(/^["']|["']$/g, '') // Remove quotes
          // Only set if not already set (prioritize environment variables)
          if (!process.env[key.trim()]) {
            process.env[key.trim()] = value
          }
        }
      }
    })
  } catch (error) {
    // Silently fail if .env.test doesn't exist
    // In CI environments, environment variables are set directly
  }
  
  // Smart fallback for DATABASE_URL in test mode
  if (!process.env.DATABASE_URL) {
    const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true'
    if (isCI) {
      process.env.DATABASE_URL = 'postgresql://postgres:password@localhost:5432/instagram_db_test?schema=public'
    } else {
      process.env.DATABASE_URL = 'postgresql://postgres:password@localhost:5433/instagram_db_test?schema=public'
    }
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma 