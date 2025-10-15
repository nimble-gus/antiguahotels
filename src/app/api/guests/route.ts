import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''

    const skip = (page - 1) * limit

    // Construir filtros
    const where: any = {}
    
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Obtener huéspedes con conteo de reservaciones
    const [guests, totalCount] = await Promise.all([
      prisma.guest.findMany({
        where,
        include: {
          _count: {
            select: {
              reservations: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.guest.count({ where })
    ])

    // Serializar BigInt
    const serializedGuests = guests.map(guest => ({
      ...guest,
      id: guest.id.toString(),
      createdAt: guest.createdAt.toISOString(),
      updatedAt: guest.updatedAt.toISOString(),
      dateOfBirth: guest.dateOfBirth?.toISOString(),
      _count: {
        reservations: guest._count.reservations
      }
    }))

    return NextResponse.json({
      guests: serializedGuests,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      }
    })

  } catch (error) {
    console.error('Error fetching guests:', error)
    return NextResponse.json(
      { error: 'Error obteniendo huéspedes' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      firstName,
      lastName,
      email,
      phone,
      country,
      dateOfBirth,
      passportNumber,
      nationality
    } = body

    // Validaciones básicas
    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: 'Nombre y apellido son requeridos' },
        { status: 400 }
      )
    }

    // Verificar si el email ya existe (si se proporciona)
    if (email) {
      const existingGuest = await prisma.guest.findFirst({
        where: { email }
      })

      if (existingGuest) {
        return NextResponse.json(
          { error: 'Ya existe un huésped con este email' },
          { status: 409 }
        )
      }
    }

    // Crear huésped
    const guest = await prisma.guest.create({
      data: {
        firstName,
        lastName,
        email: email || null,
        phone: phone || null,
        country: country || null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        passportNumber: passportNumber || null,
        nationality: nationality || null,
      },
      include: {
        _count: {
          select: {
            reservations: true
          }
        }
      }
    })

    // Serializar respuesta
    const serializedGuest = {
      ...guest,
      id: guest.id.toString(),
      createdAt: guest.createdAt.toISOString(),
      updatedAt: guest.updatedAt.toISOString(),
      dateOfBirth: guest.dateOfBirth?.toISOString(),
    }

    return NextResponse.json(serializedGuest)

  } catch (error) {
    console.error('Error creating guest:', error)
    return NextResponse.json(
      { error: 'Error creando huésped' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID requerido' },
        { status: 400 }
      )
    }

    // Preparar datos de actualización
    const data: any = { ...updateData }
    if (data.dateOfBirth) {
      data.dateOfBirth = new Date(data.dateOfBirth)
    }

    // Actualizar huésped
    const guest = await prisma.guest.update({
      where: { id: BigInt(id) },
      data,
      include: {
        _count: {
          select: {
            reservations: true
          }
        }
      }
    })

    // Serializar respuesta
    const serializedGuest = {
      ...guest,
      id: guest.id.toString(),
      createdAt: guest.createdAt.toISOString(),
      updatedAt: guest.updatedAt.toISOString(),
      dateOfBirth: guest.dateOfBirth?.toISOString(),
    }

    return NextResponse.json(serializedGuest)

  } catch (error) {
    console.error('Error updating guest:', error)
    return NextResponse.json(
      { error: 'Error actualizando huésped' },
      { status: 500 }
    )
  }
}








