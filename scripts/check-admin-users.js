const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkAdminUsers() {
  try {
    console.log('🔍 Checking admin users in database...')
    
    const adminUsers = await prisma.adminUser.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
        role: true,
        createdAt: true
      }
    })

    console.log(`📊 Found ${adminUsers.length} admin users:`)
    
    adminUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName}`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Role: ${user.role}`)
      console.log(`   Active: ${user.isActive}`)
      console.log(`   Created: ${user.createdAt}`)
      console.log('')
    })

    if (adminUsers.length === 0) {
      console.log('❌ No admin users found! You need to create one.')
      console.log('Run: node scripts/create-admin-user.js')
    }

  } catch (error) {
    console.error('❌ Error checking admin users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAdminUsers()
