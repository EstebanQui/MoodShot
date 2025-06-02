#!/bin/sh

# Attendre que la base de données soit prête
echo "Waiting for database to be ready..."
until nc -z postgres 5432; do
  echo "Database is unavailable - sleeping"
  sleep 1
done
echo "Database is up - executing command"

# Exécuter les migrations Prisma
echo "Running Prisma migrations..."
npx prisma migrate deploy

# Démarrer l'application
echo "Starting the application..."
exec node server.js 