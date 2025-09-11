import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testDatabase() {
  try {
    console.log('Testing SQLite database connection...')

    // Test connection
    await prisma.$connect()
    console.log('✅ Database connection successful!')

    // Test basic query
    const userCount = await prisma.user.count()
    console.log(`📊 Users in database: ${userCount}`)

    const companyCount = await prisma.company.count()
    console.log(`📊 Companies in database: ${companyCount}`)

    const contactCount = await prisma.contact.count()
    console.log(`📊 Contacts in database: ${contactCount}`)

    const productCount = await prisma.product.count()
    console.log(`📊 Products in database: ${productCount}`)

    console.log('\n🎉 SQLite database setup completed successfully!')
    console.log('Your CRM/ERP platform is ready to use.')

  } catch (error) {
    console.error('❌ Database test failed:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

testDatabase()
