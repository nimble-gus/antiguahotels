import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { onReservationCreated } from '@/lib/notifications/triggers'
import { createLocalDate, calculateNights, isValidDateRange } from '@/lib/date-utils'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 GET /api/reservations - Request received')
    const session = await getServerSession(authOptions)
    console.log('👤 Session:', session ? `${session.user.email} (${session.user.role})` : 'No session')

    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      console.log('❌ Unauthorized access attempt')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('✅ Authorization passed')

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status') || ''
    const search = searchParams.get('search') || ''
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    const skip = (page - 1) * limit

    // Construir filtros
    const where: any = {}
    
    if (status && status !== 'all') {
      where.status = status
    }

    if (search) {
      where.OR = [
        { confirmationNumber: { contains: search, mode: 'insensitive' } },
        { guest: {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ]
        }}
      ]
    }

    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) where.createdAt.gte = new Date(dateFrom)
      if (dateTo) where.createdAt.lte = new Date(dateTo + 'T23:59:59.999Z')
    }

    console.log('🔍 Query parameters:', { page, limit, status, search, where })

    // Obtener reservaciones con información relacionada
    const [reservations, totalCount] = await Promise.all([
      prisma.reservation.findMany({
        where,
        include: {
          guest: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              country: true,
            }
          },
          reservationItems: {
            include: {
              accommodationStay: {
                include: {
                  hotel: {
                    select: {
                      name: true,
                      code: true,
                    }
                  },
                  roomType: {
                    select: {
                      name: true,
                    }
                  },
                  assignedRoom: {
                    select: {
                      code: true,
                    }
                  }
                }
              },
              packageBooking: {
                include: {
                  package: {
                    select: {
                      name: true,
                    }
                  }
                }
              },
              shuttleTransfer: {
                include: {
                  shuttleRoute: {
                    select: {
                      name: true,
                    }
                  }
                }
              },
              activityBooking: {
                include: {
                  activity: {
                    select: {
                      name: true,
                    }
                  }
                }
              }
            }
          },
          payments: {
            select: {
              id: true,
              reservationId: true,
              amount: true,
              status: true,
              paymentMethod: true,
              processedAt: true,
              createdAt: true,
              updatedAt: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.reservation.count({ where })
    ])

    // Serializar BigInt
    const serializedReservations = reservations.map(reservation => ({
      ...reservation,
      id: reservation.id.toString(),
      guestId: reservation.guestId.toString(),
      totalAmount: reservation.totalAmount.toString(),
      createdAt: reservation.createdAt.toISOString(),
      updatedAt: reservation.updatedAt.toISOString(),
      checkin: reservation.checkin?.toISOString(),
      checkout: reservation.checkout?.toISOString(),
      reservationItems: reservation.reservationItems.map(item => ({
        ...item,
        id: item.id.toString(),
        reservationId: item.reservationId.toString(),
        unitPrice: item.unitPrice.toString(),
        amount: item.amount.toString(),
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
        accommodationStay: item.accommodationStay ? {
          ...item.accommodationStay,
          id: item.accommodationStay.id.toString(),
          reservationItemId: item.accommodationStay.reservationItemId.toString(),
          hotelId: item.accommodationStay.hotelId.toString(),
          roomTypeId: item.accommodationStay.roomTypeId.toString(),
          assignedRoomId: item.accommodationStay.assignedRoomId?.toString(),
          checkInDate: item.accommodationStay.checkInDate.toISOString(),
          checkOutDate: item.accommodationStay.checkOutDate.toISOString(),
          createdAt: item.accommodationStay.createdAt.toISOString(),
          hotel: item.accommodationStay.hotel ? {
            ...item.accommodationStay.hotel,
          } : null,
          roomType: item.accommodationStay.roomType ? {
            ...item.accommodationStay.roomType,
          } : null,
          assignedRoom: item.accommodationStay.assignedRoom ? {
            ...item.accommodationStay.assignedRoom,
          } : null,
        } : null,
        packageBooking: item.packageBooking ? {
          ...item.packageBooking,
          id: item.packageBooking.id.toString(),
          reservationItemId: item.packageBooking.reservationItemId.toString(),
          packageId: item.packageBooking.packageId.toString(),
          createdAt: item.packageBooking.createdAt.toISOString(),
          package: item.packageBooking.package ? {
            ...item.packageBooking.package,
          } : null,
        } : null,
        shuttleTransfer: item.shuttleTransfer ? {
          ...item.shuttleTransfer,
          id: item.shuttleTransfer.id.toString(),
          reservationItemId: item.shuttleTransfer.reservationItemId.toString(),
          shuttleRouteId: item.shuttleTransfer.shuttleRouteId.toString(),
          createdAt: item.shuttleTransfer.createdAt.toISOString(),
          shuttleRoute: item.shuttleTransfer.shuttleRoute ? {
            ...item.shuttleTransfer.shuttleRoute,
          } : null,
        } : null,
        activityBooking: item.activityBooking ? {
          ...item.activityBooking,
          id: item.activityBooking.id.toString(),
          reservationItemId: item.activityBooking.reservationItemId.toString(),
          activityId: item.activityBooking.activityId.toString(),
          scheduleId: item.activityBooking.scheduleId?.toString(),
          activityDate: item.activityBooking.activityDate.toISOString(),
          startTime: item.activityBooking.startTime.toISOString(),
          createdAt: item.activityBooking.createdAt.toISOString(),
          activity: item.activityBooking.activity ? {
            ...item.activityBooking.activity,
          } : null,
        } : null,
      })),
      payments: reservation.payments.map(payment => ({
        ...payment,
        id: payment.id.toString(),
        reservationId: payment.reservationId.toString(),
        amount: payment.amount.toString(),
        createdAt: payment.createdAt.toISOString(),
        updatedAt: payment.updatedAt.toISOString(),
        processedAt: payment.processedAt?.toISOString(),
      }))
    }))

    console.log('📊 Query results:', { 
      totalCount, 
      reservationsFound: reservations.length,
      serializedCount: serializedReservations.length 
    })

    return NextResponse.json({
      reservations: serializedReservations,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      }
    })

  } catch (error) {
    console.error('Error fetching reservations:', error)
    return NextResponse.json(
      { error: 'Error obteniendo reservaciones' },
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
      guestId,
      itemType,
      // Campos para alojamiento
      hotelId,
      roomTypeId,
      checkInDate,
      checkOutDate,
      adults,
      children,
      specialRequests,
      notes,
      guestName,
      // Campos para actividades
      activityId,
      scheduleId,
      participants,
      participantNames,
      emergencyContact,
      emergencyPhone,
      // Campos para paquetes
      packageId,
      startDate
    } = body

    // Validaciones básicas
    if (!guestId || !itemType) {
      return NextResponse.json(
        { error: 'Huésped y tipo de reservación son requeridos' },
        { status: 400 }
      )
    }

    // Validaciones específicas por tipo
    if (itemType === 'ACCOMMODATION') {
      if (!hotelId || !roomTypeId || !checkInDate || !checkOutDate || !adults) {
        return NextResponse.json(
          { error: 'Datos de alojamiento requeridos: hotel, tipo de habitación, fechas y adultos' },
          { status: 400 }
        )
      }
    } else if (itemType === 'ACTIVITY') {
      if (!activityId || !scheduleId || !participants) {
        return NextResponse.json(
          { error: 'Datos de actividad requeridos: actividad, horario y participantes' },
          { status: 400 }
        )
      }
    } else if (itemType === 'PACKAGE') {
      if (!packageId || !startDate || !participants) {
        return NextResponse.json(
          { error: 'Datos de paquete requeridos: paquete, fecha de inicio y participantes' },
          { status: 400 }
        )
      }
    }

    let checkIn: Date, checkOut: Date, nights: number = 0

    if (itemType === 'ACCOMMODATION') {
      // Validar fechas usando utilidades consistentes
      console.log('📅 Received accommodation dates:', { checkInDate, checkOutDate })
      
      if (!isValidDateRange(checkInDate, checkOutDate)) {
        return NextResponse.json(
          { error: 'Rango de fechas inválido' },
          { status: 400 }
        )
      }

      // Crear fechas locales
      checkIn = createLocalDate(checkInDate)
      checkOut = createLocalDate(checkOutDate)
      
      console.log('📅 Local dates created:', { 
        checkIn: checkIn.toISOString(), 
        checkOut: checkOut.toISOString() 
      })

      // Calcular noches usando utilidad consistente
      nights = calculateNights(checkInDate, checkOutDate)
    }

    // Procesar según el tipo de reservación
    console.log('🎯 RESERVATION TYPE SELECTED:', itemType)
    
    if (itemType === 'ACCOMMODATION') {
      console.log('🏨 Calling createAccommodationReservation...')
      return await createAccommodationReservation({
        guestId,
        hotelId,
        roomTypeId,
        checkInDate,
        checkOutDate,
        adults,
        children,
        specialRequests,
        notes,
        guestName,
        checkIn,
        checkOut,
        nights
      })
    } else if (itemType === 'ACTIVITY') {
      return await createActivityReservation({
        guestId,
        activityId,
        scheduleId,
        participants,
        participantNames,
        emergencyContact,
        emergencyPhone
      })
    } else if (itemType === 'PACKAGE') {
      return await createPackageReservation({
        guestId,
        packageId,
        startDate,
        participants,
        participantNames,
        specialRequests
      })
    } else {
      return NextResponse.json(
        { error: 'Tipo de reservación no válido' },
        { status: 400 }
      )
    }

    // Verificar capacidad
    if (adults > roomType.maxAdults || (children || 0) > roomType.maxChildren) {
      return NextResponse.json(
        { error: 'Excede la capacidad máxima del tipo de habitación' },
        { status: 400 }
      )
    }

    // Buscar habitación disponible
    const availableRoom = await findAvailableRoom(BigInt(roomTypeId), checkIn, checkOut)
    
    if (!availableRoom) {
      return NextResponse.json(
        { error: 'No hay habitaciones disponibles para las fechas seleccionadas' },
        { status: 400 }
      )
    }

    // Calcular precio total
    const roomRate = roomType.baseRate
    const totalAmount = roomRate.mul(nights)

    // Generar número de confirmación
    const confirmationNumber = await generateConfirmationNumber()
    
    console.log('🎫 Generated confirmation number:', confirmationNumber)
    console.log('📊 Final reservation data:', {
      confirmationNumber,
      guestId,
      checkIn: checkIn.toISOString(),
      checkOut: checkOut.toISOString(),
      nights,
      totalAmount: totalAmount.toString(),
      roomCode: availableRoom.code
    })

    // Crear reservación en transacción
    const result = await prisma.$transaction(async (tx) => {
      // Crear reservación principal
      const reservation = await tx.reservation.create({
        data: {
          confirmationNumber,
          guestId: BigInt(guestId),
          status: 'PENDING',
          checkin: checkIn,
          checkout: checkOut,
          totalAmount,
          specialRequests: specialRequests || null,
          notes: notes || null,
          source: 'ADMIN',
        }
      })

      // Crear item de reservación
      const reservationItem = await tx.reservationItem.create({
        data: {
          reservationId: reservation.id,
          itemType: 'ACCOMMODATION',
          title: `${roomType.hotel.name} - ${roomType.name}`,
          quantity: 1,
          unitPrice: roomRate,
          amount: totalAmount,
          meta: {
            nights,
            adults,
            children: children || 0,
          }
        }
      })

      // Crear detalle de alojamiento
      const accommodationStay = await tx.accommodationStay.create({
        data: {
          reservationItemId: reservationItem.id,
          hotelId: BigInt(hotelId),
          roomTypeId: BigInt(roomTypeId),
          assignedRoomId: availableRoom.id,
          adults,
          children: children || 0,
          checkInDate: checkIn,
          checkOutDate: checkOut,
          nights,
          guestName: guestName || null,
        }
      })

      // Bloquear inventario de habitación
      await blockRoomInventory(tx, availableRoom.id, checkIn, checkOut, reservationItem.id)

      return { reservation, reservationItem, accommodationStay }
    })

    // Obtener reservación completa para respuesta
    const fullReservation = await prisma.reservation.findUnique({
      where: { id: result.reservation.id },
      include: {
        guest: true,
        reservationItems: {
          include: {
            accommodationStay: {
              include: {
                hotel: true,
                roomType: true,
                assignedRoom: true,
              }
            }
          }
        }
      }
    })

    // Serializar BigInt para respuesta
    const serializedReservation = fullReservation ? {
      ...fullReservation,
      id: fullReservation.id.toString(),
      guestId: fullReservation.guestId.toString(),
      totalAmount: fullReservation.totalAmount.toString(),
      createdAt: fullReservation.createdAt.toISOString(),
      updatedAt: fullReservation.updatedAt.toISOString(),
      checkin: fullReservation.checkin?.toISOString(),
      checkout: fullReservation.checkout?.toISOString(),
      guest: {
        ...fullReservation.guest,
        id: fullReservation.guest.id.toString(),
        createdAt: fullReservation.guest.createdAt.toISOString(),
        updatedAt: fullReservation.guest.updatedAt.toISOString(),
        dateOfBirth: fullReservation.guest.dateOfBirth?.toISOString(),
      },
      reservationItems: fullReservation.reservationItems.map(item => ({
        ...item,
        id: item.id.toString(),
        reservationId: item.reservationId.toString(),
        unitPrice: item.unitPrice.toString(),
        amount: item.amount.toString(),
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
        accommodationStay: item.accommodationStay ? {
          ...item.accommodationStay,
          id: item.accommodationStay.id.toString(),
          reservationItemId: item.accommodationStay.reservationItemId.toString(),
          hotelId: item.accommodationStay.hotelId.toString(),
          roomTypeId: item.accommodationStay.roomTypeId.toString(),
          assignedRoomId: item.accommodationStay.assignedRoomId?.toString(),
          checkInDate: item.accommodationStay.checkInDate.toISOString(),
          checkOutDate: item.accommodationStay.checkOutDate.toISOString(),
          createdAt: item.accommodationStay.createdAt.toISOString(),
          hotel: item.accommodationStay.hotel ? {
            ...item.accommodationStay.hotel,
            id: item.accommodationStay.hotel.id.toString(),
            createdAt: item.accommodationStay.hotel.createdAt.toISOString(),
            updatedAt: item.accommodationStay.hotel.updatedAt.toISOString(),
          } : null,
          roomType: item.accommodationStay.roomType ? {
            ...item.accommodationStay.roomType,
            id: item.accommodationStay.roomType.id.toString(),
            hotelId: item.accommodationStay.roomType.hotelId.toString(),
            baseRate: item.accommodationStay.roomType.baseRate.toString(),
            createdAt: item.accommodationStay.roomType.createdAt.toISOString(),
            updatedAt: item.accommodationStay.roomType.updatedAt.toISOString(),
          } : null,
          assignedRoom: item.accommodationStay.assignedRoom ? {
            ...item.accommodationStay.assignedRoom,
            id: item.accommodationStay.assignedRoom.id.toString(),
            hotelId: item.accommodationStay.assignedRoom.hotelId.toString(),
            roomTypeId: item.accommodationStay.assignedRoom.roomTypeId.toString(),
            createdAt: item.accommodationStay.assignedRoom.createdAt.toISOString(),
            updatedAt: item.accommodationStay.assignedRoom.updatedAt.toISOString(),
          } : null,
        } : null,
      }))
    } : null

    console.log('🚀 ABOUT TO TRIGGER NOTIFICATIONS - Reservation created successfully')
    console.log('📋 Reservation ID:', result.reservation.id.toString())
    console.log('📧 Full reservation guest email:', fullReservation?.guest?.email)

    // 🔔 Disparar notificaciones automáticas
    try {
      console.log('🔔 NOTIFICATION TRIGGER: Starting for reservation:', result.reservation.id.toString())
      console.log('📧 Guest email:', fullReservation?.guest?.email || 'NO EMAIL FOUND')
      console.log('📧 Confirmation number:', result.reservation.confirmationNumber)
      
      const triggerResult = await onReservationCreated(result.reservation.id)
      console.log('✅ NOTIFICATION TRIGGER: Completed successfully', triggerResult)
    } catch (notificationError) {
      console.error('❌ NOTIFICATION TRIGGER: Failed with error:', notificationError)
      console.error('❌ Error stack:', notificationError instanceof Error ? notificationError.stack : 'No stack')
      // No fallar la reservación por errores de notificación
    }

    return NextResponse.json({
      message: 'Reservación creada exitosamente',
      confirmationNumber,
      reservation: serializedReservation
    })

  } catch (error) {
    console.error('Error creating reservation:', error)
    return NextResponse.json(
      { error: 'Error creando reservación' },
      { status: 500 }
    )
  }
}

// Función auxiliar para buscar habitación disponible
async function findAvailableRoom(roomTypeId: bigint, checkIn: Date, checkOut: Date) {
  try {
    // Obtener todas las habitaciones de este tipo
    const rooms = await prisma.room.findMany({
      where: {
        roomTypeId,
        isActive: true,
      }
    })

    console.log(`🔍 Checking availability for ${rooms.length} rooms of type ${roomTypeId}`)

    // Obtener información del hotel para horarios
    const roomType = await prisma.roomType.findUnique({
      where: { id: roomTypeId },
      include: {
        hotel: {
          select: {
            id: true,
            checkInTime: true,
            checkOutTime: true,
            name: true
          }
        }
      }
    })

    if (!roomType) {
      console.log('❌ Room type not found')
      return null
    }

    // Verificar disponibilidad de cada habitación con lógica de turnover
    for (const room of rooms) {
      const isAvailable = await isRoomAvailableWithTurnover(
        room.id,
        checkIn,
        checkOut,
        roomType.hotel.id,
        roomType.hotel.checkInTime!,
        roomType.hotel.checkOutTime!
      )

      console.log(`Room ${room.code}: ${isAvailable ? 'Available (with turnover logic)' : 'Not available'}`)

      if (isAvailable) {
        console.log(`✅ Room ${room.code} is available`)
        return room
      }
    }

    console.log('❌ No rooms available')
    return null
  } catch (error) {
    console.error('Error finding available room:', error)
    return null
  }
}

// Función auxiliar para bloquear inventario
async function blockRoomInventory(
  tx: any, 
  roomId: bigint, 
  checkIn: Date, 
  checkOut: Date, 
  reservationItemId: bigint
) {
  try {
    const dates = []
    const currentDate = new Date(checkIn)
    
    while (currentDate < checkOut) {
      dates.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }

    console.log(`🔒 Blocking ${dates.length} dates for room ${roomId}`)

    // Crear registros de inventario para cada fecha
    for (const date of dates) {
      await tx.roomInventory.upsert({
        where: {
          roomId_stayDate: {
            roomId,
            stayDate: date,
          }
        },
        update: {
          reservationItemId,
          isBlocked: true,
        },
        create: {
          roomId,
          stayDate: date,
          reservationItemId,
          isBlocked: true,
        }
      })
    }

    console.log(`✅ Successfully blocked inventory for room ${roomId}`)
  } catch (error) {
    console.error('Error blocking room inventory:', error)
    throw error
  }
}

// Función auxiliar para generar número de confirmación
async function generateConfirmationNumber(): Promise<string> {
  const today = new Date()
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '')
  
  // Buscar el último número del día
  const lastReservation = await prisma.reservation.findFirst({
    where: {
      confirmationNumber: {
        startsWith: `AH${dateStr}`
      },
      createdAt: {
        gte: new Date(today.toISOString().slice(0, 10) + 'T00:00:00.000Z'),
        lt: new Date(today.toISOString().slice(0, 10) + 'T23:59:59.999Z'),
      }
    },
    orderBy: { confirmationNumber: 'desc' }
  })

  let counter = 1
  if (lastReservation) {
    const lastNumber = lastReservation.confirmationNumber.slice(-4)
    counter = parseInt(lastNumber) + 1
  }

  return `AH${dateStr}${counter.toString().padStart(4, '0')}`
}

// Función para crear reservación de alojamiento
async function createAccommodationReservation(data: {
  guestId: string
  hotelId: string
  roomTypeId: string
  checkInDate: string
  checkOutDate: string
  adults: number
  children: number
  specialRequests?: string
  notes?: string
  guestName?: string
  checkIn: Date
  checkOut: Date
  nights: number
}) {
  try {
    console.log('🏨 ACCOMMODATION RESERVATION: Function called with data:', {
      guestId: data.guestId,
      hotelId: data.hotelId,
      roomTypeId: data.roomTypeId,
      checkInDate: data.checkInDate,
      checkOutDate: data.checkOutDate
    })
    
    // Obtener información del tipo de habitación
    const roomType = await prisma.roomType.findUnique({
      where: { id: BigInt(data.roomTypeId) },
      include: {
        hotel: {
          select: {
            name: true,
            code: true,
          }
        }
      }
    })

    if (!roomType) {
      return NextResponse.json(
        { error: 'Tipo de habitación no encontrado' },
        { status: 404 }
      )
    }

    // Verificar capacidad
    if (data.adults > roomType.maxAdults || (data.children || 0) > roomType.maxChildren) {
      return NextResponse.json(
        { error: 'Excede la capacidad máxima del tipo de habitación' },
        { status: 400 }
      )
    }

    // Buscar habitación disponible
    const availableRoom = await findAvailableRoom(BigInt(data.roomTypeId), data.checkIn, data.checkOut)

    if (!availableRoom) {
      return NextResponse.json(
        { error: 'No hay habitaciones disponibles para estas fechas' },
        { status: 400 }
      )
    }

    // Calcular precio total
    const roomRate = roomType.baseRate
    const totalAmount = roomRate.mul(data.nights)

    // Generar número de confirmación
    const confirmationNumber = await generateConfirmationNumber()
    
    console.log('🎫 Generated confirmation number:', confirmationNumber)

    // Crear reservación en transacción
    const result = await prisma.$transaction(async (tx) => {
      // Crear reservación principal
      const reservation = await tx.reservation.create({
        data: {
          confirmationNumber,
          guestId: BigInt(data.guestId),
          status: 'PENDING',
          checkin: data.checkIn,
          checkout: data.checkOut,
          totalAmount,
          specialRequests: data.specialRequests || null,
          notes: data.notes || null,
          source: 'ADMIN',
        }
      })

      // Crear item de reservación
      const reservationItem = await tx.reservationItem.create({
        data: {
          reservationId: reservation.id,
          itemType: 'ACCOMMODATION',
          title: `${roomType.hotel.name} - ${roomType.name}`,
          quantity: 1,
          unitPrice: roomRate,
          amount: totalAmount,
        }
      })

      // Crear detalle de alojamiento
      await tx.accommodationStay.create({
        data: {
          reservationItemId: reservationItem.id,
          hotelId: BigInt(data.hotelId),
          roomTypeId: BigInt(data.roomTypeId),
          assignedRoomId: availableRoom.id,
          adults: data.adults,
          children: data.children || 0,
          checkInDate: data.checkIn,
          checkOutDate: data.checkOut,
          nights: data.nights,
          guestName: data.guestName || null,
        }
      })

      // Bloquear inventario de habitación
      await blockRoomInventory(tx, availableRoom.id, data.checkIn, data.checkOut, reservationItem.id)

      return reservation
    })

    return NextResponse.json({
      success: true,
      reservationId: result.id.toString(),
      confirmationNumber: result.confirmationNumber,
      message: 'Reservación de alojamiento creada exitosamente'
    })

  } catch (error) {
    console.error('Error creating accommodation reservation:', error)
    return NextResponse.json(
      { error: 'Error creando reservación de alojamiento' },
      { status: 500 }
    )
  }
}

// Función para crear reservación de actividad
async function createActivityReservation(data: {
  guestId: string
  activityId: string
  scheduleId: string
  participants: number
  participantNames?: string
  emergencyContact?: string
  emergencyPhone?: string
}) {
  try {
    // Obtener información de la actividad y horario
    const [activity, schedule] = await Promise.all([
      prisma.activity.findUnique({
        where: { id: BigInt(data.activityId) }
      }),
      prisma.activitySchedule.findUnique({
        where: { id: BigInt(data.scheduleId) },
        include: {
          _count: {
            select: {
              activityBookings: true
            }
          }
        }
      })
    ])

    if (!activity) {
      return NextResponse.json(
        { error: 'Actividad no encontrada' },
        { status: 404 }
      )
    }

    if (!schedule) {
      return NextResponse.json(
        { error: 'Horario no encontrado' },
        { status: 404 }
      )
    }

    // Verificar disponibilidad de cupos
    const availableSpots = schedule.availableSpots - schedule._count.activityBookings
    if (data.participants > availableSpots) {
      return NextResponse.json(
        { error: `Solo hay ${availableSpots} cupos disponibles` },
        { status: 400 }
      )
    }

    // Verificar límites de participantes
    if (data.participants < activity.minParticipants) {
      return NextResponse.json(
        { error: `Mínimo ${activity.minParticipants} participantes requeridos` },
        { status: 400 }
      )
    }

    if (activity.maxParticipants && data.participants > activity.maxParticipants) {
      return NextResponse.json(
        { error: `Máximo ${activity.maxParticipants} participantes permitidos` },
        { status: 400 }
      )
    }

    // Calcular precio total
    const unitPrice = schedule.priceOverride || activity.basePrice
    const totalAmount = unitPrice.mul(data.participants)

    // Generar número de confirmación
    const confirmationNumber = await generateConfirmationNumber()
    
    console.log('🎫 Generated confirmation number:', confirmationNumber)

    // Crear reservación en transacción
    const result = await prisma.$transaction(async (tx) => {
      // Crear reservación principal
      const reservation = await tx.reservation.create({
        data: {
          confirmationNumber,
          guestId: BigInt(data.guestId),
          status: 'PENDING',
          checkin: schedule.date,
          checkout: schedule.date, // Para actividades, check-in y check-out son el mismo día
          totalAmount,
          source: 'ADMIN',
        }
      })

      // Crear item de reservación
      const reservationItem = await tx.reservationItem.create({
        data: {
          reservationId: reservation.id,
          itemType: 'ACTIVITY',
          title: `${activity.name} - ${schedule.date.toISOString().split('T')[0]}`,
          quantity: data.participants,
          unitPrice: unitPrice,
          amount: totalAmount,
        }
      })

      // Crear detalle de actividad
      await tx.activityBooking.create({
        data: {
          reservationItemId: reservationItem.id,
          activityId: BigInt(data.activityId),
          scheduleId: BigInt(data.scheduleId),
          activityDate: schedule.date,
          startTime: schedule.startTime,
          participants: data.participants,
          participantNames: data.participantNames || null,
          emergencyContact: data.emergencyContact || null,
          emergencyPhone: data.emergencyPhone || null,
        }
      })

      return reservation
    })

    // 🔔 Disparar notificaciones automáticas
    try {
      console.log('📧 Triggering notification for activity reservation:', result.id.toString())
      await onReservationCreated(result.id)
    } catch (notificationError) {
      console.error('❌ Error sending notifications:', notificationError)
      // No fallar la reservación por errores de notificación
    }

    return NextResponse.json({
      success: true,
      reservationId: result.id.toString(),
      confirmationNumber: result.confirmationNumber,
      message: 'Reservación de actividad creada exitosamente'
    })

  } catch (error) {
    console.error('Error creating activity reservation:', error)
    return NextResponse.json(
      { error: 'Error creando reservación de actividad' },
      { status: 500 }
    )
  }
}

// Función para crear reservación de paquete
async function createPackageReservation(data: {
  guestId: string
  packageId: string
  startDate: string
  participants: number
  participantNames?: string
  specialRequests?: string
}) {
  try {
    console.log('📦 Creating package reservation:', data)

    // Obtener datos del paquete
    const packageData = await prisma.package.findUnique({
      where: { id: BigInt(data.packageId) },
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

    // Calcular fechas del paquete
    const startDateObj = new Date(data.startDate + 'T00:00:00')
    const endDateObj = new Date(startDateObj)
    endDateObj.setDate(startDateObj.getDate() + packageData.durationDays - 1)

    // Generar número de confirmación
    const confirmationNumber = await generateConfirmationNumber()
    
    console.log('📦 Package reservation details:', {
      confirmationNumber,
      startDate: data.startDate,
      endDate: endDateObj.toISOString().split('T')[0],
      participants: data.participants,
      totalPrice: packageData.basePrice.toString()
    })

    // Crear reservación en transacción
    const result = await prisma.$transaction(async (tx) => {
      // Crear reservación principal
      const reservation = await tx.reservation.create({
        data: {
          confirmationNumber,
          guestId: BigInt(data.guestId),
          status: 'PENDING',
          checkin: startDateObj,
          checkout: endDateObj,
          totalAmount: packageData.basePrice,
          specialRequests: data.specialRequests || null,
          source: 'ADMIN_DASHBOARD',
        }
      })

      // Crear item de reservación para el paquete
      const reservationItem = await tx.reservationItem.create({
        data: {
          reservationId: reservation.id,
          itemType: 'PACKAGE',
          title: packageData.name,
          quantity: 1,
          unitPrice: packageData.basePrice,
          amount: packageData.basePrice,
        }
      })

      // Crear detalle de paquete
      await tx.packageBooking.create({
        data: {
          reservationItemId: reservationItem.id,
          packageId: BigInt(data.packageId),
          startTs: startDateObj,
          endTs: endDateObj,
          pax: data.participants,
          participantNames: data.participantNames || null,
        }
      })

      // TODO: Aquí se podrían crear automáticamente las reservaciones de hoteles y actividades
      // Por ahora, solo creamos la reservación del paquete principal

      return reservation
    })

    // 🔔 Disparar notificaciones automáticas
    try {
      console.log('📧 Triggering notification for package reservation:', result.id.toString())
      await onReservationCreated(result.id)
    } catch (notificationError) {
      console.error('❌ Error sending notifications:', notificationError)
      // No fallar la reservación por errores de notificación
    }

    return NextResponse.json({
      success: true,
      reservationId: result.id.toString(),
      confirmationNumber: result.confirmationNumber,
      message: 'Reservación de paquete creada exitosamente'
    })

  } catch (error) {
    console.error('Error creating package reservation:', error)
    return NextResponse.json(
      { error: 'Error creando reservación de paquete' },
      { status: 500 }
    )
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
    const hasRealConflict = checkDateTimeConflictLogic(
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

// Lógica de verificación de conflictos de fecha/hora
function checkDateTimeConflictLogic(
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

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const reservationId = searchParams.get('id')

    if (!reservationId) {
      return NextResponse.json(
        { error: 'ID de reservación requerido' },
        { status: 400 }
      )
    }

    console.log('🗑️ Deleting reservation:', reservationId)

    // Verificar que la reservación existe
    const reservation = await prisma.reservation.findUnique({
      where: { id: BigInt(reservationId) },
      include: {
        reservationItems: {
          include: {
            accommodationStay: true
          }
        }
      }
    })

    if (!reservation) {
      return NextResponse.json(
        { error: 'Reservación no encontrada' },
        { status: 404 }
      )
    }

    // Verificar si se puede eliminar (ej: no está confirmada y no es muy reciente)
    if (reservation.status === 'CONFIRMED') {
      return NextResponse.json(
        { error: 'No se puede eliminar una reservación confirmada' },
        { status: 400 }
      )
    }

    // Eliminar en transacción
    await prisma.$transaction(async (tx) => {
      // Liberar inventario de habitaciones
      for (const item of reservation.reservationItems) {
        if (item.accommodationStay) {
          await tx.roomInventory.deleteMany({
            where: {
              reservationItemId: item.id
            }
          })
          console.log(`🔓 Freed room inventory for item ${item.id}`)
        }
      }

      // Eliminar accommodation stays
      await tx.accommodationStay.deleteMany({
        where: {
          reservationItemId: {
            in: reservation.reservationItems.map(item => item.id)
          }
        }
      })

      // Eliminar activity bookings
      await tx.activityBooking.deleteMany({
        where: {
          reservationItemId: {
            in: reservation.reservationItems.map(item => item.id)
          }
        }
      })

      // Eliminar package bookings
      await tx.packageBooking.deleteMany({
        where: {
          reservationItemId: {
            in: reservation.reservationItems.map(item => item.id)
          }
        }
      })

      // Eliminar shuttle transfers
      await tx.shuttleTransfer.deleteMany({
        where: {
          reservationItemId: {
            in: reservation.reservationItems.map(item => item.id)
          }
        }
      })

      // Eliminar reservation items
      await tx.reservationItem.deleteMany({
        where: {
          reservationId: reservation.id
        }
      })

      // Eliminar payments
      await tx.payment.deleteMany({
        where: {
          reservationId: reservation.id
        }
      })

      // Finalmente eliminar la reservación
      await tx.reservation.delete({
        where: { id: reservation.id }
      })

      console.log(`✅ Reservation ${reservation.confirmationNumber} deleted successfully`)
    })

    return NextResponse.json({
      success: true,
      message: 'Reservación eliminada exitosamente'
    })

  } catch (error) {
    console.error('Error deleting reservation:', error)
    return NextResponse.json(
      { error: 'Error eliminando reservación' },
      { status: 500 }
    )
  }
}
