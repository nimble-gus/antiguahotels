import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('🎯 Fetching public shuttle routes...')
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const fromAirport = searchParams.get('fromAirport')
    const toHotel = searchParams.get('toHotel')
    const direction = searchParams.get('direction')
    const date = searchParams.get('date')

    const skip = (page - 1) * limit

    // Construir filtros
    const where: any = {
      isActive: true
    }

    if (fromAirport) {
      where.fromAirportId = BigInt(fromAirport)
    }

    if (toHotel) {
      where.toHotelId = BigInt(toHotel)
    }

    if (direction) {
      where.direction = direction
    }

    // Obtener rutas de shuttle con información relacionada
    const shuttleRoutes = await prisma.shuttleRoute.findMany({
      where,
      include: {
        fromAirport: true,
        toHotel: true,
        shuttleSchedules: {
          where: {
            isActive: true
          }
        },
        shuttleAvailability: {
          where: {
            isActive: true,
            availableSeats: { gt: 0 },
            ...(date && {
              date: {
                gte: new Date(date),
                lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000)
              }
            })
          },
          orderBy: {
            departureTime: 'asc'
          }
        }
      },
      orderBy: [
        { fromAirport: { name: 'asc' } },
        { toHotel: { name: 'asc' } }
      ],
      skip,
      take: limit,
    })

    console.log(`✅ Found ${shuttleRoutes.length} shuttle routes`)

    // Obtener el total de rutas para la paginación
    const totalCount = await prisma.shuttleRoute.count({ where })

    const total = totalCount
    const totalPages = Math.ceil(total / limit)

    // Formatear datos para el frontend
    const serializedRoutes = shuttleRoutes.map(route => {
      // Calcular disponibilidad para la fecha específica
      const todayAvailability = route.shuttleAvailability.filter(av => {
        if (!date) return true
        const avDate = new Date(av.date).toDateString()
        const searchDate = new Date(date).toDateString()
        return avDate === searchDate
      })

      // Obtener horarios regulares
      const regularSchedules = route.shuttleSchedules.map(schedule => ({
        id: schedule.id.toString(),
        departureTime: schedule.departureTime.toISOString().split('T')[1].substring(0, 5),
        daysOfWeek: schedule.daysOfWeek,
        isActive: schedule.isActive
      }))

      // Obtener disponibilidad específica
      const specificAvailability = todayAvailability.map(av => ({
        id: av.id.toString(),
        date: av.date.toISOString().split('T')[0],
        departureTime: av.departureTime.toISOString().split('T')[1].substring(0, 5),
        availableSeats: av.availableSeats,
        priceOverride: av.priceOverride ? parseFloat(av.priceOverride.toString()) : null,
        isActive: av.isActive
      }))

      return {
        id: route.id.toString(),
        name: route.name,
        description: route.description,
        fromAirport: {
          id: route.fromAirport.id.toString(),
          name: route.fromAirport.name,
          iata: route.fromAirport.iata,
          city: route.fromAirport.city,
          country: route.fromAirport.country
        },
        toHotel: {
          id: route.toHotel.id.toString(),
          name: route.toHotel.name,
          city: route.toHotel.city,
          address: route.toHotel.address,
          rating: route.toHotel.rating ? parseFloat(route.toHotel.rating.toString()) : null
        },
        direction: route.direction,
        distanceKm: route.distanceKm ? parseFloat(route.distanceKm.toString()) : null,
        estimatedDurationMinutes: route.estimatedDurationMinutes,
        basePrice: parseFloat(route.basePrice.toString()),
        currency: route.currency,
        isShared: route.isShared,
        maxPassengers: route.maxPassengers,
        vehicleType: route.vehicleType,
        isActive: route.isActive,
        regularSchedules,
        specificAvailability,
        // Información calculada
        duration: route.estimatedDurationMinutes 
          ? `${Math.floor(route.estimatedDurationMinutes / 60)}h ${route.estimatedDurationMinutes % 60}m`
          : 'Variable',
        pricePerPerson: parseFloat(route.basePrice.toString()),
        totalPrice: parseFloat(route.basePrice.toString()),
        availableToday: todayAvailability.length > 0,
        nextDeparture: specificAvailability.length > 0 
          ? specificAvailability[0].departureTime 
          : null
      }
    })

    console.log(`📤 Returning ${serializedRoutes.length} serialized shuttle routes (page ${page}/${totalPages})`)

    return NextResponse.json({
      routes: serializedRoutes,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    })

  } catch (error) {
    console.error('❌ Error fetching shuttle routes:', error)
    return NextResponse.json(
      { 
        error: 'Error obteniendo rutas de shuttle',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}





