#!/bin/bash

echo "🔍 MoodShot Test Troubleshooting"
echo "==============================="

# Check if Docker is running
echo "1. Checking Docker status..."
if docker info >/dev/null 2>&1; then
    echo "   ✅ Docker is running"
else
    echo "   ❌ Docker is not running or not accessible"
    echo "   Please start Docker Desktop or Docker service"
    exit 1
fi

# Check for running containers
echo "2. Checking running containers..."
RUNNING_CONTAINERS=$(docker ps --format "table {{.Names}}\t{{.Status}}")
if [ -n "$RUNNING_CONTAINERS" ]; then
    echo "   📦 Running containers:"
    echo "$RUNNING_CONTAINERS"
else
    echo "   ⚠️  No containers are currently running"
fi

# Check for postgres container specifically
echo "3. Checking for PostgreSQL test container..."
if docker ps -a | grep -q postgres_test; then
    POSTGRES_STATUS=$(docker ps -a --filter name=postgres_test --format "{{.Status}}")
    echo "   🐘 PostgreSQL test container: $POSTGRES_STATUS"
    
    if docker ps | grep -q postgres_test; then
        echo "   ✅ PostgreSQL test container is running"
        # Test database connection
        if docker exec postgres_test pg_isready -U postgres >/dev/null 2>&1; then
            echo "   ✅ PostgreSQL is accepting connections"
        else
            echo "   ❌ PostgreSQL is not ready"
        fi
    else
        echo "   ⚠️  PostgreSQL test container exists but is not running"
        echo "   Run: docker start postgres_test"
    fi
else
    echo "   ❌ No PostgreSQL test container found"
    echo "   Run the fix-tests.sh script to create one"
fi

# Check Node.js and npm
echo "4. Checking Node.js environment..."
if command -v node >/dev/null 2>&1; then
    NODE_VERSION=$(node --version)
    echo "   ✅ Node.js: $NODE_VERSION"
else
    echo "   ❌ Node.js not found"
fi

if command -v npm >/dev/null 2>&1; then
    NPM_VERSION=$(npm --version)
    echo "   ✅ npm: $NPM_VERSION"
else
    echo "   ❌ npm not found"
fi

# Check for node_modules
echo "5. Checking dependencies..."
if [ -d "node_modules" ]; then
    echo "   ✅ node_modules directory exists"
else
    echo "   ❌ node_modules not found - run: npm install"
fi

# Check Prisma client
if [ -d "src/generated/prisma" ]; then
    echo "   ✅ Prisma client generated"
else
    echo "   ❌ Prisma client not generated - run: npx prisma generate"
fi

# Check environment files
echo "6. Checking environment configuration..."
if [ -f ".env" ]; then
    echo "   ✅ .env file exists"
else
    echo "   ❌ .env file missing"
fi

if [ -f ".env.test" ]; then
    echo "   ✅ .env.test file exists"
else
    echo "   ⚠️  .env.test file missing"
fi

# Check Jest configuration
echo "7. Checking test configuration..."
if [ -f "jest.config.js" ]; then
    echo "   ✅ jest.config.js exists"
else
    echo "   ❌ jest.config.js missing"
fi

if [ -f "jest.setup.js" ]; then
    echo "   ✅ jest.setup.js exists"
else
    echo "   ❌ jest.setup.js missing"
fi

echo ""
echo "🚀 Quick fixes:"
echo "   - To start fresh: ./fix-tests.sh"
echo "   - To restart PostgreSQL: docker restart postgres_test"
echo "   - To stop test DB: docker stop postgres_test && docker rm postgres_test"
echo "   - To run tests: npm test" 