import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createLocalDate } from '@/lib/date-utils'

async function checkAvailabilityLogic(roomTypeId: string, checkInDate: string, checkOutDate: string, adults?: number, children?: number) {
  console.log('🔍 Check availability logic:', { roomTypeId, checkInDate, checkOutDate, adults, children })

  if (!roomTypeId || !checkInDate || !checkOutDate) {
    return {
      available: false,
      message: 'roomTypeId, checkInDate y checkOutDate son requeridos'
    }
  }

  // Usar utilidades de fecha consistentes
  const checkIn = createLocalDate(checkInDate)
  const checkOut = createLocalDate(checkOutDate)

  console.log('📅 Converted dates:', { checkIn: checkIn.toISOString(), checkOut: checkOut.toISOString() })

  // Obtener información del tipo de habitación y hotel
  const roomType = await prisma.roomType.findUnique({
    where: { id: BigInt(roomTypeId) },
    select: {
      id: true,
      hotelId: true,
      maxAdults: true,
      maxChildren: true,
      hotel: {
        select: {
          id: true,
          name: true,
          checkInTime: true,
          checkOutTime: true
        }
      }
    }
  })

  if (!roomType) {
    return {
      available: false,
      message: 'Tipo de habitación no encontrado',
      availableRooms: 0
    }
  }

  console.log(`🏨 Hotel: ${roomType.hotel.name}`)
  console.log(`⏰ Check-in time: ${roomType.hotel.checkInTime}, Check-out time: ${roomType.hotel.checkOutTime}`)

  // Buscar habitación disponible usando la lógica inteligente
  const availableRoom = await findAvailableRoomWithTurnover(BigInt(roomTypeId), checkIn, checkOut, roomType.hotel)

  if (!availableRoom) {
    return {
      available: false,
      message: 'No hay habitaciones disponibles para estas fechas',
      availableRooms: 0
    }
  }

  // Verificar capacidad si se proporcionan adultos/niños
  if (adults || children) {
    if ((adults || 0) > roomType.maxAdults || (children || 0) > roomType.maxChildren) {
      return {
        available: false,
        message: 'Excede la capacidad máxima del tipo de habitación',
        availableRooms: 0
      }
    }
  }

  // Contar habitaciones disponibles del mismo tipo usando lógica de turnover
  const allRoomsOfType = await prisma.room.findMany({
    where: { roomTypeId: BigInt(roomTypeId), isActive: true }
  })

  let availableCount = 0
  for (const room of allRoomsOfType) {
    const isAvailable = await isRoomAvailableWithTurnover(
      room.id, 
      checkIn, 
      checkOut, 
      roomType.hotel.id,
      roomType.hotel.checkInTime!,
      roomType.hotel.checkOutTime!
    )
    if (isAvailable) availableCount++
  }

  return {
    available: availableCount > 0,
    message: availableCount > 0 ? `${availableCount} habitaciones disponibles` : 'No hay habitaciones disponibles',
    availableRooms: availableCount
  }
}


// Función auxiliar para verificar disponibilidad con same-day turnover
async function isRoomAvailableWithTurnover(
  roomId: bigint, 
  checkIn: Date, 
  checkOut: Date, 
  hotelId: bigint,
  hotelCheckInTime: Date,
  hotelCheckOutTime: Date
): Promise<boolean> {
  console.log(`🔍 Checking room ${roomId} with turnover logic`)
  
  // Buscar todas las reservaciones que podrían tener conflicto
  const potentialConflicts = await prisma.roomInventory.findMany({
    where: {
      roomId,
      stayDate: {
        gte: new Date(checkIn.getTime() - 24 * 60 * 60 * 1000), // Incluir día anterior
        lt: new Date(checkOut.getTime() + 24 * 60 * 60 * 1000)  // Incluir día posterior
      },
      isBlocked: true
    },
    include: {
      reservationItem: {
        include: {
          reservation: {
            select: {
              confirmationNumber: true,
              checkin: true,
              checkout: true
            }
          }
        }
      }
    }
  })

  console.log(`🔍 Found ${potentialConflicts.length} potential conflicts`)

  // Analizar cada conflicto potencial
  for (const conflict of potentialConflicts) {
    const reservation = conflict.reservationItem?.reservation
    if (!reservation) continue

    const existingCheckIn = new Date(reservation.checkin!)
    const existingCheckOut = new Date(reservation.checkout!)

    // Verificar si hay superposición real considerando horarios de hotel
    const hasRealConflict = checkDateTimeConflict(
      existingCheckIn, existingCheckOut,
      checkIn, checkOut,
      hotelCheckInTime, hotelCheckOutTime
    )

    if (hasRealConflict) {
      console.log(`❌ Real conflict with reservation ${reservation.confirmationNumber}`)
      return false
    }
  }

  return true
}

// Función auxiliar para encontrar habitación disponible con turnover
async function findAvailableRoomWithTurnover(roomTypeId: bigint, checkIn: Date, checkOut: Date, hotel: any) {
  const rooms = await prisma.room.findMany({
    where: {
      roomTypeId,
      isActive: true
    }
  })

  console.log(`🔍 Checking ${rooms.length} rooms for availability with turnover logic`)

  for (const room of rooms) {
    const isAvailable = await isRoomAvailableWithTurnover(
      room.id,
      checkIn,
      checkOut,
      hotel.id,
      hotel.checkInTime,
      hotel.checkOutTime
    )

    if (isAvailable) {
      console.log(`✅ Room ${room.code} is available with turnover logic`)
      return room
    }
  }

  return null
}

// Función para verificar conflictos considerando horarios de check-in/check-out
function checkDateTimeConflict(
  existingCheckIn: Date, 
  existingCheckOut: Date,
  newCheckIn: Date, 
  newCheckOut: Date,
  hotelCheckInTime: Date,
  hotelCheckOutTime: Date
): boolean {
  // Usar fechas en formato ISO para evitar problemas de timezone
  const existingCheckInStr = existingCheckIn.toISOString().split('T')[0]
  const existingCheckOutStr = existingCheckOut.toISOString().split('T')[0]
  const newCheckInStr = newCheckIn.toISOString().split('T')[0]
  const newCheckOutStr = newCheckOut.toISOString().split('T')[0]

  console.log(`🕐 Checking time conflict:`)
  console.log(`  Existing: ${existingCheckInStr} to ${existingCheckOutStr}`)
  console.log(`  New: ${newCheckInStr} to ${newCheckOutStr}`)
  console.log(`  Hotel check-in: ${hotelCheckInTime?.toTimeString?.() || '15:00:00'}`)
  console.log(`  Hotel check-out: ${hotelCheckOutTime?.toTimeString?.() || '11:00:00'}`)

  // CASO 1: Same-day turnover - Nueva reserva termina cuando existente comienza
  if (newCheckOutStr === existingCheckInStr) {
    console.log(`🔄 Same day turnover detected - New checkout (${newCheckOutStr}) = Existing checkin (${existingCheckInStr})`)
    console.log(`  ✅ ALLOWED: New guest checks out at 11:00 AM, Existing guest checks in at 3:00 PM`)
    return false // No hay conflicto - permitir same-day turnover
  }

  // CASO 2: Same-day turnover - Reserva existente termina cuando nueva comienza
  if (existingCheckOutStr === newCheckInStr) {
    console.log(`🔄 Same day turnover detected - Existing checkout (${existingCheckOutStr}) = New checkin (${newCheckInStr})`)
    console.log(`  ✅ ALLOWED: Existing guest checks out at 11:00 AM, New guest checks in at 3:00 PM`)
    return false // No hay conflicto - permitir same-day turnover
  }

  // CASO 3: No hay superposición de fechas
  if (newCheckOutStr <= existingCheckInStr || newCheckInStr >= existingCheckOutStr) {
    console.log(`✅ No date overlap - no conflict`)
    return false
  }

  // CASO 4: Superposición real de días (conflicto verdadero)
  console.log(`❌ REAL CONFLICT: Dates overlap beyond same-day turnover`)
  console.log(`  Existing occupies: ${existingCheckInStr} to ${existingCheckOutStr}`)
  console.log(`  New requests: ${newCheckInStr} to ${newCheckOutStr}`)
  return true
}


// Método GET para compatibilidad con query params
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const roomTypeId = searchParams.get('roomTypeId')
    const checkInDate = searchParams.get('checkInDate')
    const checkOutDate = searchParams.get('checkOutDate')
    const adults = searchParams.get('adults') ? parseInt(searchParams.get('adults')!) : undefined
    const children = searchParams.get('children') ? parseInt(searchParams.get('children')!) : undefined

    const result = await checkAvailabilityLogic(roomTypeId!, checkInDate!, checkOutDate!, adults, children)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error checking availability (GET):', error)
    return NextResponse.json(
      { available: false, message: 'Error verificando disponibilidad' },
      { status: 500 }
    )
  }
}

// Método POST para compatibilidad con body
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { roomTypeId, checkInDate, checkOutDate, adults, children } = body

    console.log('📡 POST check-availability body:', body)

    const result = await checkAvailabilityLogic(roomTypeId, checkInDate, checkOutDate, adults, children)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error checking availability (POST):', error)
    return NextResponse.json(
      { available: false, message: 'Error verificando disponibilidad' },
      { status: 500 }
    )
  }
}