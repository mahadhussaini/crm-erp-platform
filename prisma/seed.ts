import { PrismaClient, Role } from '@prisma/client'
import { hashPassword } from '../src/lib/auth'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  try {
    // Create default admin user
    const adminPassword = await hashPassword('admin123')
    const admin = await prisma.user.upsert({
      where: { email: 'admin@crm-erp.com' },
      update: {},
      create: {
        email: 'admin@crm-erp.com',
        name: 'System Administrator',
        password: adminPassword,
        role: Role.ADMIN,
        isActive: true,
      },
    })
    console.log('✅ Admin user created:', admin.email)

    // Create sample manager user
    const managerPassword = await hashPassword('manager123')
    const manager = await prisma.user.upsert({
      where: { email: 'manager@crm-erp.com' },
      update: {},
      create: {
        email: 'manager@crm-erp.com',
        name: 'Project Manager',
        password: managerPassword,
        role: Role.MANAGER,
        isActive: true,
      },
    })
    console.log('✅ Manager user created:', manager.email)

    // Create sample employee user
    const employeePassword = await hashPassword('employee123')
    const employee = await prisma.user.upsert({
      where: { email: 'employee@crm-erp.com' },
      update: {},
      create: {
        email: 'employee@crm-erp.com',
        name: 'John Employee',
        password: employeePassword,
        role: Role.EMPLOYEE,
        isActive: true,
      },
    })
    console.log('✅ Employee user created:', employee.email)

    // Create sample company
    const company = await prisma.company.create({
      data: {
        name: 'TechCorp Solutions',
        industry: 'Technology',
        website: 'https://techcorp.com',
        email: 'contact@techcorp.com',
        phone: '+1 (555) 123-4567',
        address: '123 Tech Street, Silicon Valley, CA',
        description: 'Leading provider of enterprise software solutions',
      },
    })
    console.log('✅ Company created:', company.name)

    // Create sample contacts
    const contact1 = await prisma.contact.create({
      data: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@techcorp.com',
        phone: '+1 (555) 111-2222',
        position: 'CEO',
        companyId: company.id,
      },
    })

    const contact2 = await prisma.contact.create({
      data: {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@techcorp.com',
        phone: '+1 (555) 333-4444',
        position: 'CTO',
        companyId: company.id,
      },
    })
    console.log('✅ Contacts created:', contact1.firstName, contact2.firstName)

    // Create sample products
    const products = await Promise.all([
      prisma.product.upsert({
        where: { sku: 'LAPTOP-001' },
        update: {},
        create: {
          name: 'Business Laptop',
          description: 'High-performance laptop for business use',
          sku: 'LAPTOP-001',
          price: 1299.99,
          cost: 899.99,
          category: 'Electronics',
          stock: 25,
          minStock: 5,
          isActive: true,
        },
      }),
      prisma.product.upsert({
        where: { sku: 'CHAIR-001' },
        update: {},
        create: {
          name: 'Office Chair',
          description: 'Ergonomic office chair with lumbar support',
          sku: 'CHAIR-001',
          price: 349.99,
          cost: 180.00,
          category: 'Furniture',
          stock: 15,
          minStock: 3,
          isActive: true,
        },
      }),
      prisma.product.upsert({
        where: { sku: 'PHONE-001' },
        update: {},
        create: {
          name: 'Business Phone',
          description: 'Professional VoIP business phone',
          sku: 'PHONE-001',
          price: 199.99,
          cost: 89.99,
          category: 'Electronics',
          stock: 40,
          minStock: 10,
          isActive: true,
        },
      }),
    ])
    console.log('✅ Products created:', products.length)

    // Create sample leads
    const leads = await Promise.all([
      prisma.lead.upsert({
        where: { id: 'lead-1' },
        update: {},
        create: {
          id: 'lead-1',
          title: 'Enterprise Software Implementation',
          value: 50000,
          status: 'QUALIFIED',
          priority: 'HIGH',
          source: 'Website',
          contactId: contact1.id,
          companyId: company.id,
          assignedTo: manager.id,
        },
      }),
      prisma.lead.upsert({
        where: { id: 'lead-2' },
        update: {},
        create: {
          id: 'lead-2',
          title: 'Office Furniture Purchase',
          value: 15000,
          status: 'CONTACTED',
          priority: 'MEDIUM',
          source: 'Referral',
          contactId: contact2.id,
          companyId: company.id,
          assignedTo: employee.id,
        },
      }),
    ])
    console.log('✅ Leads created:', leads.length)

    console.log('\n🎉 Database seeding completed successfully!')
    console.log('\n📋 Default login credentials:')
    console.log('   Admin: admin@crm-erp.com / admin123')
    console.log('   Manager: manager@crm-erp.com / manager123')
    console.log('   Employee: employee@crm-erp.com / employee123')

  } catch (error) {
    console.error('❌ Error during database seeding:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
