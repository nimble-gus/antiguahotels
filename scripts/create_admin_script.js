// Script para crear usuario administrador con contraseña válida
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    // Eliminar usuario existente si existe
    await prisma.adminUser.deleteMany({
      where: { email: 'admin@antiguahotels.com' }
    });

    // Hash de la contraseña "admin123"
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Crear usuario administrador
    const admin = await prisma.adminUser.create({
      data: {
        username: 'admin',
        email: 'admin@antiguahotels.com',
        passwordHash: hashedPassword,
        firstName: 'Admin',
        lastName: 'System',
        role: 'SUPER_ADMIN',
      },
    });

    console.log('✅ Admin user created successfully:', admin.email);
    console.log('📧 Email: admin@antiguahotels.com');
    console.log('🔑 Password: admin123');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();



