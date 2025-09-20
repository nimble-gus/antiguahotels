import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sendEmail, testEmailConfiguration } from '@/lib/email'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const testType = searchParams.get('type') || 'config'

    console.log('🧪 Testing email system:', testType)

    switch (testType) {
      case 'config':
        return await testConfiguration()
      case 'reservation-confirmation':
        return await testReservationConfirmation()
      case 'admin-notification':
        return await testAdminNotification()
      case 'simple':
        return await testSimpleEmail()
      default:
        return NextResponse.json({ error: 'Tipo de test no válido' }, { status: 400 })
    }

  } catch (error) {
    console.error('Error testing email:', error)
    return NextResponse.json(
      { error: 'Error probando sistema de email' },
      { status: 500 }
    )
  }
}

async function testConfiguration() {
  console.log('🔧 Testing email configuration...')
  
  const result = await testEmailConfiguration()
  
  return NextResponse.json({
    success: result.success,
    message: result.success 
      ? 'Configuración de email exitosa. Revisa tu bandeja de entrada.' 
      : `Error en configuración: ${result.error}`,
    details: {
      provider: 'Resend',
      from: process.env.RESEND_FROM_EMAIL,
      enabled: process.env.NOTIFICATION_ENABLED === 'true'
    }
  })
}

async function testReservationConfirmation() {
  console.log('📧 Testing reservation confirmation email...')
  
  const testData = {
    guestName: 'Juan Carlos Pérez',
    confirmationNumber: 'AH' + new Date().getFullYear() + String(Date.now()).slice(-6),
    hotelName: 'Hotel Casa Antigua',
    hotelAddress: 'Calle Real 123, Antigua Guatemala',
    hotelPhone: '+502 1234-5678',
    checkInDate: '25 de septiembre, 2024',
    checkOutDate: '28 de septiembre, 2024',
    nights: 3,
    roomType: 'Habitación Deluxe con Vista al Volcán',
    guests: 2,
    totalAmount: '1,250.00',
    currency: 'USD',
    reservationItems: [
      { type: 'ACTIVITY', name: 'Tour al Volcán Pacaya', amount: '150.00' },
      { type: 'ACTIVITY', name: 'City Tour Antigua', amount: '75.00' }
    ],
    dashboardUrl: process.env.DASHBOARD_URL || 'http://localhost:3000/dashboard'
  }

  const result = await sendEmail({
    to: process.env.ADMIN_EMAIL || 'test@example.com',
    subject: '🧪 TEST - Confirmación de Reservación',
    template: 'reservation-confirmation',
    data: testData
  })

  return NextResponse.json({
    success: result.success,
    message: result.success 
      ? 'Email de confirmación enviado exitosamente. Revisa tu bandeja de entrada.'
      : `Error enviando email: ${result.error}`,
    messageId: result.messageId,
    testData
  })
}

async function testAdminNotification() {
  console.log('📧 Testing admin notification email...')
  
  const testData = {
    confirmationNumber: 'AH' + new Date().getFullYear() + String(Date.now()).slice(-6),
    guestName: 'María Elena Rodríguez',
    guestEmail: 'maria.rodriguez@example.com',
    guestPhone: '+502 9876-5432',
    hotelName: 'Hotel Las Maravillas',
    roomType: 'Suite Presidencial',
    checkInDate: '30 de septiembre, 2024',
    checkOutDate: '3 de octubre, 2024',
    nights: 3,
    guests: 4,
    totalAmount: '2,100.00',
    currency: 'USD',
    paymentStatus: 'PENDING',
    source: 'WEBSITE',
    createdAt: new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    dashboardUrl: process.env.DASHBOARD_URL || 'http://localhost:3000/dashboard'
  }

  const result = await sendEmail({
    to: process.env.ADMIN_EMAIL || 'test@example.com',
    subject: '🧪 TEST - Nueva Reservación Admin',
    template: 'new-reservation-admin',
    data: testData
  })

  return NextResponse.json({
    success: result.success,
    message: result.success 
      ? 'Email de notificación admin enviado exitosamente. Revisa tu bandeja de entrada.'
      : `Error enviando email: ${result.error}`,
    messageId: result.messageId,
    testData
  })
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { to, template, data } = body

    console.log('📧 Sending custom test email:', { to, template })

    const result = await sendEmail({
      to,
      subject: `🧪 TEST - ${template}`,
      template,
      data
    })

    return NextResponse.json({
      success: result.success,
      message: result.success 
        ? 'Email personalizado enviado exitosamente.'
        : `Error enviando email: ${result.error}`,
      messageId: result.messageId
    })

  } catch (error) {
    console.error('Error sending custom test email:', error)
    return NextResponse.json(
      { error: 'Error enviando email personalizado' },
      { status: 500 }
    )
  }
}

async function testSimpleEmail() {
  console.log('📧 Testing simple email template...')
  
  const testData = {
    name: 'Juan Pérez',
    message: 'Este es un email de prueba para verificar que el sistema de templates funciona correctamente.'
  }

  const result = await sendEmail({
    to: process.env.ADMIN_EMAIL || 'test@example.com',
    subject: '🧪 TEST - Email Simple',
    template: 'test-simple',
    data: testData
  })

  return NextResponse.json({
    success: result.success,
    message: result.success 
      ? 'Email simple enviado exitosamente. Revisa tu bandeja de entrada.'
      : `Error enviando email: ${result.error}`,
    messageId: result.messageId,
    testData
  })
}
