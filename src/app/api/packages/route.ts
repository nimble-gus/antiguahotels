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
    const active = searchParams.get('active')
    const search = searchParams.get('search') || ''

    const skip = (page - 1) * limit

    // Construir filtros
    const where: any = {}
    
    if (active === 'true') {
      where.isActive = true
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    console.log('🔍 Fetching packages with filters:', { page, limit, active, search, where })

    // Obtener paquetes con información relacionada
    const [packages, totalCount] = await Promise.all([
      prisma.package.findMany({
        where,
        include: {
          packageHotels: {
            include: {
              hotel: {
                select: {
                  name: true,
                  city: true
                }
              },
              roomType: {
                select: {
                  name: true
                }
              }
            }
          },
          packageActivities: {
            include: {
              activity: {
                select: {
                  name: true,
                  durationHours: true
                }
              }
            }
          },
          _count: {
            select: {
              packageBookings: true,
              packageSessions: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.package.count({ where })
    ])

    // Obtener imágenes principales para cada paquete
    const packagesWithImages = await Promise.all(
      packages.map(async (pkg) => {
        const primaryImage = await prisma.entityImage.findFirst({
          where: {
            entityType: 'PACKAGE',
            entityId: pkg.id,
            isPrimary: true
          }
        })
        
        return {
          ...pkg,
          primaryImage: primaryImage ? {
            id: primaryImage.id.toString(),
            imageUrl: primaryImage.imageUrl,
            altText: primaryImage.altText
          } : null
        }
      })
    )

    // Serializar BigInt y Decimal
    const serializedPackages = packagesWithImages.map(pkg => ({
      ...pkg,
      id: pkg.id.toString(),
      basePrice: pkg.basePrice.toString(),
      createdAt: pkg.createdAt.toISOString(),
      updatedAt: pkg.updatedAt.toISOString(),
      packageHotels: pkg.packageHotels.map(ph => ({
        ...ph,
        id: ph.id.toString(),
        packageId: ph.packageId.toString(),
        hotelId: ph.hotelId.toString(),
        roomTypeId: ph.roomTypeId.toString(),
        createdAt: ph.createdAt.toISOString(),
      })),
      packageActivities: pkg.packageActivities.map(pa => ({
        ...pa,
        id: pa.id.toString(),
        packageId: pa.packageId.toString(),
        activityId: pa.activityId.toString(),
        createdAt: pa.createdAt.toISOString(),
      })),
    }))

    console.log('📦 Found packages:', serializedPackages.length)

    return NextResponse.json({
      packages: serializedPackages,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      }
    })

  } catch (error) {
    console.error('Error fetching packages:', error)
    return NextResponse.json(
      { error: 'Error obteniendo paquetes' },
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
    console.log('📦 Creating package:', body)

    const {
      name,
      description,
      shortDescription,
      durationDays,
      durationNights,
      minParticipants,
      maxParticipants,
      basePrice,
      currency,
      capacity,
      whatIncludes,
      whatExcludes,
      itinerary,
      isActive,
      hotels, // Array de hoteles con { hotelId, roomTypeId, nights, checkInDay }
      activities // Array de actividades con { activityId, dayNumber, participantsIncluded }
    } = body

    // Validaciones básicas
    if (!name || !description || !durationDays || !durationNights || !basePrice) {
      return NextResponse.json(
        { error: 'Campos requeridos: nombre, descripción, duración y precio base' },
        { status: 400 }
      )
    }

    // Crear paquete en transacción
    const result = await prisma.$transaction(async (tx) => {
      // Crear paquete principal
      const newPackage = await tx.package.create({
        data: {
          name,
          description,
          shortDescription,
          durationDays: parseInt(durationDays),
          durationNights: parseInt(durationNights),
          minParticipants: parseInt(minParticipants) || 1,
          maxParticipants: maxParticipants ? parseInt(maxParticipants) : null,
          basePrice: parseFloat(basePrice),
          currency: currency || 'USD',
          capacity: capacity ? parseInt(capacity) : null,
          whatIncludes,
          whatExcludes,
          itinerary,
          active: isActive !== false,
        }
      })

      // Agregar hoteles al paquete
      if (hotels && Array.isArray(hotels)) {
        for (const hotel of hotels) {
          await tx.packageHotel.create({
            data: {
              packageId: newPackage.id,
              hotelId: BigInt(hotel.hotelId),
              roomTypeId: BigInt(hotel.roomTypeId),
              nights: parseInt(hotel.nights),
              checkInDay: parseInt(hotel.checkInDay),
            }
          })
        }
      }

      // Agregar actividades al paquete
      if (activities && Array.isArray(activities)) {
        for (const activity of activities) {
          await tx.packageActivity.create({
            data: {
              packageId: newPackage.id,
              activityId: BigInt(activity.activityId),
              dayNumber: parseInt(activity.dayNumber),
              participantsIncluded: activity.participantsIncluded ? parseInt(activity.participantsIncluded) : null,
            }
          })
        }
      }

      return newPackage
    })

    console.log('✅ Package created:', result.id)

    return NextResponse.json({
      success: true,
      package: {
        ...result,
        id: result.id.toString(),
        basePrice: result.basePrice.toString(),
        createdAt: result.createdAt.toISOString(),
        updatedAt: result.updatedAt.toISOString(),
      },
      message: 'Paquete creado exitosamente'
    })

  } catch (error) {
    console.error('Error creating package:', error)
    return NextResponse.json(
      { error: 'Error creando paquete' },
      { status: 500 }
    )
  }
}
