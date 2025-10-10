#!/bin/bash

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
until pg_isready -h postgres -p 5432 -U hotel_user; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 2
done

echo "PostgreSQL is ready - running database migrations and seeding"

# Run database migrations
cd /app/backend
npm run db:push

# Run seeding
npm run db:seed

echo "Database setup completed!"