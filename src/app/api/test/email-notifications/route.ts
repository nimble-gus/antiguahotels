import { NextRequest, NextResponse } from 'next/server'
import { testEmailConfiguration, sendEmail } from '@/lib/email'
import { onReservationCreated } from '@/lib/notifications/triggers'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing email notification system...')

    // 1. Probar configuración de email
    const configTest = await testEmailConfiguration()
    console.log('📧 Email config test:', configTest)

    if (!configTest.success) {
      return NextResponse.json({
        success: false,
        error: 'Email configuration failed',
        details: configTest.error
      }, { status: 500 })
    }

    // 2. Probar envío de email simple
    const simpleEmailTest = await sendEmail({
      to: process.env.ADMIN_EMAIL || 'test@example.com',
      subject: '🧪 Test Email - Antigua Hotels',
      template: 'test-simple',
      data: {
        message: 'This is a test email from Antigua Hotels notification system.',
        timestamp: new Date().toISOString()
      }
    })

    console.log('📧 Simple email test:', simpleEmailTest)

    // 3. Buscar una reservación existente para probar el trigger
    const existingReservation = await prisma.reservation.findFirst({
      orderBy: { createdAt: 'desc' },
      take: 1
    })

    let triggerTest = null
    if (existingReservation) {
      console.log('🔔 Testing notification trigger with reservation:', existingReservation.id.toString())
      try {
        await onReservationCreated(existingReservation.id)
        triggerTest = { success: true, message: 'Trigger executed successfully' }
      } catch (error) {
        triggerTest = { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
      }
    } else {
      triggerTest = { success: false, message: 'No existing reservations found to test trigger' }
    }

    return NextResponse.json({
      success: true,
      tests: {
        emailConfig: configTest,
        simpleEmail: simpleEmailTest,
        notificationTrigger: triggerTest
      },
      environment: {
        RESEND_API_KEY: process.env.RESEND_API_KEY ? 'Set' : 'Not set',
        RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL || 'Not set',
        NOTIFICATION_ENABLED: process.env.NOTIFICATION_ENABLED || 'Not set',
        ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'Not set',
        DASHBOARD_URL: process.env.DASHBOARD_URL || 'Not set'
      }
    })

  } catch (error) {
    console.error('❌ Error testing email notifications:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { testType, email } = body

    if (testType === 'simple') {
      // Probar envío de email simple
      const result = await sendEmail({
        to: email || process.env.ADMIN_EMAIL || 'test@example.com',
        subject: '🧪 Test Email - Antigua Hotels',
        template: 'test-simple',
        data: {
          message: 'This is a test email from Antigua Hotels notification system.',
          timestamp: new Date().toISOString()
        }
      })

      return NextResponse.json({
        success: result.success,
        messageId: result.messageId,
        error: result.error
      })
    }

    if (testType === 'reservation') {
      // Probar email de confirmación de reservación con datos realistas
      const result = await sendEmail({
        to: email || process.env.ADMIN_EMAIL || 'test@example.com',
        subject: '✅ Test Reservation Confirmation',
        template: 'reservation-confirmation',
        data: {
          guestName: 'María González',
          confirmationNumber: 'AH202412010001',
          hotelName: 'Hotel Casa Antigua',
          hotelAddress: 'Calle Real 123, Antigua Guatemala',
          hotelPhone: '+502 1234-5678',
          checkInDate: '2 de diciembre, 2024',
          checkOutDate: '5 de diciembre, 2024',
          nights: 3,
          roomType: 'Habitación Deluxe',
          guests: 2,
          totalAmount: '195.00',
          currency: 'USD',
          reservationItems: [
            {
              type: 'ACTIVITY',
              name: 'Tour de la Ciudad Colonial',
              amount: '75.00'
            }
          ],
          dashboardUrl: process.env.DASHBOARD_URL || 'http://localhost:3000/dashboard'
        }
      })

      return NextResponse.json({
        success: result.success,
        messageId: result.messageId,
        error: result.error
      })
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid test type. Use "simple", "reservation", or "admin-notification"'
    }, { status: 400 })

  } catch (error) {
    console.error('❌ Error in email test:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
