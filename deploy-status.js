#!/usr/bin/env node

/**
 * Deployment Status Checker for CRM/ERP Platform
 * Shows current configuration and deployment readiness
 */

import fs from 'fs'

function checkFileExists(filePath) {
  try {
    fs.accessSync(filePath, fs.constants.F_OK)
    return true
  } catch {
    return false
  }
}

function checkEnvVar(varName, envFile = '.env.local') {
  try {
    if (!checkFileExists(envFile)) return false

    const envContent = fs.readFileSync(envFile, 'utf8')
    const lines = envContent.split('\n')

    for (const line of lines) {
      if (line.trim().startsWith(varName + '=')) {
        const value = line.split('=')[1]?.replace(/["']/g, '').trim()
        return value && value !== '' && !value.includes('your-') && !value.includes('change-in-production')
      }
    }
  } catch (_error) {
    return false
  }
  return false
}

function showStatus() {
  console.log('🚀 CRM/ERP Platform Deployment Status\n')
  console.log('=' .repeat(50))

  // Check required files
  console.log('📁 Required Files:')
  const files = [
    { name: 'package.json', path: 'package.json', required: true },
    { name: 'next.config.ts', path: 'next.config.ts', required: true },
    { name: 'prisma/schema.prisma', path: 'prisma/schema.prisma', required: true },
    { name: 'vercel.json', path: 'vercel.json', required: false },
    { name: '.env.local', path: '.env.local', required: false }
  ]

  files.forEach(file => {
    const exists = checkFileExists(file.path)
    const status = exists ? '✅' : (file.required ? '❌' : '⚠️')
    console.log(`  ${status} ${file.name}`)
  })

  console.log('\n🔧 Environment Variables:')

  // Check critical environment variables
  const envVars = [
    { name: 'DATABASE_URL', required: true },
    { name: 'NEXTAUTH_URL', required: true },
    { name: 'NEXTAUTH_SECRET', required: true },
    { name: 'STRIPE_SECRET_KEY', required: false },
    { name: 'TWILIO_ACCOUNT_SID', required: false }
  ]

  let allRequiredSet = true
  envVars.forEach(envVar => {
    const isSet = checkEnvVar(envVar.name)
    const status = isSet ? '✅' : (envVar.required ? '❌' : '⚠️')
    console.log(`  ${status} ${envVar.name}`)

    if (envVar.required && !isSet) {
      allRequiredSet = false
    }
  })

  console.log('\n🎯 Deployment Readiness:')

  const ready = allRequiredSet && checkFileExists('package.json') && checkFileExists('prisma/schema.prisma')
  const status = ready ? '✅ READY' : '❌ NOT READY'
  console.log(`  ${status} for deployment`)

  console.log('\n📋 Next Steps:')

  if (!allRequiredSet) {
    console.log('  1. Set up environment variables:')
    console.log('     node env-setup.js vercel')
    console.log('     # Then edit .env.local with your actual values')
  }

  if (!checkFileExists('.env.local')) {
    console.log('  2. Create environment file:')
    console.log('     node env-setup.js vercel')
  }

  console.log('  3. Test locally:')
  console.log('     npm run dev')

  console.log('  4. Deploy to Vercel:')
  console.log('     - Connect GitHub repo to Vercel')
  console.log('     - Set environment variables in Vercel dashboard')
  console.log('     - Deploy!')

  console.log('\n🔗 Useful Links:')
  console.log('  📖 Vercel Deployment Guide: VERCEL-DEPLOYMENT.md')
  console.log('  🗄️ PlanetScale Setup: https://planetscale.com')
  console.log('  ⚡ Vercel Dashboard: https://vercel.com/dashboard')

  if (ready) {
    console.log('\n🎉 Your app is ready for deployment!')
    console.log('   Just connect your GitHub repo to Vercel and you\'re good to go!')
  } else {
    console.log('\n⚠️  Complete the setup steps above before deploying.')
  }
}

function showHelp() {
  console.log(`
🚀 CRM/ERP Platform Deployment Status

Usage: node deploy-status.js

This script checks your deployment readiness and shows:
- Required files status
- Environment variables configuration
- Next steps for deployment
- Useful links and resources

For Vercel deployment:
1. Run this script to check status
2. Fix any missing requirements
3. Connect your repo to Vercel
4. Set environment variables
5. Deploy!

Need help? Check VERCEL-DEPLOYMENT.md for detailed instructions.
`)
}

function main() {
  const args = process.argv.slice(2)

  if (args.length > 0 && (args[0] === '--help' || args[0] === '-h')) {
    showHelp()
    return
  }

  showStatus()
}

if (require.main === module) {
  main()
}
