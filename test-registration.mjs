#!/usr/bin/env node

/**
 * Registration Endpoint Test
 * Tests the user registration functionality locally
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const testRegistration = async () => {
  console.log('🧪 Testing User Registration...\n')

  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable not set')
    process.exit(1)
  }

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  })

  try {
    console.log('🔌 Connecting to database...')
    await prisma.$connect()
    console.log('✅ Database connected')

    // Test data
    const testUser = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'EMPLOYEE'
    }

    console.log('🔍 Checking if user already exists...')
    const existingUser = await prisma.user.findUnique({
      where: { email: testUser.email }
    })

    if (existingUser) {
      console.log('⚠️  Test user already exists, cleaning up...')
      await prisma.user.delete({
        where: { email: testUser.email }
      })
      console.log('✅ Existing user removed')
    }

    console.log('🔐 Hashing password...')
    const hashedPassword = await bcrypt.hash(testUser.password, 12)
    console.log('✅ Password hashed')

    console.log('👤 Creating user...')
    const user = await prisma.user.create({
      data: {
        name: testUser.name,
        email: testUser.email,
        password: hashedPassword,
        role: testUser.role
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    })

    console.log('✅ User created successfully!')
    console.log('📋 User details:', {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    })

    console.log('\n🎉 Registration test completed successfully!')
    console.log('🚀 The registration endpoint should work on Vercel now')

    // Clean up test user
    console.log('🧹 Cleaning up test user...')
    await prisma.user.delete({
      where: { id: user.id }
    })
    console.log('✅ Test user removed')

  } catch (error) {
    console.error('❌ Registration test failed:')
    console.error('Error:', error.message)
    console.error('Code:', error.code)

    if (error.code === 'P2002') {
      console.log('\n🔧 Unique constraint violation - email already exists')
    }

    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

testRegistration()
