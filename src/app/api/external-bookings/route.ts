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
    const platform = searchParams.get('platform')
    const hotelId = searchParams.get('hotelId')
    const status = searchParams.get('status')
    const checkInFrom = searchParams.get('checkInFrom')
    const checkInTo = searchParams.get('checkInTo')

    const skip = (page - 1) * limit

    // Construir filtros
    const where: any = {
      isActive: true
    }

    if (platform) {
      where.platform = platform
    }

    if (hotelId) {
      where.hotelId = BigInt(hotelId)
    }

    if (status) {
      where.status = status
    }

    if (checkInFrom || checkInTo) {
      where.checkIn = {}
      if (checkInFrom) {
        where.checkIn.gte = new Date(checkInFrom)
      }
      if (checkInTo) {
        where.checkIn.lte = new Date(checkInTo)
      }
    }

    // Obtener reservaciones externas
    const [bookings, totalCount] = await Promise.all([
      prisma.externalBooking.findMany({
        where,
        include: {
          hotel: {
            select: {
              id: true,
              name: true,
              code: true
            }
          },
          roomType: {
            select: {
              id: true,
              name: true
            }
          },
          externalBookingItems: true
        },
        orderBy: [
          { checkIn: 'desc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      prisma.externalBooking.count({ where })
    ])

    // Serializar BigInt
    const serializedBookings = bookings.map(booking => ({
      ...booking,
      id: booking.id.toString(),
      hotelId: booking.hotelId.toString(),
      roomTypeId: booking.roomTypeId?.toString() || null,
      totalAmount: booking.totalAmount.toString(),
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString(),
      checkIn: booking.checkIn.toISOString().split('T')[0],
      checkOut: booking.checkOut.toISOString().split('T')[0],
      lastSyncAt: booking.lastSyncAt?.toISOString() || null,
      hotel: {
        ...booking.hotel,
        id: booking.hotel.id.toString()
      },
      roomType: booking.roomType ? {
        ...booking.roomType,
        id: booking.roomType.id.toString()
      } : null,
      externalBookingItems: booking.externalBookingItems.map(item => ({
        ...item,
        id: item.id.toString(),
        externalBookingId: item.externalBookingId.toString(),
        unitPrice: item.unitPrice.toString(),
        totalPrice: item.totalPrice.toString(),
        serviceDate: item.serviceDate?.toISOString().split('T')[0] || null,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString()
      }))
    }))

    return NextResponse.json({
      bookings: serializedBookings,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching external bookings:', error)
    return NextResponse.json(
      { error: 'Error obteniendo reservaciones externas' },
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
    const {
      externalId,
      platform,
      confirmationNumber,
      hotelId,
      roomTypeId,
      guestName,
      guestEmail,
      guestPhone,
      checkIn,
      checkOut,
      adults,
      children,
      rooms,
      totalAmount,
      currency,
      status,
      platformStatus,
      specialRequests,
      notes,
      items
    } = body

    // Validar datos requeridos
    if (!externalId || !platform || !hotelId || !guestName || !checkIn || !checkOut) {
      return NextResponse.json(
        { error: 'Datos requeridos faltantes' },
        { status: 400 }
      )
    }

    // Verificar si ya existe una reservación con el mismo externalId
    const existingBooking = await prisma.externalBooking.findUnique({
      where: { externalId }
    })

    if (existingBooking) {
      return NextResponse.json(
        { error: 'Ya existe una reservación con este ID externo' },
        { status: 409 }
      )
    }

    // Crear reservación externa
    const booking = await prisma.externalBooking.create({
      data: {
        externalId,
        platform,
        confirmationNumber: confirmationNumber || `EXT-${Date.now()}`,
        hotelId: BigInt(hotelId),
        roomTypeId: roomTypeId ? BigInt(roomTypeId) : null,
        guestName,
        guestEmail,
        guestPhone,
        checkIn: new Date(checkIn),
        checkOut: new Date(checkOut),
        adults: adults || 1,
        children: children || 0,
        rooms: rooms || 1,
        totalAmount: parseFloat(totalAmount),
        currency: currency || 'USD',
        status: status || 'CONFIRMED',
        platformStatus,
        specialRequests,
        notes
      }
    })

    // Crear items de la reservación si se proporcionan
    if (items && items.length > 0) {
      await prisma.externalBookingItem.createMany({
        data: items.map((item: any) => ({
          externalBookingId: booking.id,
          itemType: item.itemType,
          title: item.title,
          description: item.description,
          quantity: item.quantity || 1,
          unitPrice: parseFloat(item.unitPrice),
          totalPrice: parseFloat(item.totalPrice),
          currency: item.currency || 'USD',
          serviceDate: item.serviceDate ? new Date(item.serviceDate) : null
        }))
      })
    }

    console.log('✅ External booking created:', booking.id.toString())

    return NextResponse.json({
      success: true,
      booking: {
        ...booking,
        id: booking.id.toString(),
        hotelId: booking.hotelId.toString(),
        roomTypeId: booking.roomTypeId?.toString() || null,
        totalAmount: booking.totalAmount.toString(),
        createdAt: booking.createdAt.toISOString(),
        updatedAt: booking.updatedAt.toISOString(),
        checkIn: booking.checkIn.toISOString().split('T')[0],
        checkOut: booking.checkOut.toISOString().split('T')[0],
        lastSyncAt: booking.lastSyncAt?.toISOString() || null
      }
    })

  } catch (error) {
    console.error('Error creating external booking:', error)
    return NextResponse.json(
      { error: 'Error creando reservación externa' },
      { status: 500 }
    )
  }
}


