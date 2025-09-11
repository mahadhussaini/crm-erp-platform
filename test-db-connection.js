#!/usr/bin/env node

/**
 * Database Connection Test Script
 * Tests the database connection with your current configuration
 */

const { PrismaClient } = require('@prisma/client')
require('dotenv').config({ path: '.env.local' })

async function testDatabaseConnection() {
  console.log('🧪 Testing Database Connection...\n')

  // Check environment variables
  console.log('📋 Environment Check:')
  console.log(`   DATABASE_URL: ${process.env.DATABASE_URL ? '✅ Set' : '❌ Not set'}`)
  console.log(`   NEXTAUTH_SECRET: ${process.env.NEXTAUTH_SECRET ? '✅ Set' : '❌ Not set'}`)
  console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'development'}`)

  if (!process.env.DATABASE_URL) {
    console.log('\n❌ DATABASE_URL is not set. Please check your .env.local file.')
    return
  }

  // Show database type
  const dbType = process.env.DATABASE_URL.includes('postgresql://') ? 'PostgreSQL' : 
                 process.env.DATABASE_URL.includes('mysql://') ? 'MySQL' : 
                 process.env.DATABASE_URL.includes('file:') ? 'SQLite' : 'Unknown'
  console.log(`   Database Type: ${dbType}`)

  console.log('\n🔗 Testing Connection...')

  const prisma = new PrismaClient({
    log: ['query', 'error', 'warn'],
  })

  try {
    // Test basic connection
    console.log('   Testing basic connection...')
    await prisma.$queryRaw`SELECT 1 as test`
    console.log('   ✅ Basic connection successful')

    // Test if tables exist
    console.log('   Checking if tables exist...')
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `
    console.log(`   ✅ Found ${tables.length} tables in database`)

    if (tables.length === 0) {
      console.log('\n⚠️  No tables found. You may need to run:')
      console.log('   npm run db:push')
    }

    // Test User table specifically
    try {
      const userCount = await prisma.user.count()
      console.log(`   ✅ User table accessible (${userCount} users)`)
    } catch (error) {
      console.log('   ⚠️  User table not found or not accessible')
      console.log('   This is expected if you haven\'t run migrations yet')
    }

    console.log('\n🎉 Database connection test completed successfully!')
    console.log('\n📋 Next Steps:')
    console.log('   1. If tables are missing, run: npm run db:push')
    console.log('   2. Commit and push your changes to trigger Vercel redeploy')
    console.log('   3. Test your Vercel deployment')

  } catch (error) {
    console.log('\n❌ Database connection failed:')
    console.log(`   Error: ${error.message}`)
    
    if (error.code === 'P1001') {
      console.log('\n💡 This usually means:')
      console.log('   - Database server is not running')
      console.log('   - Connection string is incorrect')
      console.log('   - Network connectivity issues')
    } else if (error.code === 'P1003') {
      console.log('\n💡 This usually means:')
      console.log('   - Database does not exist')
      console.log('   - Wrong database name in connection string')
    } else if (error.code === 'P1017') {
      console.log('\n💡 This usually means:')
      console.log('   - Database connection was closed')
      console.log('   - Connection timeout')
    }

    console.log('\n🔧 Troubleshooting:')
    console.log('   1. Check your DATABASE_URL in .env.local')
    console.log('   2. Verify your database is running and accessible')
    console.log('   3. Check firewall/network settings')
    console.log('   4. Try running: npm run db:push')

  } finally {
    await prisma.$disconnect()
  }
}

// Run the test
testDatabaseConnection().catch(console.error)
