import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { cleanDatabase, generateUniqueEmail, generateUniqueUsername } from '../utils/test-helpers'
import { POST as registerPOST } from '@/app/api/auth/register/route'
import { createMocks } from 'node-mocks-http'
import bcrypt from 'bcryptjs'

describe('User Workflow Integration Tests', () => {
  beforeEach(async () => {
    await cleanDatabase()
  })

  afterAll(async () => {
    await cleanDatabase()
    await prisma.$disconnect()
  })

  describe('Complete User Journey', () => {
    it('should allow user to register, authenticate, and create posts', async () => {
      // Step 1: User Registration
      const userData = {
        email: generateUniqueEmail(),
        password: 'password123',
        name: 'Integration Test User',
        username: generateUniqueUsername()
      }

      const { req: registerReq } = createMocks({
        method: 'POST',
        body: userData,
      })
      registerReq.json = jest.fn().mockResolvedValue(userData)

      const registerResponse = await registerPOST(registerReq as any)
      const registeredUser = await registerResponse.json()

      expect(registerResponse.status).toBe(200)
      expect(registeredUser.email).toBe(userData.email)
      expect(registeredUser.username).toBe(userData.username)

      // Step 2: Verify user exists in database
      const dbUser = await prisma.user.findUnique({
        where: { email: userData.email }
      })
      expect(dbUser).toBeTruthy()
      expect(dbUser?.email).toBe(userData.email)

      // Step 3: Test Authentication
      const credentialsProvider = authOptions.providers[0] as any
      const authResult = await credentialsProvider.authorize({
        email: userData.email,
        password: userData.password
      })

      expect(authResult).toBeTruthy()
      expect(authResult.id).toBe(registeredUser.id)
      expect(authResult.email).toBe(userData.email)

      // Step 4: Test Post Creation (simulated)
      const post = await prisma.post.create({
        data: {
          imageUrl: '/api/uploads/test-image.jpg',
          caption: 'My first post!',
          userId: registeredUser.id
        }
      })

      expect(post).toBeTruthy()
      expect(post.caption).toBe('My first post!')
      expect(post.userId).toBe(registeredUser.id)

      // Step 5: Verify complete user data
      const userWithPosts = await prisma.user.findUnique({
        where: { id: registeredUser.id },
        include: {
          posts: true
        }
      })

      expect(userWithPosts?.posts.length).toBe(1)
      expect(userWithPosts?.posts[0].caption).toBe('My first post!')
    })

    it('should handle user registration with duplicate email gracefully', async () => {
      const email = generateUniqueEmail()
      
      // Create first user
      const userData1 = {
        email,
        password: 'password123',
        name: 'First User',
        username: generateUniqueUsername()
      }

      const { req: req1 } = createMocks({
        method: 'POST',
        body: userData1,
      })
      req1.json = jest.fn().mockResolvedValue(userData1)

      const response1 = await registerPOST(req1 as any)
      expect(response1.status).toBe(200)

      // Try to create second user with same email
      const userData2 = {
        email, // Same email
        password: 'password456',
        name: 'Second User',
        username: generateUniqueUsername()
      }

      const { req: req2 } = createMocks({
        method: 'POST',
        body: userData2,
      })
      req2.json = jest.fn().mockResolvedValue(userData2)

      const response2 = await registerPOST(req2 as any)
      const errorData = await response2.json()

      expect(response2.status).toBe(400)
      expect(errorData.error).toBe('User already exists')

      // Verify only one user exists
      const users = await prisma.user.findMany({
        where: { email }
      })
      expect(users.length).toBe(1)
      expect(users[0].name).toBe('First User')
    })

    it('should validate password hashing and verification', async () => {
      const plainPassword = 'mySecurePassword123'
      const hashedPassword = await bcrypt.hash(plainPassword, 12)

      // Test that hash is different from original
      expect(hashedPassword).not.toBe(plainPassword)
      expect(hashedPassword.length).toBeGreaterThan(50)

      // Test that verification works
      const isValid = await bcrypt.compare(plainPassword, hashedPassword)
      expect(isValid).toBe(true)

      // Test that wrong password fails
      const isInvalid = await bcrypt.compare('wrongPassword', hashedPassword)
      expect(isInvalid).toBe(false)
    })

    it('should handle authentication with invalid credentials', async () => {
      // Create a user first
      const userData = {
        email: generateUniqueEmail(),
        password: 'password123',
        name: 'Test User',
        username: generateUniqueUsername()
      }

      const { req } = createMocks({
        method: 'POST',
        body: userData,
      })
      req.json = jest.fn().mockResolvedValue(userData)

      await registerPOST(req as any)

      const credentialsProvider = authOptions.providers[0] as any

      // Test with wrong password
      const wrongPasswordResult = await credentialsProvider.authorize({
        email: userData.email,
        password: 'wrongpassword'
      })
      expect(wrongPasswordResult).toBeNull()

      // Test with wrong email
      const wrongEmailResult = await credentialsProvider.authorize({
        email: 'wrong@email.com',
        password: userData.password
      })
      expect(wrongEmailResult).toBeNull()

      // Test with missing credentials
      const missingCredsResult = await credentialsProvider.authorize({})
      expect(missingCredsResult).toBeNull()
    })
  })
}) 