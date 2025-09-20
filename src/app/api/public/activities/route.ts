import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const search = searchParams.get('search') || ''
    const difficulty = searchParams.get('difficulty') || ''
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')

    const skip = (page - 1) * limit

    // Construir filtros
    const where: any = {
      isActive: true // Solo actividades activas para el público
    }
    
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

    if (minPrice || maxPrice) {
      where.basePrice = {}
      if (minPrice) where.basePrice.gte = parseFloat(minPrice)
      if (maxPrice) where.basePrice.lte = parseFloat(maxPrice)
    }

    // Obtener actividades con imágenes y amenidades
    const [activities, totalCount] = await Promise.all([
      prisma.activity.findMany({
        where,
        include: {
          entityImages: {
            where: { isPrimary: true },
            take: 1
          },
          entityAmenities: {
            include: {
              amenity: true
            }
          },
          _count: {
            select: {
              activitySchedules: {
                where: {
                  date: { gte: new Date() }
                }
              }
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
      images: activity.entityImages,
      amenities: activity.entityAmenities.map(ea => ea.amenity),
      availableSchedules: activity._count.activitySchedules,
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
    console.error('Error fetching public activities:', error)
    return NextResponse.json(
      { error: 'Error obteniendo actividades' },
      { status: 500 }
    )
  }
}
