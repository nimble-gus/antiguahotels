import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const active = searchParams.get('active')
    const search = searchParams.get('search') || ''
    const direction = searchParams.get('direction') || ''

    const skip = (page - 1) * limit

    // Construir filtros
    const where: any = {}
    
    if (active === 'true') {
      where.isActive = true
    } else if (active === 'false') {
      where.isActive = false
    }

    if (direction && ['ARRIVAL', 'DEPARTURE', 'ROUNDTRIP'].includes(direction)) {
      where.direction = direction
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { fromAirport: { name: { contains: search, mode: 'insensitive' } } },
        { toHotel: { name: { contains: search, mode: 'insensitive' } } },
      ]
    }

    console.log('🚐 Fetching shuttle routes with filters:', { page, limit, active, search, direction, where })

    // Obtener rutas con información relacionada
    const [routes, totalCount] = await Promise.all([
      prisma.shuttleRoute.findMany({
        where,
        include: {
          fromAirport: {
            select: {
              id: true,
              iata: true,
              name: true,
              city: true,
              country: true
            }
          },
          toHotel: {
            select: {
              id: true,
              name: true,
              city: true,
              code: true
            }
          },
          _count: {
            select: {
              shuttleTransfers: true,
              shuttleAvailability: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.shuttleRoute.count({ where })
    ])

    console.log('🚐 Database query completed. Found routes:', routes.length)

    // Serializar BigInt y Decimal
    const serializedRoutes = routes.map(route => ({
      ...route,
      id: route.id.toString(),
      fromAirportId: route.fromAirportId.toString(),
      toHotelId: route.toHotelId.toString(),
      basePrice: route.basePrice.toString(),
      createdAt: route.createdAt.toISOString(),
      updatedAt: route.updatedAt.toISOString(),
      fromAirport: {
        ...route.fromAirport,
        id: route.fromAirport.id.toString()
      },
      toHotel: {
        ...route.toHotel,
        id: route.toHotel.id.toString()
      }
    }))

    console.log('🚐 Found routes:', serializedRoutes.length)

    return NextResponse.json({
      routes: serializedRoutes,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      }
    })

  } catch (error) {
    console.error('Error fetching shuttle routes:', error)
    return NextResponse.json(
      { error: 'Error obteniendo rutas de shuttle' },
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
    console.log('🚐 Creating shuttle route:', body)

    const {
      name,
      description,
      fromAirportId,
      toHotelId,
      direction,
      distanceKm,
      estimatedDurationMinutes,
      basePrice,
      currency,
      isShared,
      maxPassengers,
      vehicleType,
      isActive
    } = body

    // Validaciones básicas
    if (!name || !fromAirportId || !toHotelId || !direction || !basePrice) {
      return NextResponse.json(
        { error: 'Campos requeridos: nombre, aeropuerto, hotel, dirección y precio' },
        { status: 400 }
      )
    }

    // Verificar que el aeropuerto existe
    const airport = await prisma.airport.findUnique({
      where: { id: BigInt(fromAirportId) }
    })

    if (!airport) {
      return NextResponse.json(
        { error: 'Aeropuerto no encontrado' },
        { status: 404 }
      )
    }

    // Verificar que el hotel existe
    const hotel = await prisma.hotel.findUnique({
      where: { id: BigInt(toHotelId) }
    })

    if (!hotel) {
      return NextResponse.json(
        { error: 'Hotel no encontrado' },
        { status: 404 }
      )
    }

    // Crear ruta de shuttle
    const result = await prisma.shuttleRoute.create({
      data: {
        name,
        description,
        fromAirportId: BigInt(fromAirportId),
        toHotelId: BigInt(toHotelId),
        direction,
        distanceKm: distanceKm ? parseFloat(distanceKm) : null,
        estimatedDurationMinutes: estimatedDurationMinutes ? parseInt(estimatedDurationMinutes) : null,
        basePrice: parseFloat(basePrice),
        currency: currency || 'USD',
        isShared: isShared !== false,
        maxPassengers: parseInt(maxPassengers) || 8,
        vehicleType,
        isActive: isActive !== false,
      }
    })

    console.log('✅ Shuttle route created successfully:', result.name)

    return NextResponse.json({
      success: true,
      route: {
        ...result,
        id: result.id.toString(),
        fromAirportId: result.fromAirportId.toString(),
        toHotelId: result.toHotelId.toString(),
        basePrice: result.basePrice.toString(),
        createdAt: result.createdAt.toISOString(),
        updatedAt: result.updatedAt.toISOString(),
      },
      message: 'Ruta de shuttle creada exitosamente'
    })

  } catch (error) {
    console.error('Error creating shuttle route:', error)
    return NextResponse.json(
      { error: 'Error creando ruta de shuttle' },
      { status: 500 }
    )
  }
}








