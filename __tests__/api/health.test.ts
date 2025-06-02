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

  describe('GET', () => {
    it('should return healthy status when database is connected', async () => {
      mockedPrisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }])

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.status).toBe('healthy')
      expect(data.database).toBe('connected')
      expect(data.timestamp).toBeDefined()
    })

    it('should return unhealthy status when database is disconnected', async () => {
      mockedPrisma.$queryRaw.mockRejectedValue(new Error('Database connection failed'))

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(503)
      expect(data.status).toBe('unhealthy')
      expect(data.database).toBe('disconnected')
      expect(data.error).toBe('Database connection failed')
      expect(data.timestamp).toBeDefined()
    })
  })
}) 