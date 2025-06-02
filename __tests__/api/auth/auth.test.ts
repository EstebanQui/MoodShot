import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { cleanDatabase, createTestUser } from '../../utils/test-helpers'
import bcrypt from 'bcryptjs'

describe('Authentication', () => {
  beforeEach(async () => {
    await cleanDatabase()
  })

  afterAll(async () => {
    await cleanDatabase()
    await prisma.$disconnect()
  })

  describe('CredentialsProvider authorize', () => {
    it('should authenticate user with valid credentials', async () => {
      // Create a test user
      const testUser = await createTestUser({
        email: 'test@example.com',
        password: 'password123'
      })

      // Get the credentials provider from auth options
      const credentialsProvider = authOptions.providers[0] as any
      
      // Test authorization
      const result = await credentialsProvider.authorize({
        email: testUser.email,
        password: testUser.password
      })

      expect(result).toBeTruthy()
      expect(result.id).toBe(testUser.id)
      expect(result.email).toBe(testUser.email)
      expect(result.username).toBe(testUser.username)
    })

    it('should reject authentication with invalid email', async () => {
      const credentialsProvider = authOptions.providers[0] as any
      
      const result = await credentialsProvider.authorize({
        email: 'nonexistent@example.com',
        password: 'password123'
      })

      expect(result).toBeNull()
    })

    it('should reject authentication with invalid password', async () => {
      const testUser = await createTestUser({
        email: 'test@example.com',
        password: 'password123'
      })

      const credentialsProvider = authOptions.providers[0] as any
      
      const result = await credentialsProvider.authorize({
        email: testUser.email,
        password: 'wrongpassword'
      })

      expect(result).toBeNull()
    })

    it('should reject authentication with missing credentials', async () => {
      const credentialsProvider = authOptions.providers[0] as any
      
      const result = await credentialsProvider.authorize({})

      expect(result).toBeNull()
    })

    it('should verify password hashing works correctly', async () => {
      const plainPassword = 'testpassword123'
      const hashedPassword = await bcrypt.hash(plainPassword, 12)

      // Verify the hash is different from plain password
      expect(hashedPassword).not.toBe(plainPassword)
      expect(hashedPassword.length).toBeGreaterThan(20)

      // Verify the hash can be verified
      const isValid = await bcrypt.compare(plainPassword, hashedPassword)
      expect(isValid).toBe(true)

      // Verify wrong password fails
      const isInvalid = await bcrypt.compare('wrongpassword', hashedPassword)
      expect(isInvalid).toBe(false)
    })
  })

  describe('JWT and Session callbacks', () => {
    it('should handle JWT callback correctly', async () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        username: 'testuser'
      }

      const token = {}
      const jwtCallback = authOptions.callbacks?.jwt

      if (jwtCallback) {
        const result = await jwtCallback({ token, user: mockUser })
        expect(result.username).toBe(mockUser.username)
      }
    })

    it('should handle session callback correctly', async () => {
      const mockSession = {
        user: {
          id: '',
          username: ''
        }
      }

      const mockToken = {
        sub: 'user123',
        username: 'testuser'
      }

      const sessionCallback = authOptions.callbacks?.session

      if (sessionCallback) {
        const result = await sessionCallback({ 
          session: mockSession, 
          token: mockToken 
        })
        
        expect(result.user.id).toBe(mockToken.sub)
        expect(result.user.username).toBe(mockToken.username)
      }
    })
  })
}) 