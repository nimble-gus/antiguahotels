import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const routeId = params.id

    console.log('🚐 Fetching shuttle route with ID:', routeId)

    const route = await prisma.shuttleRoute.findUnique({
      where: {
        id: BigInt(routeId)
      },
      include: {
        fromAirport: true,
        toHotel: true,
        _count: {
          select: {
            shuttleTransfers: true,
            shuttleAvailability: true,
            shuttleSchedules: true
          }
        }
      }
    })

    if (!route) {
      return NextResponse.json({ error: 'Ruta de shuttle no encontrada' }, { status: 404 })
    }

    console.log('✅ Shuttle route found:', route.name)

    // Serializar BigInt y Decimal
    const serializedRoute = {
      ...route,
      id: route.id.toString(),
      fromAirportId: route.fromAirportId.toString(),
      toHotelId: route.toHotelId.toString(),
      basePrice: route.basePrice.toString(),
      createdAt: route.createdAt.toISOString(),
      updatedAt: route.updatedAt.toISOString(),
      fromAirport: {
        ...route.fromAirport,
        id: route.fromAirport.id.toString(),
        createdAt: route.fromAirport.createdAt.toISOString()
      },
      toHotel: {
        ...route.toHotel,
        id: route.toHotel.id.toString(),
        createdAt: route.toHotel.createdAt.toISOString(),
        updatedAt: route.toHotel.updatedAt.toISOString()
      }
    }

    return NextResponse.json(serializedRoute)

  } catch (error) {
    console.error('Error fetching shuttle route:', error)
    return NextResponse.json(
      { error: 'Error obteniendo ruta de shuttle' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const routeId = params.id
    const body = await request.json()

    console.log('🚐 Updating shuttle route with ID:', routeId)

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

    // Actualizar ruta
    const result = await prisma.shuttleRoute.update({
      where: {
        id: BigInt(routeId)
      },
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

    console.log('✅ Shuttle route updated successfully:', result.name)

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
      message: 'Ruta de shuttle actualizada exitosamente'
    })

  } catch (error) {
    console.error('Error updating shuttle route:', error)
    return NextResponse.json(
      { error: 'Error actualizando ruta de shuttle' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const routeId = params.id

    console.log('🚐 Deleting shuttle route with ID:', routeId)

    // Verificar si la ruta tiene transfers activos
    const activeTransfers = await prisma.shuttleTransfer.count({
      where: {
        shuttleRouteId: BigInt(routeId)
      }
    })

    if (activeTransfers > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar una ruta con transfers activos' },
        { status: 400 }
      )
    }

    await prisma.$transaction(async (tx) => {
      // Eliminar horarios de la ruta
      await tx.shuttleSchedule.deleteMany({
        where: { shuttleRouteId: BigInt(routeId) }
      })

      // Eliminar disponibilidad de la ruta
      await tx.shuttleAvailability.deleteMany({
        where: { shuttleRouteId: BigInt(routeId) }
      })

      // Finalmente eliminar la ruta
      await tx.shuttleRoute.delete({
        where: { id: BigInt(routeId) }
      })
    })

    console.log('✅ Shuttle route deleted successfully')

    return NextResponse.json({
      success: true,
      message: 'Ruta de shuttle eliminada exitosamente'
    })

  } catch (error) {
    console.error('Error deleting shuttle route:', error)
    return NextResponse.json(
      { error: 'Error eliminando ruta de shuttle' },
      { status: 500 }
    )
  }
}








