#!/bin/sh

# SQLite database setup (no waiting needed)
echo "Setting up SQLite database..."

# Run database migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Seed the database (optional)
if [ "$NODE_ENV" = "development" ]; then
  echo "Seeding database..."
  npx prisma db seed
fi

# Start the application
echo "Starting application..."
exec "$@"
