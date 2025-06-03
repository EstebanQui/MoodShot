import { PrismaClient } from '../src/generated/prisma/index.js'
import { config } from 'dotenv'

// Set test environment variables explicitly
process.env.NODE_ENV = 'test'

// Clear any existing DATABASE_URL to ensure we read from .env.test
delete process.env.DATABASE_URL

// Load environment variables from .env.test
const envResult = config({ path: '.env.test' })
console.log('📁 Loaded .env.test:', envResult.parsed ? 'SUCCESS' : 'FAILED')

// Read DATABASE_URL from environment or use fallback
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5433/instagram_db_test?schema=public'

console.log('🔗 Using DATABASE_URL:', DATABASE_URL.replace(/:[^:]*@/, ':***@'))

async function setupTestDatabase() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: DATABASE_URL
      }
    }
  })

  try {
    // Test connection first
    console.log('🔗 Attempting to connect to test database...')
    await prisma.$connect()
    console.log('✅ Connected to test database')

    // Clean up existing data
    console.log('🧹 Cleaning up existing data...')
    await prisma.like.deleteMany()
    await prisma.post.deleteMany()
    await prisma.user.deleteMany()

    console.log('✅ Test database cleaned successfully')
  } catch (error) {
    console.error('❌ Error setting up test database:', error.message)
    console.error('📝 Full error:', error)
    
    // Provide helpful debugging information
    console.log('\n🔍 Troubleshooting tips:')
    console.log('1. Make sure Docker containers are running: docker ps')
    console.log('2. Check if PostgreSQL container is healthy: docker exec -it instagram_postgres pg_isready -U postgres')
    console.log('3. Verify database exists: docker exec -it instagram_postgres psql -U postgres -l')
    console.log('4. Current DATABASE_URL:', DATABASE_URL.replace(/:[^:]*@/, ':***@'))
    
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

setupTestDatabase()
