import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { packageId, startDate, endDate, participants } = await request.json()

    if (!packageId || !startDate || !endDate || !participants) {
      return NextResponse.json(
        { error: 'packageId, startDate, endDate y participants son requeridos' },
        { status: 400 }
      )
    }

    // Obtener información completa del paquete con sus componentes
    const packageData = await prisma.package.findUnique({
      where: { id: BigInt(packageId) },
      include: {
        packageHotels: {
          include: {
            hotel: true,
            roomType: true
          }
        },
        packageActivities: {
          include: {
            activity: true
          }
        }
      }
    })

    if (!packageData) {
      return NextResponse.json(
        { error: 'Paquete no encontrado' },
        { status: 404 }
      )
    }

    // Validar límites del paquete
    const withinMinLimit = participants >= packageData.minParticipants
    const withinMaxLimit = !packageData.maxParticipants || participants <= packageData.maxParticipants

    if (!withinMinLimit) {
      return NextResponse.json({
        available: false,
        message: `Mínimo ${packageData.minParticipants} participantes requeridos`,
        withinLimits: false
      })
    }

    if (!withinMaxLimit) {
      return NextResponse.json({
        available: false,
        message: `Máximo ${packageData.maxParticipants} participantes permitidos`,
        withinLimits: false
      })
    }

    // Verificar disponibilidad de habitaciones
    const startDateObj = new Date(startDate)
    const endDateObj = new Date(endDate)
    const availabilityIssues = []

    for (const packageHotel of packageData.packageHotels) {
      const checkInDate = new Date(startDateObj)
      checkInDate.setDate(checkInDate.getDate() + packageHotel.checkInDay - 1)
      
      const checkOutDate = new Date(checkInDate)
      checkOutDate.setDate(checkOutDate.getDate() + packageHotel.nights)

      // Verificar disponibilidad de habitaciones
      const existingBookings = await prisma.accommodationStay.count({
        where: {
          hotelId: packageHotel.hotelId,
          roomTypeId: packageHotel.roomTypeId,
          OR: [
            {
              checkInDate: { lte: checkInDate },
              checkOutDate: { gt: checkInDate }
            },
            {
              checkInDate: { lt: checkOutDate },
              checkOutDate: { gte: checkOutDate }
            },
            {
              checkInDate: { gte: checkInDate },
              checkOutDate: { lte: checkOutDate }
            }
          ]
        }
      })

      // Verificar capacidad del hotel
      const hotelCapacity = await prisma.room.count({
        where: {
          hotelId: packageHotel.hotelId,
          roomTypeId: packageHotel.roomTypeId
        }
      })

      if (existingBookings >= hotelCapacity) {
        availabilityIssues.push(`No hay disponibilidad en ${packageHotel.hotel.name} para las fechas seleccionadas`)
      }
    }

    // Verificar disponibilidad de actividades (simplificado)
    for (const packageActivity of packageData.packageActivities) {
      // Aquí podrías agregar lógica para verificar horarios específicos de actividades
      // Por ahora, asumimos que las actividades están disponibles si el paquete está activo
    }

    const isAvailable = availabilityIssues.length === 0

    return NextResponse.json({
      available: isAvailable,
      packageName: packageData.name,
      participants: participants,
      startDate: startDate,
      endDate: endDate,
      durationDays: packageData.durationDays,
      withinLimits: withinMinLimit && withinMaxLimit,
      availabilityIssues: availabilityIssues,
      message: isAvailable 
        ? 'Paquete disponible para las fechas seleccionadas'
        : availabilityIssues[0] || 'No hay disponibilidad'
    })

  } catch (error) {
    console.error('Error checking package availability:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

