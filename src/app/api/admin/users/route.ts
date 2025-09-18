import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const users = await prisma.adminUser.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        lastLogin: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Convertir BigInt a string para serialización
    const serializedUsers = users.map(user => ({
      ...user,
      id: user.id.toString(),
      createdAt: user.createdAt.toISOString(),
      lastLogin: user.lastLogin?.toISOString() || null,
    }))

    return NextResponse.json(serializedUsers)

  } catch (error) {
    console.error('Error fetching admin users:', error)
    return NextResponse.json(
      { error: 'Error fetching admin users' },
      { status: 500 }
    )
  }
}

// Crear nuevo usuario admin
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { username, email, password, firstName, lastName, role } = body

    // Validaciones
    if (!username || !email || !password || !firstName || !lastName || !role) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      )
    }

    // Verificar si el usuario ya existe
    const existingUser = await prisma.adminUser.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'El email o username ya existe' },
        { status: 409 }
      )
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10)

    // Crear usuario
    const newUser = await prisma.adminUser.create({
      data: {
        username,
        email,
        passwordHash: hashedPassword,
        firstName,
        lastName,
        role: role as 'ADMIN' | 'SUPER_ADMIN',
      },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
      }
    })

    return NextResponse.json({
      ...newUser,
      id: newUser.id.toString(),
      createdAt: newUser.createdAt.toISOString(),
    })

  } catch (error) {
    console.error('Error creating admin user:', error)
    return NextResponse.json(
      { error: 'Error creando usuario administrador' },
      { status: 500 }
    )
  }
}

// Actualizar usuario admin
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { id, username, email, firstName, lastName, role, isActive, password } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID requerido' },
        { status: 400 }
      )
    }

    const updateData: any = {
      username,
      email,
      firstName,
      lastName,
      role,
      isActive,
    }

    // Si se proporciona nueva contraseña, hashearla
    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 10)
    }

    const updatedUser = await prisma.adminUser.update({
      where: { id: BigInt(id) },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        lastLogin: true,
      }
    })

    return NextResponse.json({
      ...updatedUser,
      id: updatedUser.id.toString(),
      createdAt: updatedUser.createdAt.toISOString(),
      lastLogin: updatedUser.lastLogin?.toISOString() || null,
    })

  } catch (error) {
    console.error('Error updating admin user:', error)
    return NextResponse.json(
      { error: 'Error actualizando usuario' },
      { status: 500 }
    )
  }
}

// Eliminar usuario admin
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID requerido' },
        { status: 400 }
      )
    }

    // No permitir eliminar el propio usuario
    if (id === session.user.id) {
      return NextResponse.json(
        { error: 'No puedes eliminar tu propio usuario' },
        { status: 400 }
      )
    }

    await prisma.adminUser.delete({
      where: { id: BigInt(id) }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error deleting admin user:', error)
    return NextResponse.json(
      { error: 'Error eliminando usuario' },
      { status: 500 }
    )
  }
}
