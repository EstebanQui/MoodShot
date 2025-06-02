#!/bin/bash

# Setup test database for CI/CD
echo "Setting up test database..."

# Set environment variables for test
export DATABASE_URL="postgresql://postgres:password@localhost:5432/instagram_db_test?schema=public"
export NEXTAUTH_SECRET="test-secret"
export NEXTAUTH_URL="http://localhost:3000"

# Create test database if it doesn't exist
echo "Creating test database..."
createdb -h localhost -U postgres instagram_db_test 2>/dev/null || echo "Database already exists"

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Run migrations
echo "Running database migrations..."
npx prisma migrate deploy

echo "Test database setup complete!" 