import { PrismaClient } from '../src/generated/prisma/index.js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Set test environment variables explicitly
process.env.NODE_ENV = 'test'

// Clear any existing DATABASE_URL to ensure we read from .env.test
delete process.env.DATABASE_URL

// Load environment variables from .env.test manually
try {
  const envPath = resolve('.env.test')
  const envContent = readFileSync(envPath, 'utf8')
  
  // Parse the .env file
  const envVars = {}
  envContent.split('\n').forEach(line => {
    const trimmedLine = line.trim()
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, ...valueParts] = trimmedLine.split('=')
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').replace(/^["']|["']$/g, '') // Remove quotes
        envVars[key.trim()] = value
        process.env[key.trim()] = value
      }
    }
  })
  
  console.log('📁 Loaded .env.test:', Object.keys(envVars).length > 0 ? 'SUCCESS' : 'FAILED')
} catch (error) {
  console.log('📁 Could not load .env.test file:', error.message)
  console.log('🔄 Fallback: Using environment variables from CI/CD or system')
}

// Determine DATABASE_URL with smart fallback logic
let DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  // Check if we're in GitHub Actions (CI environment)
  const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true'
  
  if (isCI) {
    // GitHub Actions uses port 5432
    DATABASE_URL = 'postgresql://postgres:password@localhost:5432/instagram_db_test?schema=public'
    console.log('🔍 Detected CI environment, using port 5432')
  } else {
    // Local development uses port 5433
    DATABASE_URL = 'postgresql://postgres:password@localhost:5433/instagram_db_test?schema=public'
    console.log('🔍 Detected local environment, using port 5433')
  }
}

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
    console.log('5. Environment:', process.env.CI === 'true' ? 'CI/CD' : 'Local')
    
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

setupTestDatabase()
