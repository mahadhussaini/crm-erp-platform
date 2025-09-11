#!/usr/bin/env node

/**
 * Vercel Database Fix Script
 * Fixes common database issues for Vercel deployments
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

function log(level, message) {
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
  } catch (error) {
    return null
  }

  return null
}

function validateDatabaseUrl(url) {
  if (!url) return { valid: false, error: 'DATABASE_URL is not set' }

  try {
    const urlObj = new URL(url)

    if (url.includes('mysql://') || url.includes('planetscale://')) {
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
      return { valid: false, error: 'Must use MySQL/PlanetScale for Vercel deployment' }
    }
  } catch (error) {
    return { valid: false, error: `Invalid URL format: ${error.message}` }
  }
}

function installMissingDependencies() {
  log('info', 'Checking and installing missing dependencies...')

  try {
    // Check package.json
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies }

    const missingDeps = []

    if (!dependencies.mysql2) {
      missingDeps.push('mysql2')
    }

    if (!dependencies['@prisma/client']) {
      missingDeps.push('@prisma/client')
    }

    if (!dependencies.prisma) {
      missingDeps.push('prisma')
    }

    if (missingDeps.length > 0) {
      log('info', `Installing missing dependencies: ${missingDeps.join(', ')}`)
      execSync(`npm install ${missingDeps.join(' ')}`, { stdio: 'inherit' })
      log('success', '✅ Dependencies installed')
      return true
    } else {
      log('success', '✅ All required dependencies are installed')
      return true
    }
  } catch (error) {
    log('error', `❌ Failed to install dependencies: ${error.message}`)
    return false
  }
}

function fixPrismaConfiguration() {
  log('info', 'Fixing Prisma configuration for Vercel...')

  try {
    // Ensure Prisma schema is using MySQL
    if (checkFileExists('prisma/schema.prisma')) {
      let schemaContent = fs.readFileSync('prisma/schema.prisma', 'utf8')

      // Check if it's using MySQL
      if (!schemaContent.includes('provider = "mysql"')) {
        log('warning', 'Prisma schema not configured for MySQL')

        // Replace SQLite with MySQL
        schemaContent = schemaContent.replace(
          /provider = "sqlite"/g,
          'provider = "mysql"'
        )

        fs.writeFileSync('prisma/schema.prisma', schemaContent)
        log('success', '✅ Updated Prisma schema to use MySQL')
      } else {
        log('success', '✅ Prisma schema is already configured for MySQL')
      }
    } else {
      log('error', '❌ prisma/schema.prisma not found')
      return false
    }

    return true
  } catch (error) {
    log('error', `❌ Failed to fix Prisma configuration: ${error.message}`)
    return false
  }
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

function setupVercelEnvironment() {
  log('info', 'Setting up Vercel environment configuration...')

  const databaseUrl = getEnvVar('DATABASE_URL')

  if (!databaseUrl) {
    log('error', '❌ DATABASE_URL is not set')
    log('info', 'Please set DATABASE_URL in your .env.local file or Vercel dashboard')
    log('info', 'Example: DATABASE_URL="mysql://user:pass@host:port/database?sslaccept=strict"')
    return false
  }

  const validation = validateDatabaseUrl(databaseUrl)

  if (!validation.valid) {
    log('error', `❌ Invalid DATABASE_URL: ${validation.error}`)
    return false
  }

  log('success', `✅ DATABASE_URL is valid (${validation.type})`)

  // Create .env.vercel file
  const vercelEnv = `# Vercel Environment Variables
# Copy these to your Vercel project dashboard

DATABASE_URL="${databaseUrl}"
NEXTAUTH_URL="https://your-app-name.vercel.app"
NEXTAUTH_SECRET="your-super-secret-key-here"

# Optional integrations
# STRIPE_SECRET_KEY=""
# TWILIO_ACCOUNT_SID=""
# TWILIO_AUTH_TOKEN=""
`

  try {
    fs.writeFileSync('.env.vercel', vercelEnv)
    log('success', '✅ Created .env.vercel file')
    log('info', 'Copy the contents of .env.vercel to your Vercel project dashboard')
    return true
  } catch (error) {
    log('error', `❌ Failed to create .env.vercel: ${error.message}`)
    return false
  }
}

function testDatabaseConnection() {
  log('info', 'Testing database connection...')

  const testCode = `
    const { PrismaClient } = require('@prisma/client')

    async function testConnection() {
      const prisma = new PrismaClient({
        log: ['error', 'warn']
      })

      try {
        await prisma.$connect()
        console.log('✅ Database connection successful')

        // Test a simple query
        const result = await prisma.$queryRaw\`SELECT 1 as test\`
        console.log('✅ Database query successful:', result)

        await prisma.$disconnect()
        process.exit(0)
      } catch (error) {
        console.error('❌ Database connection failed:', error.message)
        console.error('Full error:', error)
        process.exit(1)
      }
    }

    testConnection()
  `

  try {
    fs.writeFileSync('temp-db-test.js', testCode)
    execSync('node temp-db-test.js', { stdio: 'inherit' })
    fs.unlinkSync('temp-db-test.js')
    log('success', '✅ Database connection test passed')
    return true
  } catch (error) {
    if (fs.existsSync('temp-db-test.js')) {
      fs.unlinkSync('temp-db-test.js')
    }
    log('error', '❌ Database connection test failed')
    log('info', 'Check your DATABASE_URL and database credentials')
    return false
  }
}

function createVercelIgnore() {
  log('info', 'Creating .vercelignore file...')

  const vercelIgnore = `# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Next.js
.next/
out/

# Production builds
build/
dist/

# Environment variables
.env*
!.env.example

# Debug logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Operating System
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/

# Database files (for SQLite)
*.db
*.db-journal

# Temporary files
temp-*
*.tmp
`

  try {
    fs.writeFileSync('.vercelignore', vercelIgnore)
    log('success', '✅ Created .vercelignore file')
    return true
  } catch (error) {
    log('error', `❌ Failed to create .vercelignore: ${error.message}`)
    return false
  }
}

function main() {
  console.log('🔧 Vercel Database Fix Tool')
  console.log('=' .repeat(50))

  const steps = [
    { name: 'Install missing dependencies', func: installMissingDependencies },
    { name: 'Fix Prisma configuration', func: fixPrismaConfiguration },
    { name: 'Generate Prisma client', func: generatePrismaClient },
    { name: 'Setup Vercel environment', func: setupVercelEnvironment },
    { name: 'Test database connection', func: testDatabaseConnection },
    { name: 'Create .vercelignore', func: createVercelIgnore }
  ]

  let successCount = 0

  for (const step of steps) {
    log('info', `Step: ${step.name}`)
    try {
      if (step.func()) {
        successCount++
      }
    } catch (error) {
      log('error', `Failed: ${error.message}`)
    }
    console.log()
  }

  console.log('=' .repeat(50))
  log('info', `Completed ${successCount}/${steps.length} steps`)

  if (successCount === steps.length) {
    log('success', '🎉 All fixes applied successfully!')
    console.log()
    log('info', 'Next steps for Vercel deployment:')
    console.log('  1. Copy .env.vercel contents to Vercel dashboard')
    console.log('  2. Push your code to GitHub')
    console.log('  3. Connect your repo to Vercel')
    console.log('  4. Deploy!')
  } else {
    log('warning', 'Some fixes failed. Please check the errors above.')
    console.log()
    log('info', 'You can run individual fixes:')
    console.log('  npm run fix:vercel          # Run all fixes')
    console.log('  node troubleshoot.js check  # Check current status')
    console.log('  node troubleshoot.js test   # Test database connection')
  }
}

if (require.main === module) {
  main()
}

module.exports = {
  installMissingDependencies,
  fixPrismaConfiguration,
  generatePrismaClient,
  setupVercelEnvironment,
  testDatabaseConnection,
  createVercelIgnore
}