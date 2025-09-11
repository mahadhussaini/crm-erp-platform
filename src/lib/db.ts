import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
}

// Prisma client configuration with error handling
const createPrismaClient = () => {
  try {
    const prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      errorFormat: 'minimal',
    })

    // Test the connection
    prisma.$connect()
      .then(() => {
        console.log('✅ Database connected successfully')
      })
      .catch((error) => {
        console.error('❌ Database connection failed:', error.message)
        if (process.env.NODE_ENV === 'development') {
          console.error('Please check your DATABASE_URL in .env.local')
          console.error('Make sure PostgreSQL is running and accessible')
        }
      })

    return prisma
  } catch (error) {
    console.error('❌ Failed to create Prisma client:', error instanceof Error ? error.message : String(error))
    throw new Error('Database configuration error')
  }
}

export const db = globalThis.prisma || createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = db
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await db.$disconnect()
})
