import { PrismaClient } from '../src/generated/prisma/index.js'

// Set test environment variables explicitly
process.env.NODE_ENV = 'test'
process.env.DATABASE_URL = 'postgresql://postgres:password@localhost:5432/instagram_db_test?schema=public'

async function setupTestDatabase() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: 'postgresql://postgres:password@localhost:5432/instagram_db_test?schema=public'
      }
    }
  })

  try {
    // Test connection first
    await prisma.$connect()
    console.log('🔗 Connected to test database')
    
    // Clean up existing data
    await prisma.like.deleteMany()
    await prisma.post.deleteMany()
    await prisma.user.deleteMany()
    
    console.log('✅ Test database cleaned successfully')
  } catch (error) {
    console.error('❌ Error setting up test database:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

setupTestDatabase()
