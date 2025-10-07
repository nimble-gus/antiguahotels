import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { resend } from '@/lib/email'
import { prisma } from '@/lib/prisma'
import { render } from '@react-email/render'
import PaymentConfirmation from '@/lib/email/templates/payment-confirmation'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    console.log('🧪 Testing payment notification with latest payment...')

    // Obtener el último pago
    const payment = await prisma.payment.findFirst({
      orderBy: { createdAt: 'desc' },
      include: {
        reservation: {
          include: {
            guest: true
          }
        }
      }
    })

    if (!payment) {
      return NextResponse.json({ 
        error: 'No hay pagos en el sistema' 
      }, { status: 404 })
    }

    console.log('💳 Found payment:', {
      id: payment.id.toString(),
      amount: payment.amount.toString(),
      reservationNumber: payment.reservation.confirmationNumber,
      guestEmail: payment.reservation.guest.email
    })

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
      dashboardUrl: process.env.DASHBOARD_URL || 'http://localhost:3000/dashboard'
    }

    console.log('📧 Sending payment confirmation email to:', payment.reservation.guest.email)

    // Renderizar y enviar email de confirmación de pago
    const htmlRaw = render(PaymentConfirmation(emailData))
    const html = await Promise.resolve(htmlRaw).then(html => 
      typeof html === 'string' ? html : String(html)
    )
    const subject = `💳 Pago Confirmado ${payment.currency} ${payment.amount} - ${payment.reservation.confirmationNumber}`

    console.log('📄 Payment HTML type:', typeof htmlRaw, 'Length:', html.length)

    const emailResult = await resend.emails.send({
      from: `${process.env.RESEND_FROM_NAME || 'Antigua Hotels'} <${process.env.RESEND_FROM_EMAIL || 'noreply@antiguahotelstours.com'}>`,
      to: [payment.reservation.guest.email],
      subject: subject,
      html: html,
    })

    console.log('📧 Payment email result:', emailResult.data?.id ? 'SUCCESS' : 'FAILED')

    return NextResponse.json({
      success: true,
      message: 'Notificación de pago enviada directamente',
      payment: {
        id: payment.id.toString(),
        amount: payment.amount.toString(),
        currency: payment.currency,
        reservationNumber: payment.reservation.confirmationNumber,
        guestEmail: payment.reservation.guest.email
      },
      emailResult: {
        success: !!emailResult.data?.id,
        messageId: emailResult.data?.id,
        error: emailResult.error
      }
    })

  } catch (error) {
    console.error('❌ Error in payment notification test:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
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



