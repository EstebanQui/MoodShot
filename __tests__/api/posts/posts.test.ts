import { createMocks } from 'node-mocks-http'
import { GET, POST } from '@/app/api/posts/route'
import { cleanDatabase, createTestUser, createTestPost } from '../../utils/test-helpers'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'

// Mock next-auth
jest.mock('next-auth/next')
const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>

// Mock file system operations
jest.mock('fs/promises', () => ({
  writeFile: jest.fn().mockResolvedValue(undefined)
}))

describe('/api/posts', () => {
  beforeEach(async () => {
    await cleanDatabase()
    jest.clearAllMocks()
  })

  afterAll(async () => {
    await cleanDatabase()
    await prisma.$disconnect()
  })

  describe('GET', () => {
    it('should fetch all posts with user and like information', async () => {
      // Create test user and post
      const testUser = await createTestUser()
      const testPost = await createTestPost(testUser.id, {
        caption: 'Test post caption'
      })

      const { req } = createMocks({
        method: 'GET',
      })

      const response = await GET()
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(responseData)).toBe(true)
      expect(responseData.length).toBe(1)
      expect(responseData[0].id).toBe(testPost.id)
      expect(responseData[0].caption).toBe('Test post caption')
      expect(responseData[0].user.username).toBe(testUser.username)
    })

    it('should return empty array when no posts exist', async () => {
      const response = await GET()
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(responseData)).toBe(true)
      expect(responseData.length).toBe(0)
    })
  })

  describe('POST', () => {
    it('should create a new post with image when authenticated', async () => {
      const testUser = await createTestUser()

      // Mock authenticated session
      mockGetServerSession.mockResolvedValue({
        user: { id: testUser.id, email: testUser.email },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      })

      // Create mock file
      const mockFile = new File(['test image content'], 'test.jpg', {
        type: 'image/jpeg'
      })

      const formData = new FormData()
      formData.append('image', mockFile)
      formData.append('caption', 'Test caption')

      const { req } = createMocks({
        method: 'POST',
      })

      // Mock formData method
      req.formData = jest.fn().mockResolvedValue(formData)

      const response = await POST(req as any)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData).toHaveProperty('id')
      expect(responseData.caption).toBe('Test caption')
      expect(responseData.imageUrl).toMatch(/^\/api\/uploads\/.*\.jpg$/)
      expect(responseData.user.id).toBe(testUser.id)

      // Verify post was created in database
      const createdPost = await prisma.post.findFirst({
        where: { userId: testUser.id }
      })
      expect(createdPost).toBeTruthy()
      expect(createdPost?.caption).toBe('Test caption')
    })

    it('should reject post creation when not authenticated', async () => {
      // Mock unauthenticated session
      mockGetServerSession.mockResolvedValue(null)

      const mockFile = new File(['test image content'], 'test.jpg', {
        type: 'image/jpeg'
      })

      const formData = new FormData()
      formData.append('image', mockFile)
      formData.append('caption', 'Test caption')

      const { req } = createMocks({
        method: 'POST',
      })

      req.formData = jest.fn().mockResolvedValue(formData)

      const response = await POST(req as any)
      const responseData = await response.json()

      expect(response.status).toBe(401)
      expect(responseData.error).toBe('Unauthorized')
    })

    it('should reject post creation without image', async () => {
      const testUser = await createTestUser()

      mockGetServerSession.mockResolvedValue({
        user: { id: testUser.id, email: testUser.email },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      })

      const formData = new FormData()
      formData.append('caption', 'Test caption without image')

      const { req } = createMocks({
        method: 'POST',
      })

      req.formData = jest.fn().mockResolvedValue(formData)

      const response = await POST(req as any)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.error).toBe('No image provided')
    })

    it('should create post without caption', async () => {
      const testUser = await createTestUser()

      mockGetServerSession.mockResolvedValue({
        user: { id: testUser.id, email: testUser.email },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      })

      const mockFile = new File(['test image content'], 'test.jpg', {
        type: 'image/jpeg'
      })

      const formData = new FormData()
      formData.append('image', mockFile)

      const { req } = createMocks({
        method: 'POST',
      })

      req.formData = jest.fn().mockResolvedValue(formData)

      const response = await POST(req as any)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData).toHaveProperty('id')
      expect(responseData.caption).toBeNull()
      expect(responseData.imageUrl).toMatch(/^\/api\/uploads\/.*\.jpg$/)
    })
  })
}) 