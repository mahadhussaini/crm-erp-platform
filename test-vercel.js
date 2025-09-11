#!/usr/bin/env node

/**
 * Vercel Deployment Test Script
 * Tests the application readiness for Vercel deployment
 */

import fs from 'fs'
import { execSync } from 'child_process'

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
  if (process.env[varName]) {
    return process.env[varName]
  }

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

function checkVercelConfiguration() {
  log('info', 'Checking Vercel configuration...')

  const issues = []
  const recommendations = []

  // Check vercel.json
  if (!checkFileExists('vercel.json')) {
    issues.push('❌ vercel.json not found')
  } else {
    log('success', '✅ vercel.json found')
    try {
      const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'))
      if (!vercelConfig.buildCommand?.includes('prisma generate')) {
        recommendations.push('⚠️  Consider adding "prisma generate" to build command')
      }
    } catch (_error) {
      issues.push('❌ vercel.json is not valid JSON')
    }
  }

  // Check package.json scripts
  if (checkFileExists('package.json')) {
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))

      if (!packageJson.scripts?.build) {
        issues.push('❌ No build script in package.json')
      }

      if (!packageJson.scripts?.start) {
        issues.push('❌ No start script in package.json')
      }

      if (!packageJson.dependencies?.next) {
        issues.push('❌ Next.js not found in dependencies')
      }

      if (!packageJson.dependencies?.['@prisma/client']) {
        issues.push('❌ Prisma client not found in dependencies')
      }

      if (!packageJson.dependencies?.mysql2 && !packageJson.dependencies?.['@planetscale/serverless']) {
        recommendations.push('⚠️  Consider adding mysql2 for MySQL database support')
      }

    } catch (_error) {
      issues.push('❌ package.json is not valid JSON')
    }
  } else {
    issues.push('❌ package.json not found')
  }

  // Check Next.js configuration
  if (!checkFileExists('next.config.ts') && !checkFileExists('next.config.js')) {
    recommendations.push('⚠️  Consider creating next.config.ts for Vercel optimizations')
  }

  // Check .vercelignore
  if (!checkFileExists('.vercelignore')) {
    recommendations.push('⚠️  Consider creating .vercelignore to exclude unnecessary files')
  }

  return { issues, recommendations }
}

function checkEnvironmentVariables() {
  log('info', 'Checking environment variables...')

  const required = ['DATABASE_URL', 'NEXTAUTH_URL', 'NEXTAUTH_SECRET']
  // const optional = ['STRIPE_SECRET_KEY', 'TWILIO_ACCOUNT_SID'] // Not used in this function

  const missing = []
  const invalid = []

  // Check required variables
  for (const varName of required) {
    const value = getEnvVar(varName)
    if (!value) {
      missing.push(varName)
    } else if (value.includes('your-') || value.includes('change-in-production')) {
      invalid.push(varName)
    }
  }

  // Check DATABASE_URL format
  const databaseUrl = getEnvVar('DATABASE_URL')
  if (databaseUrl) {
    if (!databaseUrl.includes('mysql://') && !databaseUrl.includes('planetscale://')) {
      invalid.push('DATABASE_URL (must be MySQL/PlanetScale for Vercel)')
    }
  }

  return { missing, invalid }
}

function testBuildProcess() {
  log('info', 'Testing build process...')

  try {
    // Test if we can run the build command
    execSync('npm run build --dry-run', { stdio: 'pipe' })
    log('success', '✅ Build command is valid')
    return true
  } catch (error) {
    log('error', `❌ Build command failed: ${error.message}`)
    return false
  }
}

function generateDeploymentSummary() {
  log('info', 'Generating deployment summary...')

  const summary = {
    timestamp: new Date().toISOString(),
    ready: false,
    checks: {}
  }

  // Vercel configuration check
  const vercelCheck = checkVercelConfiguration()
  summary.checks.vercelConfig = {
    issues: vercelCheck.issues.length,
    recommendations: vercelCheck.recommendations.length
  }

  // Environment variables check
  const envCheck = checkEnvironmentVariables()
  summary.checks.environment = {
    missing: envCheck.missing.length,
    invalid: envCheck.invalid.length
  }

  // Build test
  const buildTest = testBuildProcess()
  summary.checks.build = buildTest

  // Overall readiness
  summary.ready = vercelCheck.issues.length === 0 &&
                  envCheck.missing.length === 0 &&
                  envCheck.invalid.length === 0 &&
                  buildTest

  // Save summary
  try {
    fs.writeFileSync('vercel-deployment-summary.json', JSON.stringify(summary, null, 2))
    log('success', '✅ Deployment summary saved to vercel-deployment-summary.json')
  } catch (_error) {
    log('warning', '⚠️  Could not save deployment summary')
  }

  return summary
}

function main() {
  console.log('🚀 Vercel Deployment Test')
  console.log('=' .repeat(50))

  // Check Vercel configuration
  const vercelCheck = checkVercelConfiguration()
  if (vercelCheck.issues.length > 0) {
    log('error', 'Vercel configuration issues:')
    vercelCheck.issues.forEach(issue => console.log(`  ${issue}`))
  }

  if (vercelCheck.recommendations.length > 0) {
    log('info', 'Vercel configuration recommendations:')
    vercelCheck.recommendations.forEach(rec => console.log(`  ${rec}`))
  }

  console.log()

  // Check environment variables
  const envCheck = checkEnvironmentVariables()
  if (envCheck.missing.length > 0) {
    log('error', 'Missing required environment variables:')
    envCheck.missing.forEach(varName => console.log(`  ❌ ${varName}`))
  }

  if (envCheck.invalid.length > 0) {
    log('warning', 'Invalid environment variables (placeholders detected):')
    envCheck.invalid.forEach(varName => console.log(`  ⚠️  ${varName}`))
  }

  console.log()

  // Generate deployment summary
  const summary = generateDeploymentSummary()

  console.log('=' .repeat(50))

  if (summary.ready) {
    log('success', '🎉 Your application is ready for Vercel deployment!')
    console.log()
    log('info', 'Next steps:')
    console.log('  1. Push your code to GitHub')
    console.log('  2. Connect your repository to Vercel')
    console.log('  3. Add environment variables in Vercel dashboard')
    console.log('  4. Deploy!')
    console.log()
    log('info', 'Useful commands:')
    console.log('  npm run deploy:status    # Check deployment status')
    console.log('  npm run troubleshoot     # Troubleshoot issues')
  } else {
    log('warning', '⚠️  Your application needs fixes before Vercel deployment')
    console.log()
    log('info', 'Run these commands to fix issues:')
    console.log('  npm run fix:vercel       # Auto-fix common issues')
    console.log('  npm run troubleshoot     # Manual troubleshooting')
    console.log('  node env-setup.js vercel # Setup environment variables')
  }

  console.log()
  log('info', 'For detailed help, visit: VERCEL-DEPLOYMENT.md')
}

if (require.main === module) {
  main()
}

module.exports = {
  checkVercelConfiguration,
  checkEnvironmentVariables,
  testBuildProcess,
  generateDeploymentSummary
}