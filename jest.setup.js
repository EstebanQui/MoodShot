// Jest setup file
import { jest } from '@jest/globals'

// Set test environment variables
process.env.NODE_ENV = 'test'
process.env.DATABASE_URL = 'postgresql://postgres:password@localhost:5432/instagram_db_test?schema=public'
process.env.NEXTAUTH_SECRET = 'test-secret'
process.env.NEXTAUTH_URL = 'http://localhost:3000'

// Mock NextAuth
jest.mock('next-auth/next', () => {
  return {
    __esModule: true,
    default: () => ({
      GET: jest.fn(),
      POST: jest.fn(),
    }),
  }
})

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
  },
}) 