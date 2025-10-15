import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

// Verificar firma de webhook de Booking.com
function verifyBookingWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')
  
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  )
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-booking-signature')
    
    // Verificar firma del webhook
    const webhookSecret = process.env.BOOKING_WEBHOOK_SECRET
    if (!webhookSecret || !signature) {
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 401 }
      )
    }

    if (!verifyBookingWebhookSignature(body, signature, webhookSecret)) {
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 }
      )
    }

    const data = JSON.parse(body)
    console.log('📨 Booking.com webhook received:', data)

    // Procesar diferentes tipos de eventos
    switch (data.event_type) {
      case 'reservation.created':
        await handleReservationCreated(data)
        break
      case 'reservation.updated':
        await handleReservationUpdated(data)
        break
      case 'reservation.cancelled':
        await handleReservationCancelled(data)
        break
      case 'reservation.modified':
        await handleReservationModified(data)
        break
      default:
        console.log('⚠️ Unknown event type:', data.event_type)
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('❌ Error processing Booking.com webhook:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function handleReservationCreated(data: any) {
  try {
    const reservation = data.reservation
    
    // Buscar hotel por código o nombre
    const hotel = await prisma.hotel.findFirst({
      where: {
        OR: [
          { code: reservation.property_id },
          { name: { contains: reservation.property_name } }
        ]
      }
    })

    if (!hotel) {
      console.error('❌ Hotel not found for reservation:', reservation.property_id)
      return
    }

    // Buscar tipo de habitación
    let roomType = null
    if (reservation.room_type_id) {
      roomType = await prisma.roomType.findFirst({
        where: {
          hotelId: hotel.id,
          name: { contains: reservation.room_type_name }
        }
      })
    }

    // Crear reservación externa
    const externalBooking = await prisma.externalBooking.create({
      data: {
        externalId: reservation.reservation_id,
        platform: 'BOOKING_COM',
        confirmationNumber: reservation.confirmation_number,
        hotelId: hotel.id,
        roomTypeId: roomType?.id || null,
        guestName: `${reservation.guest.first_name} ${reservation.guest.last_name}`,
        guestEmail: reservation.guest.email,
        guestPhone: reservation.guest.phone,
        checkIn: new Date(reservation.check_in),
        checkOut: new Date(reservation.check_out),
        adults: reservation.guests.adults,
        children: reservation.guests.children || 0,
        rooms: reservation.rooms || 1,
        totalAmount: parseFloat(reservation.total_amount),
        currency: reservation.currency || 'USD',
        status: 'CONFIRMED',
        platformStatus: reservation.status,
        specialRequests: reservation.special_requests,
        notes: `Reserva automática desde Booking.com - ${reservation.reservation_id}`,
        lastSyncAt: new Date()
      }
    })

    // Crear items de la reservación
    if (reservation.room_bookings && reservation.room_bookings.length > 0) {
      for (const roomBooking of reservation.room_bookings) {
        await prisma.externalBookingItem.create({
          data: {
            externalBookingId: externalBooking.id,
            itemType: 'ACCOMMODATION',
            title: `Habitación ${roomBooking.room_type_name}`,
            description: `Check-in: ${roomBooking.check_in}, Check-out: ${roomBooking.check_out}`,
            quantity: roomBooking.rooms || 1,
            unitPrice: parseFloat(roomBooking.rate),
            totalPrice: parseFloat(roomBooking.total),
            currency: reservation.currency || 'USD',
            serviceDate: new Date(roomBooking.check_in)
          }
        })
      }
    }

    console.log('✅ External booking created:', externalBooking.id.toString())

  } catch (error) {
    console.error('❌ Error creating external booking:', error)
    throw error
  }
}

async function handleReservationUpdated(data: any) {
  try {
    const reservation = data.reservation
    
    // Buscar reservación existente
    const existingBooking = await prisma.externalBooking.findUnique({
      where: { externalId: reservation.reservation_id }
    })

    if (!existingBooking) {
      console.log('⚠️ Reservation not found for update:', reservation.reservation_id)
      return
    }

    // Actualizar reservación
    await prisma.externalBooking.update({
      where: { id: existingBooking.id },
      data: {
        guestName: `${reservation.guest.first_name} ${reservation.guest.last_name}`,
        guestEmail: reservation.guest.email,
        guestPhone: reservation.guest.phone,
        checkIn: new Date(reservation.check_in),
        checkOut: new Date(reservation.check_out),
        adults: reservation.guests.adults,
        children: reservation.guests.children || 0,
        totalAmount: parseFloat(reservation.total_amount),
        platformStatus: reservation.status,
        specialRequests: reservation.special_requests,
        lastSyncAt: new Date()
      }
    })

    console.log('✅ External booking updated:', existingBooking.id.toString())

  } catch (error) {
    console.error('❌ Error updating external booking:', error)
    throw error
  }
}

async function handleReservationCancelled(data: any) {
  try {
    const reservation = data.reservation
    
    // Buscar reservación existente
    const existingBooking = await prisma.externalBooking.findUnique({
      where: { externalId: reservation.reservation_id }
    })

    if (!existingBooking) {
      console.log('⚠️ Reservation not found for cancellation:', reservation.reservation_id)
      return
    }

    // Actualizar estado a cancelado
    await prisma.externalBooking.update({
      where: { id: existingBooking.id },
      data: {
        status: 'CANCELLED',
        platformStatus: reservation.status,
        lastSyncAt: new Date()
      }
    })

    console.log('✅ External booking cancelled:', existingBooking.id.toString())

  } catch (error) {
    console.error('❌ Error cancelling external booking:', error)
    throw error
  }
}

async function handleReservationModified(data: any) {
  try {
    const reservation = data.reservation
    
    // Buscar reservación existente
    const existingBooking = await prisma.externalBooking.findUnique({
      where: { externalId: reservation.reservation_id }
    })

    if (!existingBooking) {
      console.log('⚠️ Reservation not found for modification:', reservation.reservation_id)
      return
    }

    // Actualizar reservación
    await prisma.externalBooking.update({
      where: { id: existingBooking.id },
      data: {
        guestName: `${reservation.guest.first_name} ${reservation.guest.last_name}`,
        guestEmail: reservation.guest.email,
        guestPhone: reservation.guest.phone,
        checkIn: new Date(reservation.check_in),
        checkOut: new Date(reservation.check_out),
        adults: reservation.guests.adults,
        children: reservation.guests.children || 0,
        totalAmount: parseFloat(reservation.total_amount),
        platformStatus: reservation.status,
        specialRequests: reservation.special_requests,
        status: 'MODIFIED',
        lastSyncAt: new Date()
      }
    })

    console.log('✅ External booking modified:', existingBooking.id.toString())

  } catch (error) {
    console.error('❌ Error modifying external booking:', error)
    throw error
  }
}






