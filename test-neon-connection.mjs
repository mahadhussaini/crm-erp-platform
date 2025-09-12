#!/usr/bin/env node

/**
 * Neon Database Connection Test
 * Tests connection to Neon PostgreSQL database
 */

import { PrismaClient } from '@prisma/client'

const testConnection = async () => {
  console.log('🧪 Testing Neon Database Connection...\n')

  // Check if DATABASE_URL is set
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable not set')
    process.exit(1)
  }

  console.log('📋 Database URL:', databaseUrl.replace(/\/\/.*@/, '//***:***@'))

  // Create Prisma client
  const prisma = new PrismaClient({
    log: ['query', 'error', 'warn'],
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  })

  try {
    console.log('🔌 Attempting to connect to database...')

    // Test basic connection
    await prisma.$connect()
    console.log('✅ Database connection established')

    // Test query execution
    console.log('🔍 Testing query execution...')
    const result = await prisma.$queryRaw`SELECT version()`
    console.log('✅ Query executed successfully')
    console.log('📊 PostgreSQL Version:', result[0].version.split(' ')[0] + ' ' + result[0].version.split(' ')[1])

    // Check if tables exist
    console.log('📋 Checking database schema...')
    try {
      const tables = await prisma.$queryRaw`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        ORDER BY table_name
      `
      console.log('📊 Existing tables:', tables.length)

      if (tables.length === 0) {
        console.log('⚠️  No tables found - schema needs to be applied')
        console.log('🔧 Run: npx prisma db push')
      } else {
        console.log('✅ Database schema appears to be applied')
        console.log('📋 Tables:', tables.map(t => t.table_name).join(', '))
      }
    } catch (schemaError) {
      console.log('⚠️  Could not check schema - this is normal for fresh databases')
    }

    console.log('\n🎉 Database connection test completed successfully!')
    console.log('🚀 Your Neon database is ready for use')

  } catch (error) {
    console.error('❌ Database connection failed:')
    console.error('Error:', error.message)

    if (error.code === 'P1001') {
      console.log('\n🔧 Possible solutions:')
      console.log('1. Check if DATABASE_URL is correct')
      console.log('2. Verify database credentials')
      console.log('3. Ensure Neon database is running')
      console.log('4. Check firewall/network restrictions')
    }

    if (error.code === 'P1017') {
      console.log('\n🔧 Possible solutions:')
      console.log('1. Apply database schema: npx prisma db push')
      console.log('2. Check Prisma schema configuration')
    }

    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()
