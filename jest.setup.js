// Jest setup file
import { jest } from '@jest/globals'
import { mkdirSync, existsSync } from 'fs'
import { join } from 'path'

// Set test environment variables
process.env.NODE_ENV = 'test'

// Smart environment detection for DATABASE_URL
const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true'

if (!process.env.DATABASE_URL) {
  if (isCI) {
    // GitHub Actions uses port 5432
    process.env.DATABASE_URL = 'postgresql://postgres:password@localhost:5432/instagram_db_test?schema=public'
    console.log('🔍 Jest setup: Detected CI environment, using port 5432')
  } else {
    // Local development uses port 5433
    process.env.DATABASE_URL = 'postgresql://postgres:password@localhost:5433/instagram_db_test?schema=public'
    console.log('🔍 Jest setup: Detected local environment, using port 5433')
  }
}

process.env.NEXTAUTH_SECRET = 'test-secret-key-for-testing'
process.env.NEXTAUTH_URL = 'http://localhost:3000'
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
process.env.UPLOAD_DIR = './public/uploads'

console.log('🔗 Jest setup DATABASE_URL:', process.env.DATABASE_URL.replace(/:[^:]*@/, ':***@'))

// Create uploads directory if it doesn't exist
const uploadsDir = join(process.cwd(), 'public', 'uploads')
if (!existsSync(uploadsDir)) {
  mkdirSync(uploadsDir, { recursive: true })
  console.log('📁 Created uploads directory:', uploadsDir)
}

// Mock NextAuth
jest.mock('next-auth/next', () => ({
  __esModule: true,
  default: () => ({
    GET: jest.fn(),
    POST: jest.fn(),
  }),
  getServerSession: jest.fn(),
}))

// Extend Jest matchers
expect.extend({
  toBeValidEmail: (received) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const pass = emailRegex.test(received)
    if (pass) {
      return {
        message: () => `Expected ${received} not to be a valid email`,
        pass: true,
      }
    } else {
      return {
        message: () => `Expected ${received} to be a valid email`,
        pass: false,
      }
    }
  }
})

// Global test timeout
jest.setTimeout(30000)
