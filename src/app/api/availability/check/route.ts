import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const hotelId = searchParams.get('hotelId')
    const roomTypeId = searchParams.get('roomTypeId')
    const checkIn = searchParams.get('checkIn')
    const checkOut = searchParams.get('checkOut')
    const rooms = parseInt(searchParams.get('rooms') || '1')

    if (!hotelId || !checkIn || !checkOut) {
      return NextResponse.json(
        { error: 'Parámetros requeridos: hotelId, checkIn, checkOut' },
        { status: 400 }
      )
    }

    const startDate = new Date(checkIn)
    const endDate = new Date(checkOut)

    // Verificar bloques de disponibilidad
    const availabilityBlocks = await prisma.availabilityBlock.findMany({
      where: {
        hotelId: BigInt(hotelId),
        roomTypeId: roomTypeId ? BigInt(roomTypeId) : undefined,
        isActive: true,
        OR: [
          {
            AND: [
              { startDate: { lte: endDate } },
              { endDate: { gte: startDate } }
            ]
          }
        ]
      },
      include: {
        hotel: {
          select: {
            name: true
          }
        },
        roomType: {
          select: {
            name: true
          }
        }
      }
    })

    // Verificar reservaciones internas
    const internalReservations = await prisma.reservation.findMany({
      where: {
        status: {
          in: ['PENDING', 'CONFIRMED']
        },
        reservationItems: {
          some: {
            itemType: 'ACCOMMODATION',
            accommodationStay: {
              hotelId: BigInt(hotelId),
              roomTypeId: roomTypeId ? BigInt(roomTypeId) : undefined,
              OR: [
                {
                  AND: [
                    { checkInDate: { lte: endDate } },
                    { checkOutDate: { gte: startDate } }
                  ]
                }
              ]
            }
          }
        }
      },
      include: {
        reservationItems: {
          include: {
            accommodationStay: {
              include: {
                roomType: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      }
    })

    // Verificar reservaciones externas
    const externalReservations = await prisma.externalBooking.findMany({
      where: {
        hotelId: BigInt(hotelId),
        roomTypeId: roomTypeId ? BigInt(roomTypeId) : undefined,
        status: {
          in: ['PENDING', 'CONFIRMED']
        },
        OR: [
          {
            AND: [
              { checkIn: { lte: endDate } },
              { checkOut: { gte: startDate } }
            ]
          }
        ]
      },
      include: {
        hotel: {
          select: {
            name: true
          }
        },
        roomType: {
          select: {
            name: true
          }
        }
      }
    })

    // Calcular disponibilidad
    const totalRooms = await prisma.room.count({
      where: {
        hotelId: BigInt(hotelId),
        roomTypeId: roomTypeId ? BigInt(roomTypeId) : undefined,
        isActive: true
      }
    })

    // Contar habitaciones ocupadas
    const occupiedRooms = Math.max(
      internalReservations.length,
      externalReservations.length
    )

    const availableRooms = Math.max(0, totalRooms - occupiedRooms)
    const isAvailable = availableRooms >= rooms

    // Preparar respuesta
    const response = {
      isAvailable,
      availableRooms,
      totalRooms,
      requestedRooms: rooms,
      checkIn: checkIn,
      checkOut: checkOut,
      conflicts: {
        availabilityBlocks: availabilityBlocks.map(block => ({
          id: block.id.toString(),
          type: block.blockType,
          reason: block.reason,
          description: block.description,
          startDate: block.startDate.toISOString().split('T')[0],
          endDate: block.endDate.toISOString().split('T')[0],
          hotel: block.hotel.name,
          roomType: block.roomType?.name || 'Todas las habitaciones'
        })),
        internalReservations: internalReservations.map(reservation => ({
          id: reservation.id.toString(),
          confirmationNumber: reservation.confirmationNumber,
          checkIn: reservation.checkin?.toISOString().split('T')[0],
          checkOut: reservation.checkout?.toISOString().split('T')[0],
          status: reservation.status,
          roomType: reservation.reservationItems[0]?.accommodationStay?.roomType?.name || 'N/A'
        })),
        externalReservations: externalReservations.map(booking => ({
          id: booking.id.toString(),
          externalId: booking.externalId,
          platform: booking.platform,
          confirmationNumber: booking.confirmationNumber,
          checkIn: booking.checkIn.toISOString().split('T')[0],
          checkOut: booking.checkOut.toISOString().split('T')[0],
          status: booking.status,
          roomType: booking.roomType?.name || 'N/A'
        }))
      },
      summary: {
        totalConflicts: availabilityBlocks.length + internalReservations.length + externalReservations.length,
        availabilityBlocked: availabilityBlocks.length > 0,
        internalBookings: internalReservations.length,
        externalBookings: externalReservations.length
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error checking availability:', error)
    return NextResponse.json(
      { error: 'Error verificando disponibilidad' },
      { status: 500 }
    )
  }
}





