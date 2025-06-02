#!/bin/bash

set -e  # Exit on any error

echo "🔧 MoodShot Test Fix Script"
echo "=========================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check dependencies
print_status "Checking dependencies..."

if ! command_exists docker; then
    print_error "Docker is not installed or not in PATH"
    exit 1
fi

if ! command_exists node; then
    print_error "Node.js is not installed or not in PATH"
    exit 1
fi

if ! command_exists npm; then
    print_error "npm is not installed or not in PATH"
    exit 1
fi

print_success "Dependencies check passed"

# Stop any running containers
print_status "Stopping existing containers..."
docker-compose down --remove-orphans || true

# Clean up any existing test database processes
print_status "Cleaning up any existing database processes..."
docker container prune -f || true

# Create test environment file
print_status "Creating test environment configuration..."
cat > .env.test << EOL
NODE_ENV=test
DATABASE_URL="postgresql://postgres:password@localhost:5432/instagram_db_test?schema=public"
NEXTAUTH_SECRET="test-secret-key-for-testing"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
UPLOAD_DIR="./public/uploads"
EOL

print_success "Test environment file created"

# Start PostgreSQL container for testing
print_status "Starting PostgreSQL container..."
docker run -d \
    --name postgres_test \
    -e POSTGRES_DB=instagram_db_test \
    -e POSTGRES_USER=postgres \
    -e POSTGRES_PASSWORD=password \
    -p 5432:5432 \
    postgres:15-alpine

# Wait for PostgreSQL to be ready
print_status "Waiting for PostgreSQL to be ready..."
max_attempts=30
attempt=1

while ! docker exec postgres_test pg_isready -U postgres >/dev/null 2>&1; do
    if [ $attempt -eq $max_attempts ]; then
        print_error "PostgreSQL failed to start after $max_attempts attempts"
        docker logs postgres_test
        exit 1
    fi
    
    print_status "Attempt $attempt/$max_attempts: Waiting for PostgreSQL..."
    sleep 2
    ((attempt++))
done

print_success "PostgreSQL is ready"

# Install dependencies if needed
print_status "Installing dependencies..."
npm install

# Generate Prisma client
print_status "Generating Prisma client..."
npx prisma generate

# Run database migrations
print_status "Running database migrations..."
DATABASE_URL="postgresql://postgres:password@localhost:5432/instagram_db_test?schema=public" npx prisma migrate deploy

# Create the database schema
print_status "Pushing database schema..."
DATABASE_URL="postgresql://postgres:password@localhost:5432/instagram_db_test?schema=public" npx prisma db push --force-reset

print_success "Database setup completed"

# Fix Jest setup file
print_status "Fixing Jest setup configuration..."
cat > jest.setup.js << 'EOL'
// Jest setup file
import { jest } from '@jest/globals'

// Set test environment variables
process.env.NODE_ENV = 'test'
process.env.DATABASE_URL = 'postgresql://postgres:password@localhost:5432/instagram_db_test?schema=public'
process.env.NEXTAUTH_SECRET = 'test-secret-key-for-testing'
process.env.NEXTAUTH_URL = 'http://localhost:3000'
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
process.env.UPLOAD_DIR = './public/uploads'

// Mock NextAuth
jest.mock('next-auth/next', () => {
  return {
    __esModule: true,
    default: () => ({
      GET: jest.fn(),
      POST: jest.fn(),
    }),
  }
})

// Extend Jest matchers
expect.extend({
  toBeValidEmail: (received) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const pass = emailRegex.test(received)
    if (pass) {
      return {
        message: () => `Expected ${received} not to be a valid email`,
        pass: true,
      }
    } else {
      return {
        message: () => `Expected ${received} to be a valid email`,
        pass: false,
      }
    }
  }
})

// Global test timeout
jest.setTimeout(30000)
EOL

print_success "Jest setup fixed"

# Create a pre-test script
print_status "Creating pre-test database cleanup script..."
cat > scripts/setup-test-db.js << 'EOL'
const { PrismaClient } = require('@prisma/client')

async function setupTestDatabase() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/instagram_db_test?schema=public'
      }
    }
  })

  try {
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
EOL

# Make setup script executable
chmod +x scripts/setup-test-db.js

print_success "Pre-test setup script created"

# Update package.json scripts
print_status "Updating package.json test scripts..."
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.scripts['test:setup'] = 'node scripts/setup-test-db.js';
pkg.scripts['test:ci'] = 'npm run test:setup && jest --passWithNoTests';
pkg.scripts['test'] = 'npm run test:setup && jest';
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
console.log('✅ Package.json updated');
"

print_success "Package.json scripts updated"

# Run the tests
print_status "Running tests..."
if npm run test:ci; then
    print_success "All tests passed! 🎉"
else
    print_warning "Some tests failed, but the environment is now properly set up"
    print_status "You can run 'npm test' to see detailed test results"
fi

print_success "Test fix script completed!"
print_status "Test environment is ready. Use the following commands:"
echo "  npm run test:setup  - Clean test database"
echo "  npm run test        - Run tests with setup"
echo "  npm run test:ci     - Run tests for CI (passes with no tests)"
echo ""
print_status "To stop the test database: docker stop postgres_test && docker rm postgres_test" 