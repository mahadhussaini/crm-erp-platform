#!/usr/bin/env node

/**
 * Troubleshooting Script for CRM/ERP Platform
 * Helps diagnose deployment and database issues
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

function log(message, type = 'info') {
  const icons = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌',
    debug: '🔍'
  }

  console.log(`${icons[type]} ${message}`)
}

function checkFileExists(filePath, description) {
  const exists = fs.existsSync(filePath)
  const status = exists ? 'success' : 'error'
  log(`${description}: ${exists ? 'Found' : 'Missing'}`, status)
  return exists
}

function checkEnvironmentVariable(varName, description) {
  const value = process.env[varName]
  const exists = !!value
  const status = exists ? 'success' : 'error'

  if (exists && varName.includes('DATABASE_URL')) {
    const maskedValue = value.replace(/\/\/.*@/, '//***:***@')
    log(`${description}: Set (${maskedValue})`, status)
  } else if (exists && varName.includes('SECRET')) {
    log(`${description}: Set (masked)`, status)
  } else {
    log(`${description}: ${exists ? 'Set' : 'Not set'}`, status)
  }

  return exists
}

function testDatabaseConnection() {
  log('Testing database connection...', 'debug')

  if (!process.env.DATABASE_URL) {
    log('DATABASE_URL not set, skipping database test', 'warning')
    return false
  }

  try {
    // Try to run a simple Prisma command
    execSync('npx prisma db push --preview-feature', { stdio: 'pipe' })
    log('Database connection successful', 'success')
    return true
  } catch (error) {
    log('Database connection failed', 'error')
    log(`Error: ${error.message}`, 'debug')
    return false
  }
}

function checkVercelConfiguration() {
  log('Checking Vercel configuration...', 'debug')

  const vercelJson = path.join(process.cwd(), 'vercel.json')
  if (!checkFileExists(vercelJson, 'vercel.json')) {
    return false
  }

  try {
    const config = JSON.parse(fs.readFileSync(vercelJson, 'utf8'))
    const hasPrismaGenerate = config.buildCommand?.includes('prisma generate')

    if (hasPrismaGenerate) {
      log('Vercel build command includes prisma generate', 'success')
    } else {
      log('Vercel build command missing prisma generate', 'warning')
    }

    return hasPrismaGenerate
  } catch (error) {
    log('Error reading vercel.json', 'error')
    return false
  }
}

function checkDependencies() {
  log('Checking dependencies...', 'debug')

  const packageJson = path.join(process.cwd(), 'package.json')
  if (!checkFileExists(packageJson, 'package.json')) {
    return false
  }

  try {
    const pkg = JSON.parse(fs.readFileSync(packageJson, 'utf8'))
    const deps = pkg.dependencies || {}

    const requiredDeps = ['@prisma/client', 'prisma', 'mysql2', 'next-auth']
    let allPresent = true

    for (const dep of requiredDeps) {
      if (deps[dep]) {
        log(`Dependency ${dep}: ${deps[dep]}`, 'success')
      } else {
        log(`Dependency ${dep}: Missing`, 'error')
        allPresent = false
      }
    }

    return allPresent
  } catch (error) {
    log('Error reading package.json', 'error')
    return false
  }
}

function generateReport() {
  log('\n📊 TROUBLESHOOTING REPORT\n', 'info')

  console.log('=' .repeat(50))

  // File checks
  console.log('\n📁 FILES:')
  const files = [
    { path: 'package.json', desc: 'Package configuration' },
    { path: 'prisma/schema.prisma', desc: 'Database schema' },
    { path: 'vercel.json', desc: 'Vercel configuration' },
    { path: '.env.local', desc: 'Local environment variables' },
    { path: 'src/lib/db.ts', desc: 'Database connection' },
    { path: 'src/lib/auth.ts', desc: 'Authentication setup' }
  ]

  files.forEach(file => {
    checkFileExists(file.path, file.desc)
  })

  // Environment checks
  console.log('\n🔧 ENVIRONMENT:')
  const envVars = [
    { name: 'DATABASE_URL', desc: 'Database connection' },
    { name: 'NEXTAUTH_URL', desc: 'NextAuth URL' },
    { name: 'NEXTAUTH_SECRET', desc: 'NextAuth secret' },
    { name: 'NODE_ENV', desc: 'Environment mode' }
  ]

  envVars.forEach(env => {
    checkEnvironmentVariable(env.name, env.desc)
  })

  // Dependency checks
  console.log('\n📦 DEPENDENCIES:')
  checkDependencies()

  // Database checks
  console.log('\n💾 DATABASE:')
  testDatabaseConnection()

  // Vercel checks
  console.log('\n🚀 VERCEL:')
  checkVercelConfiguration()

  console.log('\n' + '=' .repeat(50))
  console.log('\n🔧 QUICK FIXES:\n')

  console.log('1. Set up environment variables:')
  console.log('   node env-setup.js vercel')
  console.log('   # Copy .env.vercel to Vercel dashboard\n')

  console.log('2. Test database locally:')
  console.log('   npm run db:generate')
  console.log('   npm run db:push')
  console.log('   npm run dev\n')

  console.log('3. Redeploy to Vercel:')
  console.log('   - Go to Vercel dashboard')
  console.log('   - Trigger new deployment')
  console.log('   - Check build logs for errors\n')

  console.log('4. Test deployed API:')
  console.log('   curl https://your-app.vercel.app/api/test-db\n')

  console.log('5. Check Vercel function logs:')
  console.log('   - Go to Vercel dashboard > Functions')
  console.log('   - Click on failing function')
  console.log('   - Check logs for detailed errors\n')

  console.log('📖 For more help, see:')
  console.log('   - VERCEL-DEPLOYMENT.md')
  console.log('   - environment-config.md')
  console.log('   - DEPLOYMENT-GUIDE.md\n')
}

function main() {
  console.log('🔧 CRM/ERP Platform - Troubleshooting Script\n')

  const args = process.argv.slice(2)

  if (args.includes('--help') || args.includes('-h')) {
    console.log('Usage: node troubleshoot.js [options]\n')
    console.log('Options:')
    console.log('  --report    Generate full troubleshooting report (default)')
    console.log('  --db-test   Test database connection')
    console.log('  --deps      Check dependencies')
    console.log('  --help, -h  Show this help\n')
    return
  }

  if (args.includes('--db-test')) {
    testDatabaseConnection()
    return
  }

  if (args.includes('--deps')) {
    checkDependencies()
    return
  }

  // Default: generate full report
  generateReport()
}

if (require.main === module) {
  main()
}