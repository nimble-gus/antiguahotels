const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdminUser() {
  try {
    console.log('🔧 Creating admin user...')
    
    const email = 'admin@antiguahotels.com'
    const password = 'admin123'
    const hashedPassword = await bcrypt.hash(password, 12)
    
    // Check if user already exists
    const existingUser = await prisma.adminUser.findUnique({
      where: { email }
    })
    
    if (existingUser) {
      console.log('⚠️  Admin user already exists!')
      console.log('Email:', existingUser.email)
      console.log('Active:', existingUser.isActive)
      return
    }
    
    const adminUser = await prisma.adminUser.create({
      data: {
        email,
        passwordHash: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        username: 'admin',
        role: 'ADMIN',
        isActive: true
      }
    })
    
    console.log('✅ Admin user created successfully!')
    console.log('Email:', adminUser.email)
    console.log('Password:', password)
    console.log('Role:', adminUser.role)
    console.log('Active:', adminUser.isActive)
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdminUser()
