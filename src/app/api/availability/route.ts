import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createLocalDate, formatDateForDB } from '@/lib/date-utils'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const roomTypeId = searchParams.get('roomTypeId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!roomTypeId || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'roomTypeId, startDate y endDate son requeridos' },
        { status: 400 }
      )
    }

    // Usar fechas UTC para que coincidan con el inventario en la BD
    const start = new Date(startDate + 'T00:00:00.000Z')
    const end = new Date(endDate + 'T00:00:00.000Z')
    
    console.log('🔍 Availability check:', { startDate, endDate, start, end })

    // Obtener todas las habitaciones de este tipo
    const rooms = await prisma.room.findMany({
      where: {
        roomTypeId: BigInt(roomTypeId),
        isActive: true,
      },
      select: {
        id: true,
        code: true,
      }
    })

    if (rooms.length === 0) {
      return NextResponse.json({
        availableDates: [],
        unavailableDates: [],
        roomCount: 0,
        message: 'No hay habitaciones de este tipo'
      })
    }

    // Generar array de fechas a verificar usando strings consistentes
    // IMPORTANTE: No incluir el checkout day (como en findAvailableRoom)
    const datesToCheck = []
    const currentDate = new Date(start)
    
    while (currentDate < end) { // Cambiar <= por < para excluir checkout
      // Crear fecha UTC para que coincida con el inventario
      const dateString = currentDate.toISOString().split('T')[0]
      const utcDate = new Date(dateString + 'T00:00:00.000Z')
      datesToCheck.push({ date: utcDate, dateString })
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    console.log('📅 Dates to check:', datesToCheck.map(d => d.dateString))

    // Verificar disponibilidad para cada fecha
    const availabilityMap = new Map<string, number>() // fecha -> habitaciones disponibles

    for (const dateInfo of datesToCheck) {
      let availableRoomsForDate = 0

      for (const room of rooms) {
        const conflictingInventory = await prisma.roomInventory.count({
          where: {
            roomId: room.id,
            stayDate: dateInfo.date,
            OR: [
              { isBlocked: true },
              { reservationItemId: { not: null } }
            ]
          }
        })

        // Solo log si hay conflicto para debug específico
        if (conflictingInventory > 0) {
          console.log(`🚫 Room ${room.code} blocked on ${dateInfo.dateString} (conflicts: ${conflictingInventory})`)
        }

        if (conflictingInventory === 0) {
          availableRoomsForDate++
        }
      }

      // Usar el dateString ya formateado consistentemente
      availabilityMap.set(dateInfo.dateString, availableRoomsForDate)
    }

    // Separar fechas disponibles y no disponibles
    const availableDates: string[] = []
    const unavailableDates: string[] = []
    const dateAvailability: { [date: string]: number } = {}

    availabilityMap.forEach((count, date) => {
      dateAvailability[date] = count
      if (count > 0) {
        availableDates.push(date)
      } else {
        unavailableDates.push(date)
      }
    })

    return NextResponse.json({
      availableDates,
      unavailableDates,
      dateAvailability,
      roomCount: rooms.length,
      totalRoomsAvailable: availableDates.length > 0 ? Math.max(...Object.values(dateAvailability)) : 0
    })

  } catch (error) {
    console.error('Error checking availability:', error)
    return NextResponse.json(
      { error: 'Error verificando disponibilidad' },
      { status: 500 }
    )
  }
}

// Endpoint para verificar disponibilidad de un rango específico
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { roomTypeId, checkInDate, checkOutDate } = body

    if (!roomTypeId || !checkInDate || !checkOutDate) {
      return NextResponse.json(
        { error: 'Datos requeridos: roomTypeId, checkInDate, checkOutDate' },
        { status: 400 }
      )
    }

    const checkIn = new Date(checkInDate)
    const checkOut = new Date(checkOutDate)

    // Validar fechas
    if (checkIn >= checkOut) {
      return NextResponse.json(
        { error: 'La fecha de salida debe ser posterior a la de entrada' },
        { status: 400 }
      )
    }

    if (checkIn < new Date()) {
      return NextResponse.json(
        { error: 'La fecha de entrada no puede ser en el pasado' },
        { status: 400 }
      )
    }

    // Obtener habitaciones de este tipo
    const rooms = await prisma.room.findMany({
      where: {
        roomTypeId: BigInt(roomTypeId),
        isActive: true,
      }
    })

    if (rooms.length === 0) {
      return NextResponse.json({
        available: false,
        message: 'No hay habitaciones de este tipo',
        availableRooms: []
      })
    }

    // Verificar qué habitaciones están disponibles para todo el rango
    const availableRooms = []

    for (const room of rooms) {
      const conflictingInventory = await prisma.roomInventory.count({
        where: {
          roomId: room.id,
          stayDate: {
            gte: checkIn,
            lt: checkOut,
          },
          OR: [
            { isBlocked: true },
            { reservationItemId: { not: null } }
          ]
        }
      })

      if (conflictingInventory === 0) {
        availableRooms.push({
          id: room.id.toString(),
          code: room.code,
        })
      }
    }

    return NextResponse.json({
      available: availableRooms.length > 0,
      availableRooms,
      totalRooms: rooms.length,
      message: availableRooms.length > 0 
        ? `${availableRooms.length} habitaciones disponibles`
        : 'No hay habitaciones disponibles para estas fechas'
    })

  } catch (error) {
    console.error('Error checking range availability:', error)
    return NextResponse.json(
      { error: 'Error verificando disponibilidad del rango' },
      { status: 500 }
    )
  }
}
