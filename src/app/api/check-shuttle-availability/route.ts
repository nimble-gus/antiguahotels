import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { routeId, date, departureTime, passengers } = await request.json()

    if (!routeId || !date || !departureTime || !passengers) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos' },
        { status: 400 }
      )
    }

    // Buscar la ruta de shuttle
    const shuttleRoute = await prisma.shuttleRoute.findUnique({
      where: { id: BigInt(routeId) }
    })

    if (!shuttleRoute) {
      return NextResponse.json(
        { available: false, message: 'Ruta de shuttle no encontrada' },
        { status: 404 }
      )
    }

    // Verificar que no exceda la capacidad máxima del vehículo
    if (passengers > shuttleRoute.maxPassengers) {
      return NextResponse.json(
        { 
          available: false, 
          message: `Máximo ${shuttleRoute.maxPassengers} pasajeros permitidos`,
          availableSeats: shuttleRoute.maxPassengers
        },
        { status: 200 }
      )
    }

    // Por ahora, asumir que siempre hay disponibilidad si no excede la capacidad
    return NextResponse.json({
      available: true,
      message: 'Shuttle disponible',
      availableSeats: shuttleRoute.maxPassengers,
      price: parseFloat(shuttleRoute.basePrice.toString())
    })

  } catch (error) {
    console.error('Error checking shuttle availability:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
