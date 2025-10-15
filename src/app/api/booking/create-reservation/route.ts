import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { serviceType, serviceId, guestInfo, bookingData } = body

    console.log('🎯 Creating booking reservation:', { serviceType, serviceId })

    // Validar datos requeridos
    if (!serviceType || !serviceId || !guestInfo || !bookingData) {
      return NextResponse.json(
        { error: 'Datos de reserva incompletos' },
        { status: 400 }
      )
    }

    // Validar información del huésped
    const { firstName, lastName, email, phone } = guestInfo
    if (!firstName || !lastName || !email || !phone) {
      return NextResponse.json(
        { error: 'Información del huésped incompleta' },
        { status: 400 }
      )
    }

    // Crear o encontrar huésped
    let guest = await prisma.guest.findFirst({
      where: { email: guestInfo.email }
    })

    if (!guest) {
      guest = await prisma.guest.create({
        data: {
          firstName: guestInfo.firstName,
          lastName: guestInfo.lastName,
          email: guestInfo.email,
          phone: guestInfo.phone,
          nationality: guestInfo.nationality || 'Guatemala',
          country: guestInfo.nationality || 'Guatemala'
        }
      })
      console.log('✅ Guest created:', guest.id.toString())
    } else {
      // Actualizar información del huésped existente
      guest = await prisma.guest.update({
        where: { id: guest.id },
        data: {
          firstName: guestInfo.firstName,
          lastName: guestInfo.lastName,
          phone: guestInfo.phone,
          nationality: guestInfo.nationality || guest.nationality,
          country: guestInfo.nationality || guest.country
        }
      })
      console.log('✅ Guest updated:', guest.id.toString())
    }

    // Generar número de confirmación
    const confirmationNumber = `ANT-${Date.now().toString().slice(-8)}`

    // Crear reservación básica
    const reservation = await prisma.reservation.create({
      data: {
        guestId: guest.id,
        checkin: bookingData.checkIn ? new Date(bookingData.checkIn) : null,
        checkout: bookingData.checkOut ? new Date(bookingData.checkOut) : null,
        totalAmount: bookingData.totalAmount,
        currency: bookingData.currency || 'USD',
        status: 'PENDING',
        paymentStatus: 'PENDING',
        confirmationNumber,
        specialRequests: guestInfo.specialRequests || null,
        notes: `Reserva de ${serviceType} creada desde booking público - ${bookingData.participants} participantes${bookingData.rooms ? `, ${bookingData.rooms} habitaciones` : ''}`,
        source: 'BOOKING_PUBLIC'
      }
    })

    console.log('✅ Reservation created:', reservation.id.toString())

    // Crear ReservationItem según el tipo de servicio
    let itemType: 'ACCOMMODATION' | 'ACTIVITY' | 'PACKAGE' | 'SHUTTLE'
    let title: string

    switch (serviceType) {
      case 'hotel':
        itemType = 'ACCOMMODATION'
        title = bookingData.serviceName || 'Reserva de Hotel'
        break
      case 'activity':
        itemType = 'ACTIVITY'
        title = bookingData.serviceName || 'Reserva de Actividad'
        break
      case 'package':
        itemType = 'PACKAGE'
        title = bookingData.serviceName || 'Reserva de Paquete'
        break
      case 'shuttle':
        itemType = 'SHUTTLE'
        title = bookingData.serviceName || 'Reserva de Shuttle'
        break
      default:
        return NextResponse.json(
          { error: 'Tipo de servicio no válido' },
          { status: 400 }
        )
    }

    // Crear el item de reservación
    const reservationItem = await prisma.reservationItem.create({
      data: {
        reservationId: reservation.id,
        itemType,
        title,
        quantity: bookingData.participants || 1,
        unitPrice: bookingData.totalAmount,
        amount: bookingData.totalAmount,
        meta: {
          serviceId: serviceId,
          serviceType: serviceType,
          participants: bookingData.participants || 1,
          rooms: bookingData.rooms || null,
          checkIn: bookingData.checkIn || null,
          checkOut: bookingData.checkOut || null,
          description: `${serviceType}: ${bookingData.serviceName}${bookingData.rooms ? ` - ${bookingData.rooms} habitación(es)` : ''} - ${bookingData.participants} participante(s)`
        } as any
      }
    })

    console.log('✅ Reservation item created:', reservationItem.id.toString())

    console.log('✅ Reservation created:', reservation.id.toString())

    // Preparar datos de respuesta
    const responseData = {
      success: true,
      reservationId: reservation.id.toString(),
      confirmationNumber: reservation.confirmationNumber,
      guest: {
        id: guest.id.toString(),
        name: `${guest.firstName} ${guest.lastName}`,
        email: guest.email
      },
      reservation: {
        id: reservation.id.toString(),
        totalAmount: parseFloat(reservation.totalAmount.toString()),
        currency: reservation.currency,
        status: reservation.status,
        paymentStatus: reservation.paymentStatus
      }
    }

    console.log('🎉 Booking reservation created successfully')

    return NextResponse.json(responseData)

  } catch (error) {
    console.error('❌ Error creating booking reservation:', error)
    return NextResponse.json(
      { 
        error: 'Error creando la reservación',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
