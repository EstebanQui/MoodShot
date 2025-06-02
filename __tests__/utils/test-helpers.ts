import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export interface TestUser {
  id: string
  email: string
  name: string
  username: string
  password: string
}

export async function cleanDatabase() {
  try {
    // Clean up in correct order to avoid foreign key constraints
    await prisma.like.deleteMany()
    await prisma.post.deleteMany()
    await prisma.user.deleteMany()
    console.log('✅ Database cleaned successfully')
  } catch (error) {
    console.error('❌ Error cleaning database:', error)
    throw error
  }
}

export async function createTestUser(overrides: Partial<TestUser> = {}): Promise<TestUser> {
  const timestamp = Date.now()
  const userData = {
    email: `test${timestamp}@example.com`,
    name: `Test User ${timestamp}`,
    username: `testuser${timestamp}`,
    password: 'password123',
    ...overrides
  }

  const hashedPassword = await bcrypt.hash(userData.password, 12)

  const user = await prisma.user.create({
    data: {
      email: userData.email,
      name: userData.name,
      username: userData.username,
      password: hashedPassword
    }
  })

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    username: user.username,
    password: userData.password // Return the plain password for tests
  }
}

export async function createTestPost(userId: string, overrides: any = {}) {
  return await prisma.post.create({
    data: {
      caption: 'Test post content',
      imageUrl: 'https://example.com/image.jpg',
      userId,
      ...overrides
    }
  })
}

export function generateUniqueEmail(): string {
  return `test${Date.now()}${Math.random().toString(36).substring(2)}@example.com`
}

export function generateUniqueUsername(): string {
  return `testuser${Date.now()}${Math.random().toString(36).substring(2)}`
}

export async function waitForDatabase(maxAttempts: number = 30): Promise<void> {
  let attempt = 1
  
  while (attempt <= maxAttempts) {
    try {
      await prisma.$queryRaw`SELECT 1`
      console.log('✅ Database connection established')
      return
    } catch (error) {
      if (attempt === maxAttempts) {
        console.error('❌ Failed to connect to database after', maxAttempts, 'attempts')
        throw new Error(`Database connection failed after ${maxAttempts} attempts`)
      }
      
      console.log(`⏳ Database connection attempt ${attempt}/${maxAttempts}...`)
      await new Promise(resolve => setTimeout(resolve, 1000))
      attempt++
    }
  }
} 