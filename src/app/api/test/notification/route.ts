import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { resend } from '@/lib/email'
import { prisma } from '@/lib/prisma'
import { render } from '@react-email/render'
import ReservationConfirmation from '@/lib/email/templates/reservation-confirmation'
import NewReservationAdmin from '@/lib/email/templates/new-reservation-admin'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    console.log('🧪 Testing direct notification with latest reservation...')

    // Obtener la última reservación
    const reservation = await prisma.reservation.findFirst({
      orderBy: { createdAt: 'desc' },
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
      return NextResponse.json({ 
        error: 'No hay reservaciones en el sistema' 
      }, { status: 404 })
    }

    console.log('📋 Found reservation:', {
      id: reservation.id.toString(),
      confirmationNumber: reservation.confirmationNumber,
      guestEmail: reservation.guest.email
    })

    // Preparar datos para el email del huésped
    const accommodationStay = reservation.reservationItems.find(
      item => item.accommodationStay
    )?.accommodationStay

    const guestEmailData = {
      guestName: `${reservation.guest.firstName} ${reservation.guest.lastName}`,
      confirmationNumber: reservation.confirmationNumber,
      hotelName: accommodationStay?.hotel.name || 'Antigua Hotels',
      hotelAddress: accommodationStay?.hotel.address || '',
      hotelPhone: accommodationStay?.hotel.phone || '',
      checkInDate: accommodationStay?.checkInDate.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) || '',
      checkOutDate: accommodationStay?.checkOutDate.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) || '',
      nights: accommodationStay?.nights || 0,
      roomType: accommodationStay?.roomType.name || 'Servicio',
      guests: accommodationStay?.adults || 1,
      totalAmount: reservation.totalAmount.toString(),
      currency: reservation.currency,
      reservationItems: [],
      dashboardUrl: process.env.DASHBOARD_URL || 'http://localhost:3000/dashboard'
    }

    console.log('📧 Sending guest email to:', reservation.guest.email)

    // Renderizar y enviar email al huésped directamente
    const guestHtmlRaw = render(ReservationConfirmation(guestEmailData))
    const guestHtml = await Promise.resolve(guestHtmlRaw).then(html => 
      typeof html === 'string' ? html : String(html)
    )
    const guestSubject = `✅ Confirmación de Reservación ${reservation.confirmationNumber} - ${accommodationStay?.hotel.name || 'Antigua Hotels'}`
    
    console.log('📄 Guest HTML type:', typeof guestHtmlRaw, 'Length:', guestHtml.length)

    const guestEmailResult = await resend.emails.send({
      from: `${process.env.RESEND_FROM_NAME || 'Antigua Hotels'} <${process.env.RESEND_FROM_EMAIL || 'noreply@antiguahotels.com'}>`,
      to: [reservation.guest.email || ''],
      subject: guestSubject,
      html: guestHtml,
    })

    console.log('📧 Guest email result:', guestEmailResult.data?.id ? 'SUCCESS' : 'FAILED')

    // Preparar datos para el email de admin
    const adminEmailData = {
      confirmationNumber: reservation.confirmationNumber,
      guestName: `${reservation.guest.firstName} ${reservation.guest.lastName}`,
      guestEmail: reservation.guest.email || '',
      guestPhone: reservation.guest.phone || 'No proporcionado',
      hotelName: accommodationStay?.hotel.name || 'Servicio de Reservación',
      roomType: accommodationStay?.roomType.name || 'Servicio',
      checkInDate: accommodationStay?.checkInDate.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) || '',
      checkOutDate: accommodationStay?.checkOutDate.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) || '',
      nights: accommodationStay?.nights || 0,
      guests: accommodationStay?.adults || 1,
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
      dashboardUrl: process.env.DASHBOARD_URL || 'http://localhost:3000/dashboard'
    }

    console.log('📧 Sending admin email to:', process.env.ADMIN_EMAIL)

    // Renderizar y enviar email al admin directamente
    const adminHtmlRaw = render(NewReservationAdmin(adminEmailData))
    const adminHtml = await Promise.resolve(adminHtmlRaw).then(html => 
      typeof html === 'string' ? html : String(html)
    )
    const adminSubject = `🆕 Nueva Reservación ${reservation.confirmationNumber} - ${guestEmailData.guestName}`
    
    console.log('📄 Admin HTML type:', typeof adminHtmlRaw, 'Length:', adminHtml.length)

    const adminEmailResult = await resend.emails.send({
      from: `${process.env.RESEND_FROM_NAME || 'Antigua Hotels'} <${process.env.RESEND_FROM_EMAIL || 'noreply@antiguahotels.com'}>`,
      to: [process.env.ADMIN_EMAIL || 'admin@antiguahotels.com'],
      subject: adminSubject,
      html: adminHtml,
    })

    console.log('📧 Admin email result:', adminEmailResult.data?.id ? 'SUCCESS' : 'FAILED')

    return NextResponse.json({
      success: true,
      message: 'Notificaciones enviadas directamente',
      reservation: {
        id: reservation.id.toString(),
        confirmationNumber: reservation.confirmationNumber,
        guestEmail: reservation.guest.email
      },
      emailResults: {
        guest: {
          success: !!guestEmailResult.data?.id,
          messageId: guestEmailResult.data?.id,
          error: guestEmailResult.error
        },
        admin: {
          success: !!adminEmailResult.data?.id,
          messageId: adminEmailResult.data?.id,
          error: adminEmailResult.error
        }
      }
    })

  } catch (error) {
    console.error('❌ Error in direct notification test:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
