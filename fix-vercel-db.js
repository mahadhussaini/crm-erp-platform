#!/usr/bin/env node

/**
 * Vercel Database Connection Fix Script
 * This script helps resolve database connection issues on Vercel
 */

const fs = require('fs')
const path = require('path')

function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`)
}

function checkFileExists(filePath) {
  try {
    fs.accessSync(filePath, fs.constants.F_OK)
    return true
  } catch {
    return false
  }
}

function showDatabaseFixInstructions() {
  console.log(`
🔧 VERCEL DATABASE CONNECTION FIX

The issue: Your Vercel deployment is configured with a PostgreSQL database URL, 
but there might be a mismatch in the database configuration.

📋 IMMEDIATE FIX STEPS:

1. ✅ Prisma Schema Updated
   - Changed from MySQL to PostgreSQL
   - Added PostgreSQL driver (pg)

2. 🔧 Environment Variables Check
   Your Vercel environment shows:
   - DATABASE_URL: postgresql://neondb_owner:npg_zJ... ✅
   - NEXTAUTH_URL: crm-erp-platform.vercel.app ✅
   - NEXTAUTH_SECRET: [configured] ✅

3. 🚀 Next Steps to Fix:

   A. Update Vercel Build Command:
      - Go to your Vercel project settings
      - Navigate to "Build & Development Settings"
      - Set Build Command to: "prisma generate && npm run build"
      - Set Output Directory to: ".next"

   B. Redeploy Your Application:
      - Go to "Deployments" tab in Vercel
      - Click "Redeploy" on the latest deployment
      - Or push a new commit to trigger automatic deployment

   C. Check Database Schema:
      - Your PostgreSQL database needs the tables created
      - Run this locally first to test:
        npm run db:push

4. 🧪 Test the Fix:

   A. Check Health Endpoint:
      https://crm-erp-platform.vercel.app/api/health
      
   B. Test Registration:
      https://crm-erp-platform.vercel.app/api/auth/register

5. 🔍 Debug Information:

   If still having issues, check:
   - Vercel Function Logs (in Vercel dashboard)
   - Database connection string format
   - Network connectivity from Vercel to your database

📞 Database Providers for Vercel:
   - Neon (recommended): https://neon.tech
   - Supabase: https://supabase.com
   - Railway: https://railway.app
   - AWS RDS: https://aws.amazon.com/rds

🎯 Expected Result:
   After redeployment, your registration endpoint should work without 
   the "Database connection error" message.

`)
}

function checkCurrentConfiguration() {
  log('🔍 Checking current configuration...')

  // Check Prisma schema
  const schemaPath = 'prisma/schema.prisma'
  if (checkFileExists(schemaPath)) {
    const schemaContent = fs.readFileSync(schemaPath, 'utf8')
    if (schemaContent.includes('provider = "postgresql"')) {
      log('✅ Prisma schema is configured for PostgreSQL')
    } else {
      log('❌ Prisma schema is not configured for PostgreSQL')
    }
  } else {
    log('❌ Prisma schema file not found')
  }

  // Check package.json for PostgreSQL driver
  const packagePath = 'package.json'
  if (checkFileExists(packagePath)) {
    const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
    if (packageContent.dependencies?.pg) {
      log('✅ PostgreSQL driver (pg) is installed')
    } else {
      log('❌ PostgreSQL driver (pg) is not installed')
    }
  }

  // Check vercel.json
  const vercelPath = 'vercel.json'
  if (checkFileExists(vercelPath)) {
    const vercelContent = JSON.parse(fs.readFileSync(vercelPath, 'utf8'))
    if (vercelContent.buildCommand?.includes('prisma generate')) {
      log('✅ Vercel build command includes Prisma generate')
    } else {
      log('⚠️ Vercel build command may not include Prisma generate')
    }
  }

  log('')
}

function main() {
  console.log('🚀 Vercel Database Connection Fix Tool\n')
  
  checkCurrentConfiguration()
  showDatabaseFixInstructions()

  console.log('💡 Quick Commands:')
  console.log('   npm run deploy:status  - Check deployment readiness')
  console.log('   npm run env:setup vercel - Generate Vercel environment file')
  console.log('   npm run db:push - Push schema to database (run locally first)')
}

if (require.main === module) {
  main()
}

module.exports = { checkCurrentConfiguration, showDatabaseFixInstructions }
