#!/usr/bin/env node

/**
 * Database Troubleshooting Script for CRM/ERP Platform
 * Diagnoses and fixes common database connection issues
 */

import fs from 'fs'
import { execSync } from 'child_process'

function log(level, message) {
  // const timestamp = new Date().toISOString() // Not used
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    warning: '\x1b[33m',
    error: '\x1b[31m',
    reset: '\x1b[0m'
  }
  console.log(`${colors[level]}[${level.toUpperCase()}]${colors.reset} ${message}`)
}

function checkFileExists(filePath) {
  try {
    fs.accessSync(filePath, fs.constants.F_OK)
    return true
  } catch {
    return false
  }
}

function getEnvVar(varName) {
  // Check process.env first
  if (process.env[varName]) {
    return process.env[varName]
  }

  // Check .env.local file
  try {
    if (checkFileExists('.env.local')) {
      const envContent = fs.readFileSync('.env.local', 'utf8')
      const lines = envContent.split('\n')

      for (const line of lines) {
        if (line.trim().startsWith(varName + '=')) {
          const value = line.split('=')[1]?.replace(/["']/g, '').trim()
          return value
        }
      }
    }
  } catch (_error) {
    return null
  }

  return null
}

function validateDatabaseUrl(url) {
  if (!url) return { valid: false, error: 'DATABASE_URL is not set' }

  try {
    const urlObj = new URL(url)

    if (url.startsWith('file:')) {
      // SQLite validation
      const dbPath = url.replace('file:', '')
      const fullPath = path.resolve(dbPath)

      // Check if directory exists
      const dir = path.dirname(fullPath)
      if (!fs.existsSync(dir)) {
        return { valid: false, error: `Directory does not exist: ${dir}` }
      }

      return { valid: true, type: 'sqlite', path: fullPath }
    } else if (url.includes('mysql://') || url.includes('planetscale://')) {
      // MySQL/PlanetScale validation
      if (!urlObj.hostname || !urlObj.pathname) {
        return { valid: false, error: 'Invalid MySQL connection string format' }
      }

      return {
        valid: true,
        type: 'mysql',
        host: urlObj.hostname,
        database: urlObj.pathname.slice(1)
      }
    } else {
      return { valid: false, error: 'Unsupported database type' }
    }
  } catch (error) {
    return { valid: false, error: `Invalid URL format: ${error.message}` }
  }
}

function checkPrismaSetup() {
  log('info', 'Checking Prisma setup...')

  const issues = []

  // Check if Prisma schema exists
  if (!checkFileExists('prisma/schema.prisma')) {
    issues.push('❌ prisma/schema.prisma not found')
  } else {
    log('success', '✅ Prisma schema found')
  }

  // Check if node_modules/.prisma exists
  if (!checkFileExists('node_modules/.prisma')) {
    issues.push('❌ Prisma client not generated')
  } else {
    log('success', '✅ Prisma client exists')
  }

  // Check if migrations directory exists
  if (!checkFileExists('prisma/migrations')) {
    issues.push('⚠️  No migrations found (this is OK for new projects)')
  } else {
    log('success', '✅ Database migrations exist')
  }

  return issues
}

function checkDependencies() {
  log('info', 'Checking dependencies...')

  const issues = []

  try {
    // Check if mysql2 is installed (for MySQL)
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies }

    if (!dependencies.mysql2 && !dependencies['@planetscale/serverless']) {
      issues.push('⚠️  MySQL driver not found - install with: npm install mysql2')
    } else {
      log('success', '✅ Database drivers found')
    }

    if (!dependencies.prisma) {
      issues.push('❌ Prisma not found in dependencies')
    } else {
      log('success', '✅ Prisma dependency found')
    }

  } catch (error) {
    issues.push('❌ Error reading package.json')
  }

  return issues
}

function generatePrismaClient() {
  log('info', 'Generating Prisma client...')

  try {
    execSync('npx prisma generate', { stdio: 'inherit' })
    log('success', '✅ Prisma client generated successfully')
    return true
  } catch (error) {
    log('error', `❌ Failed to generate Prisma client: ${error.message}`)
    return false
  }
}

function pushDatabaseSchema() {
  log('info', 'Pushing database schema...')

  try {
    execSync('npx prisma db push', { stdio: 'inherit' })
    log('success', '✅ Database schema pushed successfully')
    return true
  } catch (error) {
    log('error', `❌ Failed to push schema: ${error.message}`)
    return false
  }
}

function testDatabaseConnection() {
  log('info', 'Testing database connection...')

  const testCode = `
    const { PrismaClient } = require('@prisma/client')
    const prisma = new PrismaClient()

    async function test() {
      try {
        await prisma.$connect()
        console.log('Database connection successful')
        await prisma.$disconnect()
        process.exit(0)
      } catch (error) {
        console.error('Database connection failed:', error.message)
        process.exit(1)
      }
    }

    test()
  `

  try {
    fs.writeFileSync('temp-db-test.js', testCode)
    execSync('node temp-db-test.js', { stdio: 'inherit' })
    fs.unlinkSync('temp-db-test.js')
    log('success', '✅ Database connection test passed')
    return true
  } catch (error) {
    fs.unlinkSync('temp-db-test.js')
    log('error', `❌ Database connection test failed: ${error.message}`)
    return false
  }
}

function fixCommonIssues() {
  log('info', 'Attempting to fix common issues...')

  const fixes = []

  // Fix 1: Generate Prisma client
  if (!checkFileExists('node_modules/.prisma')) {
    log('info', 'Fixing: Generating Prisma client...')
    if (generatePrismaClient()) {
      fixes.push('✅ Generated Prisma client')
    }
  }

  // Fix 2: Push schema if no migrations exist
  if (!checkFileExists('prisma/migrations') && checkFileExists('prisma/schema.prisma')) {
    log('info', 'Fixing: Pushing schema to database...')
    if (pushDatabaseSchema()) {
      fixes.push('✅ Pushed schema to database')
    }
  }

  return fixes
}

function showEnvironmentInfo() {
  log('info', 'Environment Information:')

  const databaseUrl = getEnvVar('DATABASE_URL')
  const nextauthUrl = getEnvVar('NEXTAUTH_URL')
  const nextauthSecret = getEnvVar('NEXTAUTH_SECRET')

  console.log(`  DATABASE_URL: ${databaseUrl ? '✅ Set' : '❌ Not set'}`)
  console.log(`  NEXTAUTH_URL: ${nextauthUrl ? '✅ Set' : '❌ Not set'}`)
  console.log(`  NEXTAUTH_SECRET: ${nextauthSecret ? '✅ Set' : '❌ Not set'}`)
  console.log(`  Node Version: ${process.version}`)
  console.log(`  Platform: ${process.platform}`)
  console.log(`  Working Directory: ${process.cwd()}`)

  if (databaseUrl) {
    const dbValidation = validateDatabaseUrl(databaseUrl)
    console.log(`  Database Type: ${dbValidation.valid ? dbValidation.type : '❌ Invalid'}`)
    if (!dbValidation.valid) {
      console.log(`  Database Error: ${dbValidation.error}`)
    }
  }
}

function showHelp() {
  console.log(`
🔧 Database Troubleshooting Tool for CRM/ERP Platform

Usage: node troubleshoot.js [command]

Commands:
  check     - Check database setup and configuration
  fix       - Attempt to fix common database issues
  test      - Test database connection
  generate  - Generate Prisma client
  push      - Push schema to database
  help      - Show this help message

Quick Diagnosis:
  node troubleshoot.js check

Auto-Fix Common Issues:
  node troubleshoot.js fix

Test Connection:
  node troubleshoot.js test

For Vercel Deployment:
1. Run: node troubleshoot.js check
2. Fix any issues found
3. Ensure DATABASE_URL is set in Vercel dashboard
4. Redeploy your application

Common Issues:
- DATABASE_URL not set or invalid
- Prisma client not generated
- Database schema not pushed
- Missing MySQL driver (mysql2)
- Network connectivity issues
`)
}

function main() {
  const args = process.argv.slice(2)
  const command = args[0] || 'check'

  console.log('🔧 CRM/ERP Platform Database Troubleshooter')
  console.log('=' .repeat(50))

  switch (command) {
    case 'check':
      showEnvironmentInfo()
      console.log()

      const prismaIssues = checkPrismaSetup()
      const depIssues = checkDependencies()

      const allIssues = [...prismaIssues, ...depIssues]

      if (allIssues.length === 0) {
        log('success', '✅ No issues found! Your database setup looks good.')
      } else {
        log('warning', 'Issues found:')
        allIssues.forEach(issue => console.log(`  ${issue}`))
      }
      break

    case 'fix':
      const fixes = fixCommonIssues()
      if (fixes.length > 0) {
        log('success', 'Applied fixes:')
        fixes.forEach(fix => console.log(`  ${fix}`))
      } else {
        log('info', 'No automatic fixes available. Check the issues above.')
      }
      break

    case 'test':
      testDatabaseConnection()
      break

    case 'generate':
      generatePrismaClient()
      break

    case 'push':
      pushDatabaseSchema()
      break

    case 'help':
    case '--help':
    case '-h':
      showHelp()
      break

    default:
      log('error', `Unknown command: ${command}`)
      showHelp()
      break
  }

  console.log('\n' + '=' .repeat(50))
  console.log('Need help? Check the documentation or create an issue on GitHub.')
}

if (require.main === module) {
  main()
}

module.exports = {
  checkFileExists,
  getEnvVar,
  validateDatabaseUrl,
  checkPrismaSetup,
  checkDependencies
}