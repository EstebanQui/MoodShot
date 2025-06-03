import { GET } from '@/app/api/health/route'
import { prisma } from '@/lib/prisma'

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    $queryRaw: jest.fn()
  }
}))

const mockedPrisma = prisma as jest.Mocked<typeof prisma>

describe('/api/health', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('GET', () => {
    it('should return healthy status when database is connected', async () => {
      // Mock successful database query
      mockedPrisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }])

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.status).toBe('healthy')
      expect(data.database).toBe('connected')
      expect(data.timestamp).toBeDefined()
      expect(mockedPrisma.$queryRaw).toHaveBeenCalledWith(['SELECT 1'])
    })

    it('should return unhealthy status when database is disconnected', async () => {
      // Mock database connection failure
      const mockError = new Error('Database connection failed')
      mockedPrisma.$queryRaw.mockRejectedValue(mockError)

      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(503)
      expect(data.status).toBe('unhealthy')
      expect(data.database).toBe('disconnected')
      expect(data.error).toBe('Database connection failed')
      expect(data.timestamp).toBeDefined()
      expect(mockedPrisma.$queryRaw).toHaveBeenCalledWith(['SELECT 1'])
      expect(consoleSpy).toHaveBeenCalledWith('Health check failed:', mockError)

      // Restore console.error
      consoleSpy.mockRestore()
    })

    it('should handle unexpected errors gracefully', async () => {
      // Mock unexpected error
      const unexpectedError = new Error('Unexpected database error')
      mockedPrisma.$queryRaw.mockRejectedValue(unexpectedError)

      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(503)
      expect(data.status).toBe('unhealthy')
      expect(data.database).toBe('disconnected')
      expect(data.error).toBe('Database connection failed')
      expect(data.timestamp).toBeDefined()

      // Restore console.error
      consoleSpy.mockRestore()
    })
  })
}) 