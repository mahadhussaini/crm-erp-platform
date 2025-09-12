import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
}

// Prisma client configuration optimized for Vercel/serverless
const createPrismaClient = () => {
  try {
    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set')
    }

    console.log('🔧 Creating Prisma client with URL:', process.env.DATABASE_URL.replace(/\/\/.*@/, '//***:***@'))

    const prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      errorFormat: 'minimal',
    })

    return prisma
  } catch (error) {
    console.error('❌ Failed to create Prisma client:', error instanceof Error ? error.message : String(error))
    throw new Error('Database configuration error')
  }
}

// Use existing client or create new one
export const db = globalThis.prisma || createPrismaClient()

// Export both db and prisma for compatibility
export const prisma = db

// In production/serverless environments, don't cache the client to avoid connection issues
if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = db
}

// Export a health check function optimized for PostgreSQL
export async function checkDatabaseHealth() {
  try {
    // For PostgreSQL, use a simple SELECT query
    if (process.env.DATABASE_URL?.includes('postgresql://')) {
      await db.$queryRaw`SELECT 1 as health_check`
    } else if (process.env.DATABASE_URL?.includes('mysql://')) {
      // For MySQL compatibility
      await db.$queryRaw`SELECT 1 as health_check`
    } else {
      // For SQLite or other databases
      await db.$queryRaw`SELECT 1`
    }

    return { status: 'healthy', message: 'Database connection successful' }
  } catch (error) {
    console.error('Database health check failed:', error)
    return {
      status: 'unhealthy',
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : String(error)
    }
  }
}
