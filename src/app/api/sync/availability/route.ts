import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { hotelId, platform, startDate, endDate } = await request.json()

    if (!hotelId || !platform) {
      return NextResponse.json(
        { error: 'Hotel ID and platform are required' },
        { status: 400 }
      )
    }

    const start = startDate ? new Date(startDate) : new Date()
    const end = endDate ? new Date(endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 días

    console.log(`🔄 Starting availability sync for hotel ${hotelId} on ${platform}`)

    // Obtener hotel
    const hotel = await prisma.hotel.findUnique({
      where: { id: BigInt(hotelId) },
      include: {
        roomTypes: true
      }
    })

    if (!hotel) {
      return NextResponse.json(
        { error: 'Hotel not found' },
        { status: 404 }
      )
    }

    // Crear registro de sincronización
    const syncRecord = await prisma.platformSync.create({
      data: {
        platform: platform as any,
        hotelId: BigInt(hotelId),
        lastSyncAt: new Date(),
        syncStatus: 'IN_PROGRESS',
        recordsProcessed: 0,
        recordsUpdated: 0,
        recordsCreated: 0
      }
    })

    try {
      let recordsProcessed = 0
      let recordsUpdated = 0
      let recordsCreated = 0

      // Obtener reservaciones internas
      const internalReservations = await prisma.reservation.findMany({
        where: {
          status: { in: ['PENDING', 'CONFIRMED'] },
          checkin: { gte: start, lte: end },
          reservationItems: {
            some: {
              itemType: 'ACCOMMODATION',
              accommodationStay: {
                hotelId: BigInt(hotelId)
              }
            }
          }
        },
        include: {
          reservationItems: {
            include: {
              accommodationStay: {
                include: {
                  roomType: true
                }
              }
            }
          }
        }
      })

      // Obtener reservaciones externas
      const externalReservations = await prisma.externalBooking.findMany({
        where: {
          hotelId: BigInt(hotelId),
          status: { in: ['PENDING', 'CONFIRMED'] },
          checkIn: { gte: start, lte: end }
        },
        include: {
          roomType: true
        }
      })

      // Obtener bloques de disponibilidad
      const availabilityBlocks = await prisma.availabilityBlock.findMany({
        where: {
          hotelId: BigInt(hotelId),
          isActive: true,
          OR: [
            {
              AND: [
                { startDate: { lte: end } },
                { endDate: { gte: start } }
              ]
            }
          ]
        }
      })

      // Calcular disponibilidad por tipo de habitación y fecha
      const availabilityData = new Map()

      for (const roomType of hotel.roomTypes) {
        const roomTypeId = roomType.id.toString()
        availabilityData.set(roomTypeId, {
          roomType,
          availability: new Map()
        })

        // Obtener habitaciones de este tipo
        const rooms = await prisma.room.findMany({
          where: {
            hotelId: BigInt(hotelId),
            roomTypeId: roomType.id,
            isActive: true
          }
        })

        const totalRooms = rooms.length

        // Calcular disponibilidad para cada fecha
        for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
          const dateStr = date.toISOString().split('T')[0]
          
          // Contar habitaciones ocupadas por reservaciones internas
          let internalOccupied = 0
          for (const reservation of internalReservations) {
            if (reservation.checkin && reservation.checkout) {
              const checkIn = new Date(reservation.checkin)
              const checkOut = new Date(reservation.checkout)
              
              if (date >= checkIn && date < checkOut) {
                for (const item of reservation.reservationItems) {
                  if (item.itemType === 'ACCOMMODATION' && 
                      item.accommodationStay?.roomTypeId === roomType.id) {
                    internalOccupied += item.quantity
                  }
                }
              }
            }
          }

          // Contar habitaciones ocupadas por reservaciones externas
          let externalOccupied = 0
          for (const reservation of externalReservations) {
            const checkIn = new Date(reservation.checkIn)
            const checkOut = new Date(reservation.checkOut)
            
            if (date >= checkIn && date < checkOut && 
                reservation.roomTypeId === roomType.id) {
              externalOccupied += reservation.rooms
            }
          }

          // Verificar bloques de disponibilidad
          let isBlocked = false
          for (const block of availabilityBlocks) {
            const blockStart = new Date(block.startDate)
            const blockEnd = new Date(block.endDate)
            
            if (date >= blockStart && date < blockEnd && 
                (!block.roomTypeId || block.roomTypeId === roomType.id)) {
              isBlocked = true
              break
            }
          }

          const availableRooms = Math.max(0, totalRooms - Math.max(internalOccupied, externalOccupied))
          
          availabilityData.get(roomTypeId).availability.set(dateStr, {
            totalRooms,
            internalOccupied,
            externalOccupied,
            availableRooms,
            isBlocked,
            occupancyRate: totalRooms > 0 ? ((totalRooms - availableRooms) / totalRooms) * 100 : 0
          })

          recordsProcessed++
        }
      }

      // Aquí iría la lógica para enviar la disponibilidad a Booking.com
      // Por ahora solo registramos los datos
      console.log('📊 Availability calculated:', {
        hotel: hotel.name,
        roomTypes: hotel.roomTypes.length,
        dateRange: { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] },
        totalRecords: recordsProcessed
      })

      // Actualizar registro de sincronización
      await prisma.platformSync.update({
        where: { id: syncRecord.id },
        data: {
          syncStatus: 'COMPLETED',
          recordsProcessed,
          recordsUpdated,
          recordsCreated,
          syncDuration: Math.floor((Date.now() - syncRecord.lastSyncAt.getTime()) / 1000),
          nextSyncAt: new Date(Date.now() + 60 * 60 * 1000) // Próxima sincronización en 1 hora
        }
      })

      return NextResponse.json({
        success: true,
        syncId: syncRecord.id.toString(),
        recordsProcessed,
        recordsUpdated,
        recordsCreated,
        availabilityData: Object.fromEntries(
          Array.from(availabilityData.entries()).map(([roomTypeId, data]) => [
            roomTypeId,
            {
              roomType: {
                id: data.roomType.id.toString(),
                name: data.roomType.name
              },
              availability: Object.fromEntries(data.availability)
            }
          ])
        )
      })

    } catch (syncError) {
      console.error('❌ Error during sync:', syncError)
      
      // Actualizar registro de sincronización con error
      await prisma.platformSync.update({
        where: { id: syncRecord.id },
        data: {
          syncStatus: 'FAILED',
          errors: syncError instanceof Error ? syncError.message : 'Unknown error'
        }
      })

      throw syncError
    }

  } catch (error) {
    console.error('❌ Error in availability sync:', error)
    return NextResponse.json(
      { error: 'Error syncing availability' },
      { status: 500 }
    )
  }
}

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
    const hotelId = searchParams.get('hotelId')
    const platform = searchParams.get('platform')

    const where: any = {}
    if (hotelId) where.hotelId = BigInt(hotelId)
    if (platform) where.platform = platform

    const syncs = await prisma.platformSync.findMany({
      where,
      include: {
        hotel: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { lastSyncAt: 'desc' },
      take: 50
    })

    const serializedSyncs = syncs.map(sync => ({
      ...sync,
      id: sync.id.toString(),
      hotelId: sync.hotelId.toString(),
      lastSyncAt: sync.lastSyncAt.toISOString(),
      nextSyncAt: sync.nextSyncAt?.toISOString() || null,
      createdAt: sync.createdAt.toISOString(),
      updatedAt: sync.updatedAt.toISOString(),
      hotel: {
        ...sync.hotel,
        id: sync.hotel.id.toString()
      }
    }))

    return NextResponse.json(serializedSyncs)

  } catch (error) {
    console.error('❌ Error fetching sync records:', error)
    return NextResponse.json(
      { error: 'Error fetching sync records' },
      { status: 500 }
    )
  }
}


