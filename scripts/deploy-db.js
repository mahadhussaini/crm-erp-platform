#!/usr/bin/env node

/**
 * Database Deployment Script for Vercel
 * This script ensures the database schema is properly set up
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`)
}

function runCommand(command, description) {
  try {
    log(`🔄 ${description}...`)
    const output = execSync(command, { 
      encoding: 'utf8',
      stdio: 'pipe',
      cwd: process.cwd()
    })
    log(`✅ ${description} completed`)
    return output
  } catch (error) {
    log(`❌ ${description} failed: ${error.message}`)
    throw error
  }
}

async function deployDatabase() {
  try {
    log('🚀 Starting database deployment...')

    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set')
    }

    log(`🔗 Database URL: ${process.env.DATABASE_URL.replace(/\/\/.*@/, '//***:***@')}`)

    // Generate Prisma client
    runCommand('npx prisma generate', 'Generating Prisma client')

    // Push schema to database (creates tables if they don't exist)
    runCommand('npx prisma db push --accept-data-loss', 'Pushing database schema')

    // Optional: Seed database if SEED_DATABASE is set
    if (process.env.SEED_DATABASE === 'true') {
      try {
        runCommand('npx prisma db seed', 'Seeding database')
      } catch (seedError) {
        log(`⚠️ Database seeding failed (this is optional): ${seedError.message}`)
      }
    }

    log('🎉 Database deployment completed successfully!')

  } catch (error) {
    log(`💥 Database deployment failed: ${error.message}`)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  deployDatabase()
}

module.exports = { deployDatabase }
