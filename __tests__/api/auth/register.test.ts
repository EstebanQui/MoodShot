import { createMocks } from 'node-mocks-http'
import { POST } from '@/app/api/auth/register/route'
import { cleanDatabase, generateUniqueEmail, generateUniqueUsername } from '../../utils/test-helpers'
import { prisma } from '@/lib/prisma'

describe('/api/auth/register', () => {
  beforeEach(async () => {
    await cleanDatabase()
  })

  afterAll(async () => {
    await cleanDatabase()
    await prisma.$disconnect()
  })

  describe('POST', () => {
    it('should successfully register a new user', async () => {
      const userData = {
        email: generateUniqueEmail(),
        password: 'password123',
        name: 'John Doe',
        username: generateUniqueUsername()
      }

      const { req } = createMocks({
        method: 'POST',
        body: userData,
      })

      // Mock request.json() method
      req.json = jest.fn().mockResolvedValue(userData)

      const response = await POST(req as any)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData).toHaveProperty('id')
      expect(responseData.email).toBe(userData.email)
      expect(responseData.name).toBe(userData.name)
      expect(responseData.username).toBe(userData.username)
      expect(responseData).not.toHaveProperty('password')

      // Verify user was created in database
      const createdUser = await prisma.user.findUnique({
        where: { email: userData.email }
      })
      expect(createdUser).toBeTruthy()
      expect(createdUser?.email).toBe(userData.email)
    })

    it('should reject registration with invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'password123',
        name: 'John Doe',
        username: generateUniqueUsername()
      }

      const { req } = createMocks({
        method: 'POST',
        body: userData,
      })

      req.json = jest.fn().mockResolvedValue(userData)

      const response = await POST(req as any)
      const responseData = await response.json()

      expect(response.status).toBe(500) // Zod validation error will cause 500
      expect(responseData).toHaveProperty('error')
    })

    it('should reject registration with short password', async () => {
      const userData = {
        email: generateUniqueEmail(),
        password: '123', // Too short
        name: 'John Doe',
        username: generateUniqueUsername()
      }

      const { req } = createMocks({
        method: 'POST',
        body: userData,
      })

      req.json = jest.fn().mockResolvedValue(userData)

      const response = await POST(req as any)
      const responseData = await response.json()

      expect(response.status).toBe(500) // Zod validation error
      expect(responseData).toHaveProperty('error')
    })

    it('should reject registration with duplicate email', async () => {
      const email = generateUniqueEmail()
      const userData1 = {
        email,
        password: 'password123',
        name: 'John Doe',
        username: generateUniqueUsername()
      }

      // Create first user
      const { req: req1 } = createMocks({
        method: 'POST',
        body: userData1,
      })
      req1.json = jest.fn().mockResolvedValue(userData1)
      await POST(req1 as any)

      // Try to create second user with same email
      const userData2 = {
        email, // Same email
        password: 'password123',
        name: 'Jane Doe',
        username: generateUniqueUsername()
      }

      const { req: req2 } = createMocks({
        method: 'POST',
        body: userData2,
      })
      req2.json = jest.fn().mockResolvedValue(userData2)

      const response = await POST(req2 as any)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.error).toBe('User already exists')
    })

    it('should reject registration with duplicate username', async () => {
      const username = generateUniqueUsername()
      const userData1 = {
        email: generateUniqueEmail(),
        password: 'password123',
        name: 'John Doe',
        username
      }

      // Create first user
      const { req: req1 } = createMocks({
        method: 'POST',
        body: userData1,
      })
      req1.json = jest.fn().mockResolvedValue(userData1)
      await POST(req1 as any)

      // Try to create second user with same username
      const userData2 = {
        email: generateUniqueEmail(),
        password: 'password123',
        name: 'Jane Doe',
        username // Same username
      }

      const { req: req2 } = createMocks({
        method: 'POST',
        body: userData2,
      })
      req2.json = jest.fn().mockResolvedValue(userData2)

      const response = await POST(req2 as any)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.error).toBe('User already exists')
    })

    it('should hash the password before storing', async () => {
      const userData = {
        email: generateUniqueEmail(),
        password: 'password123',
        name: 'John Doe',
        username: generateUniqueUsername()
      }

      const { req } = createMocks({
        method: 'POST',
        body: userData,
      })

      req.json = jest.fn().mockResolvedValue(userData)

      await POST(req as any)

      // Verify password is hashed in database
      const createdUser = await prisma.user.findUnique({
        where: { email: userData.email }
      })
      
      expect(createdUser?.password).toBeTruthy()
      expect(createdUser?.password).not.toBe(userData.password)
      expect(createdUser?.password.length).toBeGreaterThan(20) // Hashed passwords are longer
    })

    it('should reject registration with missing required fields', async () => {
      const userData = {
        email: generateUniqueEmail(),
        // Missing password, name, username
      }

      const { req } = createMocks({
        method: 'POST',
        body: userData,
      })

      req.json = jest.fn().mockResolvedValue(userData)

      const response = await POST(req as any)
      const responseData = await response.json()

      expect(response.status).toBe(500) // Zod validation error
      expect(responseData).toHaveProperty('error')
    })
  })
}) 