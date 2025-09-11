#!/usr/bin/env node

/**
 * Database Connection Test Script
 * Tests database connectivity and basic operations
 */

import { PrismaClient } from '@prisma/client'

async function testDatabaseConnection() {
  console.log('🔍 Testing Database Connection...')
  console.log('=' .repeat(50))

  const prisma = new PrismaClient({
    log: ['query', 'error', 'warn']
  })

  try {
    console.log('📡 Connecting to database...')

    // Test basic connection
    await prisma.$connect()
    console.log('✅ Database connection successful')

    // Test raw query
    console.log('🔍 Testing raw query...')
    const testResult = await prisma.$queryRaw`SELECT 1 as test_value, datetime('now') as current_time`
    console.log('✅ Raw query successful:', testResult)

    // Test user table (if exists)
    console.log('👤 Testing User table access...')
    try {
      const userCount = await prisma.user.count()
      console.log(`✅ User table accessible (${userCount} users found)`)
    } catch (error) {
      console.log('⚠️  User table not accessible (this is OK for fresh databases):', error.message)
    }

    // Test other tables
    const tables = ['lead', 'company', 'contact', 'product', 'order']

    for (const table of tables) {
      try {
        const count = await prisma[table].count()
        console.log(`✅ ${table} table accessible (${count} records)`)
      } catch (error) {
        console.log(`⚠️  ${table} table not accessible:`, error.message)
      }
    }

    console.log('\n🎉 Database connection test completed successfully!')
    console.log('=' .repeat(50))

  } catch (error) {
    console.log('\n❌ Database connection test failed!')
    console.log('=' .repeat(50))
    console.log('Error details:')
    console.log('Message:', error.message)

    if (error.code) {
      console.log('Code:', error.code)
    }

    if (error.meta) {
      console.log('Meta:', JSON.stringify(error.meta, null, 2))
    }

    console.log('\n🔧 Troubleshooting suggestions:')
    console.log('1. Check your DATABASE_URL environment variable')
    console.log('2. Verify database credentials and connectivity')
    console.log('3. Ensure database server is running')
    console.log('4. Check firewall and network settings')
    console.log('5. Run: node troubleshoot.js check')

    process.exit(1)

  } finally {
    await prisma.$disconnect()
  }
}

// Handle command line arguments
const args = process.argv.slice(2)

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
🧪 Database Connection Test Script

Usage: node test-db-connection.js [options]

Options:
  --help, -h    Show this help message
  --verbose     Show detailed query logs
  --quiet       Suppress non-error output

This script tests:
- Database connectivity
- Basic query execution
- Table access permissions
- Schema compatibility

For Vercel deployment troubleshooting:
1. Run locally: node test-db-connection.js
2. Fix any connection issues
3. Test with your PlanetScale credentials
4. Deploy to Vercel

Environment Variables Required:
- DATABASE_URL: Database connection string

Examples:
  node test-db-connection.js
  node test-db-connection.js --verbose
`)
  process.exit(0)
}

// Handle verbose mode
if (args.includes('--verbose')) {
  process.env.DEBUG = 'prisma:*'
}

// Handle quiet mode
if (args.includes('--quiet')) {
  console.log = () => {} // Suppress console.log
}

testDatabaseConnection().catch((error) => {
  console.error('Unexpected error:', error)
  process.exit(1)
})