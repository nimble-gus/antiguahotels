import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const difficulty = searchParams.get('difficulty') || ''
    const isActive = searchParams.get('active')

    const skip = (page - 1) * limit

    // Construir filtros
    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { shortDescription: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (difficulty) {
      where.difficultyLevel = difficulty
    }

    if (isActive !== null && isActive !== '') {
      where.isActive = isActive === 'true'
    }

    // Obtener actividades con conteo
    const [activities, totalCount] = await Promise.all([
      prisma.activity.findMany({
        where,
        include: {
          _count: {
            select: {
              activitySchedules: true,
              activityBookings: true,
            }
          }
        },
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      prisma.activity.count({ where }),
    ])

    // Serializar BigInt y Decimal
    const serializedActivities = activities.map(activity => ({
      ...activity,
      id: activity.id.toString(),
      basePrice: activity.basePrice.toString(),
      durationHours: activity.durationHours?.toString(),
      createdAt: activity.createdAt.toISOString(),
      updatedAt: activity.updatedAt.toISOString(),
    }))

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      activities: serializedActivities,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    })

  } catch (error) {
    console.error('Error fetching activities:', error)
    return NextResponse.json(
      { error: 'Error obteniendo actividades' },
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
      name,
      description,
      shortDescription,
      durationHours,
      minParticipants,
      maxParticipants,
      basePrice,
      currency,
      ageRestriction,
      difficultyLevel,
      location,
      meetingPoint,
      whatIncludes,
      whatToBring,
      cancellationPolicy,
      isActive
    } = body

    // Validaciones
    if (!name || !basePrice || !minParticipants) {
      return NextResponse.json(
        { error: 'Nombre, precio base y participantes mínimos son requeridos' },
        { status: 400 }
      )
    }

    // Crear actividad
    const activity = await prisma.activity.create({
      data: {
        name,
        description: description || null,
        shortDescription: shortDescription || null,
        durationHours: durationHours ? parseFloat(durationHours) : null,
        minParticipants: parseInt(minParticipants),
        maxParticipants: maxParticipants ? parseInt(maxParticipants) : null,
        basePrice: parseFloat(basePrice),
        currency: currency || 'USD',
        ageRestriction: ageRestriction || null,
        difficultyLevel: difficultyLevel || null,
        location: location || null,
        meetingPoint: meetingPoint || null,
        whatIncludes: whatIncludes || null,
        whatToBring: whatToBring || null,
        cancellationPolicy: cancellationPolicy || null,
        isActive: isActive ?? true,
      },
      include: {
        _count: {
          select: {
            activitySchedules: true,
            activityBookings: true,
          }
        }
      }
    })

    // Serializar respuesta
    const serializedActivity = {
      ...activity,
      id: activity.id.toString(),
      basePrice: activity.basePrice.toString(),
      durationHours: activity.durationHours?.toString(),
      createdAt: activity.createdAt.toISOString(),
      updatedAt: activity.updatedAt.toISOString(),
    }

    return NextResponse.json(serializedActivity)

  } catch (error) {
    console.error('Error creating activity:', error)
    return NextResponse.json(
      { error: 'Error creando actividad' },
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

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const body = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: 'ID requerido' },
        { status: 400 }
      )
    }

    const {
      name,
      description,
      shortDescription,
      durationHours,
      minParticipants,
      maxParticipants,
      basePrice,
      currency,
      ageRestriction,
      difficultyLevel,
      location,
      meetingPoint,
      whatIncludes,
      whatToBring,
      cancellationPolicy,
      isActive
    } = body

    // Validaciones
    if (!name || !basePrice || !minParticipants) {
      return NextResponse.json(
        { error: 'Nombre, precio base y participantes mínimos son requeridos' },
        { status: 400 }
      )
    }

    // Actualizar actividad
    const activity = await prisma.activity.update({
      where: { id: BigInt(id) },
      data: {
        name,
        description: description || null,
        shortDescription: shortDescription || null,
        durationHours: durationHours ? parseFloat(durationHours) : null,
        minParticipants: parseInt(minParticipants),
        maxParticipants: maxParticipants ? parseInt(maxParticipants) : null,
        basePrice: parseFloat(basePrice),
        currency: currency || 'USD',
        ageRestriction: ageRestriction || null,
        difficultyLevel: difficultyLevel || null,
        location: location || null,
        meetingPoint: meetingPoint || null,
        whatIncludes: whatIncludes || null,
        whatToBring: whatToBring || null,
        cancellationPolicy: cancellationPolicy || null,
        isActive: isActive ?? true,
      },
      include: {
        _count: {
          select: {
            activitySchedules: true,
            activityBookings: true,
          }
        }
      }
    })

    // Serializar respuesta
    const serializedActivity = {
      ...activity,
      id: activity.id.toString(),
      basePrice: activity.basePrice.toString(),
      durationHours: activity.durationHours?.toString(),
      createdAt: activity.createdAt.toISOString(),
      updatedAt: activity.updatedAt.toISOString(),
    }

    return NextResponse.json(serializedActivity)

  } catch (error) {
    console.error('Error updating activity:', error)
    return NextResponse.json(
      { error: 'Error actualizando actividad' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
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

    // Verificar si la actividad tiene reservaciones activas
    const activeBookings = await prisma.activityBooking.count({
      where: {
        activityId: BigInt(id),
        reservationItem: {
          reservation: {
            status: { in: ['PENDING', 'CONFIRMED'] }
          }
        }
      }
    })

    if (activeBookings > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar la actividad porque tiene reservaciones activas' },
        { status: 400 }
      )
    }

    // Eliminar horarios asociados
    await prisma.activitySchedule.deleteMany({
      where: { activityId: BigInt(id) }
    })

    // Eliminar amenidades asociadas
    await prisma.entityAmenity.deleteMany({
      where: {
        entityType: 'ACTIVITY',
        entityId: BigInt(id)
      }
    })

    // Eliminar imágenes asociadas
    await prisma.entityImage.deleteMany({
      where: {
        entityType: 'ACTIVITY',
        entityId: BigInt(id)
      }
    })

    // Eliminar actividad
    await prisma.activity.delete({
      where: { id: BigInt(id) }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error deleting activity:', error)
    return NextResponse.json(
      { error: 'Error eliminando actividad' },
      { status: 500 }
    )
  }
}
