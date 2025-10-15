import { sendEmail, sendEmailToAdmins } from '@/lib/email'
import { prisma } from '@/lib/prisma'

// Verificar que los templates estén disponibles
console.log('🔍 Checking email system availability...')
try {
  // Forzar la importación de los templates
  require('@/lib/email/templates/reservation-confirmation')
  require('@/lib/email/templates/new-reservation-admin')
  console.log('✅ Email templates loaded successfully in triggers.ts')
} catch (importError) {
  console.error('❌ Error importing email templates in triggers.ts:', importError)
}

// Tipos para los triggers
export interface ReservationData {
  id: bigint
  confirmationNumber: string
  guestId: bigint
  totalAmount: string
  currency: string
  status: string
  paymentStatus: string
  source: string
  createdAt: Date
  guest: {
    firstName: string
    lastName: string
    email: string
    phone?: string
  }
  reservationItems: Array<{
    itemType: string
    amount: string
    accommodationStay?: {
      hotel: {
        name: string
        address: string
        phone?: string
      }
      roomType: {
        name: string
      }
      checkInDate: Date
      checkOutDate: Date
      nights: number
      guests: number
    }
    activityBooking?: {
      activity: {
        name: string
      }
      participants: number
      activityDate: Date
    }
    packageBooking?: {
      package: {
        name: string
      }
      pax: number
      startTs?: Date
      endTs?: Date
    }
  }>
}

export interface PaymentData {
  id: bigint
  reservationId: bigint
  amount: string
  currency: string
  status: string
  paymentMethod: string
  processedAt?: Date
  reservation: {
    confirmationNumber: string
    guest: {
      firstName: string
      lastName: string
      email: string
    }
  }
}

// Trigger cuando se crea una nueva reservación
export async function onReservationCreated(reservationId: bigint) {
  try {
    console.log('🔔 Trigger: Reservation Created', reservationId.toString())

    // Obtener datos completos de la reservación
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        guest: true,
        reservationItems: {
          include: {
            accommodationStay: {
              include: {
                hotel: true,
                roomType: true
              }
            },
            activityBooking: {
              include: {
                activity: true
              }
            },
            packageBooking: {
              include: {
                package: true
              }
            }
          }
        }
      }
    })

    if (!reservation) {
      console.error('❌ Reservation not found:', reservationId.toString())
      return
    }

    // Preparar datos para el email del huésped
    const guestEmailData = await prepareGuestEmailData(reservation as any)
    
    // Enviar confirmación al huésped
    const guestEmailResult = await sendEmail({
      to: reservation.guest.email || 'noreply@antiguahotels.com',
      subject: `✅ Confirmación de Reservación ${reservation.confirmationNumber}`,
      template: 'reservation-confirmation',
      data: guestEmailData,
      reservationId: reservation.id,
      guestId: reservation.guest.id
    })

    console.log('📧 Guest confirmation email:', guestEmailResult.success ? 'sent' : 'failed')

    // Preparar datos para el email de administradores
    const adminEmailData = await prepareAdminEmailData(reservation as any)

    // Enviar notificación a administradores
    const adminEmailResult = await sendEmailToAdmins(
      `🆕 Nueva Reservación ${reservation.confirmationNumber}`,
      'new-reservation-admin',
      adminEmailData,
      reservation.id
    )

    console.log('📧 Admin notification email:', adminEmailResult.success ? 'sent' : 'failed')

    return {
      guestEmail: guestEmailResult,
      adminEmail: adminEmailResult
    }

  } catch (error) {
    console.error('❌ Error in onReservationCreated trigger:', error)
    throw error
  }
}

// Trigger cuando se confirma un pago
export async function onPaymentConfirmed(paymentId: bigint) {
  try {
    console.log('🔔 Trigger: Payment Confirmed', paymentId.toString())

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        reservation: {
          include: {
            guest: true
          }
        }
      }
    })

    if (!payment) {
      console.error('❌ Payment not found:', paymentId.toString())
      return
    }

    // Preparar datos para el email de confirmación de pago
    const emailData = {
      guestName: `${payment.reservation.guest.firstName} ${payment.reservation.guest.lastName}`,
      confirmationNumber: payment.reservation.confirmationNumber,
      paymentAmount: payment.amount.toString(),
      currency: payment.currency,
      paymentMethod: getPaymentMethodLabel(payment.paymentMethod),
      processedAt: payment.processedAt?.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) || new Date().toLocaleDateString('es-ES'),
      dashboardUrl: process.env.DASHBOARD_URL
    }

    // Enviar confirmación de pago al huésped
    const result = await sendEmail({
      to: payment.reservation.guest.email || 'noreply@antiguahotels.com',
      subject: `💳 Pago Confirmado - ${payment.reservation.confirmationNumber}`,
      template: 'payment-confirmation',
      data: emailData,
      reservationId: payment.reservationId,
      guestId: payment.reservation.guest.id
    })

    console.log('📧 Payment confirmation email:', result.success ? 'sent' : 'failed')

    return result

  } catch (error) {
    console.error('❌ Error in onPaymentConfirmed trigger:', error)
    throw error
  }
}

// Trigger para recordatorio de check-in (24 horas antes)
export async function onCheckInReminder(reservationId: bigint) {
  try {
    console.log('🔔 Trigger: Check-in Reminder', reservationId.toString())

    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        guest: true,
        reservationItems: {
          include: {
            accommodationStay: {
              include: {
                hotel: true,
                roomType: true
              }
            }
          }
        }
      }
    })

    if (!reservation) {
      console.error('❌ Reservation not found for reminder:', reservationId.toString())
      return
    }

    // Buscar accommodation stay (solo para alojamiento)
    const accommodationStay = reservation.reservationItems.find(
      (item: any) => item.accommodationStay
    )?.accommodationStay

    if (!accommodationStay) {
      console.log('ℹ️ No accommodation stay found, skipping check-in reminder')
      return
    }

    const emailData = {
      guestName: `${reservation.guest.firstName} ${reservation.guest.lastName}`,
      confirmationNumber: reservation.confirmationNumber,
      hotelName: accommodationStay.hotel.name,
      hotelAddress: accommodationStay.hotel.address,
      hotelPhone: accommodationStay.hotel.phone || '',
      checkInDate: accommodationStay.checkInDate.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      checkInTime: accommodationStay.hotel.checkInTime?.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      }) || '3:00 PM',
      roomType: accommodationStay.roomType.name,
      nights: accommodationStay.nights,
      guests: 2, // Valor por defecto para check-in reminder
      dashboardUrl: process.env.DASHBOARD_URL
    }

    const result = await sendEmail({
      to: reservation.guest.email || 'noreply@antiguahotels.com',
      subject: `🏨 Su llegada es mañana - ${accommodationStay.hotel.name}`,
      template: 'check-in-reminder',
      data: emailData,
      reservationId: reservation.id,
      guestId: reservation.guest.id
    })

    console.log('📧 Check-in reminder email:', result.success ? 'sent' : 'failed')

    return result

  } catch (error) {
    console.error('❌ Error in onCheckInReminder trigger:', error)
    throw error
  }
}

// Funciones auxiliares para preparar datos de email
async function prepareGuestEmailData(reservation: ReservationData) {
  // Buscar el primer item de reservación para obtener información del servicio
  const firstItem = reservation.reservationItems[0]
  
  // Extraer información del hotel desde los metadatos si es una reservación de alojamiento
  let hotelName = 'Servicio de Reservación'
  let hotelAddress = ''
  let hotelPhone = ''
  let checkInDate = ''
  let checkOutDate = ''
  let nights = 0
  let roomType = 'Servicio'
  let guests = 1

  if (firstItem) {
    if (firstItem.itemType === 'ACCOMMODATION') {
      // Para alojamientos, usar accommodationStay si existe (reservaciones del dashboard)
      if (firstItem.accommodationStay) {
        hotelName = firstItem.accommodationStay.hotel.name
        hotelAddress = firstItem.accommodationStay.hotel.address
        hotelPhone = firstItem.accommodationStay.hotel.phone || ''
        checkInDate = firstItem.accommodationStay.checkInDate.toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
        checkOutDate = firstItem.accommodationStay.checkOutDate.toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
        nights = firstItem.accommodationStay.nights
        roomType = firstItem.accommodationStay.roomType.name
        guests = firstItem.accommodationStay.guests
      } else {
        // Para reservaciones públicas, extraer datos de los metadatos
        const meta = (firstItem as any).meta
        hotelName = meta.hotelName || 'Hotel'
        roomType = meta.roomTypeName || 'Habitación'
        checkInDate = meta.checkIn ? new Date(meta.checkIn).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }) : ''
        checkOutDate = meta.checkOut ? new Date(meta.checkOut).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }) : ''
        nights = meta.nights || 0
        guests = meta.adults || 1
        
        // Para reservaciones públicas, necesitamos obtener datos del hotel desde la base de datos
        if (meta.hotelId) {
          try {
            const hotel = await prisma.hotel.findUnique({
              where: { id: BigInt(meta.hotelId) },
              select: {
                name: true,
                address: true,
                phone: true
              }
            })
            if (hotel) {
              hotelName = hotel.name
              hotelAddress = hotel.address || ''
              hotelPhone = hotel.phone || ''
            }
          } catch (error) {
            console.error('Error fetching hotel data:', error)
          }
        }
      }
    } else if (firstItem.itemType === 'ACTIVITY') {
      hotelName = 'Actividad'
      roomType = (firstItem as any).title || 'Actividad'
      checkInDate = (reservation as any).checkin ? (reservation as any).checkin.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) : ''
    } else if (firstItem.itemType === 'PACKAGE') {
      hotelName = 'Paquete'
      roomType = (firstItem as any).title || 'Paquete'
      checkInDate = (reservation as any).checkin ? (reservation as any).checkin.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) : ''
      nights = (firstItem as any).meta?.durationDays || 0
      guests = (firstItem as any).meta?.participants || 1
    }
  }

  // Preparar servicios adicionales
  const reservationItems = reservation.reservationItems
    .filter(item => item.itemType !== 'ACCOMMODATION')
    .map(item => {
      if (item.activityBooking) {
        return {
          type: 'ACTIVITY',
          name: item.activityBooking.activity.name,
          amount: item.amount.toString()
        }
      }
      if (item.packageBooking) {
        return {
          type: 'PACKAGE',
          name: item.packageBooking.package.name,
          amount: item.amount.toString()
        }
      }
      return {
        type: item.itemType,
        name: `Servicio ${item.itemType}`,
        amount: item.amount.toString()
      }
    })

  return {
    guestName: `${reservation.guest.firstName} ${reservation.guest.lastName}`,
    confirmationNumber: reservation.confirmationNumber,
    hotelName,
    hotelAddress,
    hotelPhone,
    checkInDate,
    checkOutDate,
    nights,
    roomType,
    guests,
    totalAmount: reservation.totalAmount.toString(),
    currency: reservation.currency,
    reservationItems,
    dashboardUrl: process.env.DASHBOARD_URL
  }
}

async function prepareAdminEmailData(reservation: ReservationData) {
  // Buscar el primer item de reservación para obtener información del servicio
  const firstItem = reservation.reservationItems[0]
  
  // Extraer información del hotel desde los metadatos si es una reservación de alojamiento
  let hotelName = 'Servicio de Reservación'
  let roomType = 'Servicio'
  let checkInDate = ''
  let checkOutDate = ''
  let nights = 0
  let guests = 1

  if (firstItem) {
    if (firstItem.itemType === 'ACCOMMODATION') {
      // Para alojamientos, usar accommodationStay si existe
      if (firstItem.accommodationStay) {
        hotelName = firstItem.accommodationStay.hotel.name
        roomType = firstItem.accommodationStay.roomType.name
        checkInDate = firstItem.accommodationStay.checkInDate.toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
        checkOutDate = firstItem.accommodationStay.checkOutDate.toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
        nights = firstItem.accommodationStay.nights
        guests = firstItem.accommodationStay.guests
      } else {
        // Fallback para reservaciones públicas
        hotelName = 'Hotel'
        roomType = 'Habitación'
      }
    } else if (firstItem.itemType === 'ACTIVITY') {
      hotelName = 'Actividad'
      roomType = 'Actividad'
    } else if (firstItem.itemType === 'PACKAGE') {
      hotelName = 'Paquete'
      roomType = 'Paquete'
    }
  }

  return {
    confirmationNumber: reservation.confirmationNumber,
    guestName: `${reservation.guest.firstName} ${reservation.guest.lastName}`,
    guestEmail: reservation.guest.email,
    guestPhone: reservation.guest.phone || 'No proporcionado',
    hotelName,
    roomType,
    checkInDate,
    checkOutDate,
    nights,
    guests,
    totalAmount: reservation.totalAmount.toString(),
    currency: reservation.currency,
    paymentStatus: reservation.paymentStatus,
    source: reservation.source,
    createdAt: reservation.createdAt.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    dashboardUrl: process.env.DASHBOARD_URL
  }
}

function getPaymentMethodLabel(method: string): string {
  switch (method) {
    case 'CREDIT_CARD': return 'Tarjeta de Crédito'
    case 'DEBIT_CARD': return 'Tarjeta de Débito'
    case 'PAYPAL': return 'PayPal'
    case 'BANK_TRANSFER': return 'Transferencia Bancaria'
    case 'CASH': return 'Efectivo'
    default: return method
  }
}

// Función para programar recordatorios de check-in
export async function scheduleCheckInReminders() {
  try {
    console.log('⏰ Scheduling check-in reminders...')

    // Buscar reservaciones que tengan check-in mañana
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)

    const nextDay = new Date(tomorrow)
    nextDay.setDate(nextDay.getDate() + 1)

    const reservations = await prisma.reservation.findMany({
      where: {
        status: { in: ['CONFIRMED'] },
        reservationItems: {
          some: {
            accommodationStay: {
              checkInDate: {
                gte: tomorrow,
                lt: nextDay
              }
            }
          }
        }
      },
      select: { id: true }
    })

    console.log(`📅 Found ${reservations.length} reservations for check-in reminders`)

    // Programar recordatorios para cada reservación
    for (const reservation of reservations) {
      try {
        await onCheckInReminder(reservation.id)
      } catch (error) {
        console.error(`❌ Error sending reminder for reservation ${reservation.id}:`, error)
      }
    }

    return { processed: reservations.length }

  } catch (error) {
    console.error('❌ Error scheduling check-in reminders:', error)
    throw error
  }
}
