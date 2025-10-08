import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { confirmPaymentIntent } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { paymentIntentId } = body

    console.log('💳 Confirming payment intent:', paymentIntentId)

    // Confirmar con Stripe
    const stripeResult = await confirmPaymentIntent(paymentIntentId)

    if (!stripeResult.success) {
      console.log('❌ Payment failed in Stripe:', stripeResult.status)
      
      // Actualizar estado en BD
      await prisma.payment.updateMany({
        where: { paymentIntentId },
        data: { 
          status: 'FAILED',
          processedAt: new Date(),
          notes: `Payment failed: ${stripeResult.status}`
        }
      })

      return NextResponse.json({
        success: false,
        error: 'El pago no pudo ser procesado',
        status: stripeResult.status
      })
    }

    console.log('✅ Payment successful in Stripe')

    // Obtener el pago de la base de datos
    const payment = await prisma.payment.findFirst({
      where: { paymentIntentId },
      include: {
        reservation: {
          include: {
            payments: { where: { status: 'PAID' } }
          }
        }
      }
    })

    if (!payment) {
      return NextResponse.json(
        { error: 'Pago no encontrado en la base de datos' },
        { status: 404 }
      )
    }

    // Actualizar pago y reservación en transacción
    const result = await prisma.$transaction(async (tx) => {
      // Actualizar estado del pago
      const updatedPayment = await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: 'PAID',
          processedAt: new Date(),
          txnRef: stripeResult.charges[0]?.id || paymentIntentId,
          gatewayResponse: stripeResult as any,
          notes: 'Pago procesado exitosamente por Stripe'
        }
      })

      // Calcular nuevo total pagado
      const allPaidPayments = await tx.payment.findMany({
        where: {
          reservationId: payment.reservationId,
          status: 'PAID'
        }
      })

      const totalPaid = allPaidPayments.reduce(
        (sum, p) => sum + parseFloat(p.amount.toString()), 
        0
      )
      const reservationTotal = parseFloat(payment.reservation.totalAmount.toString())

      console.log('💰 Payment totals after confirmation:', {
        reservationTotal,
        totalPaid,
        isComplete: totalPaid >= reservationTotal
      })

      // Actualizar estado de la reservación
      let newPaymentStatus: 'PENDING' | 'PARTIAL' | 'PAID' = 'PENDING'
      let newReservationStatus = payment.reservation.status

      if (totalPaid >= reservationTotal) {
        newPaymentStatus = 'PAID'
        newReservationStatus = 'CONFIRMED' // Auto-confirmar cuando se paga completo
      } else if (totalPaid > 0) {
        newPaymentStatus = 'PARTIAL'
      }

      await tx.reservation.update({
        where: { id: payment.reservationId },
        data: {
          paymentStatus: newPaymentStatus,
          status: newReservationStatus
        }
      })

      return {
        payment: updatedPayment,
        newPaymentStatus,
        newReservationStatus,
        totalPaid,
        reservationTotal
      }
    })

    console.log('✅ Payment confirmed and reservation updated')

    return NextResponse.json({
      success: true,
      payment: {
        ...result.payment,
        id: result.payment.id.toString(),
        reservationId: result.payment.reservationId.toString(),
        amount: result.payment.amount.toString(),
        createdAt: result.payment.createdAt.toISOString(),
        updatedAt: result.payment.updatedAt.toISOString(),
        processedAt: result.payment.processedAt?.toISOString(),
      },
      reservationStatus: {
        paymentStatus: result.newPaymentStatus,
        reservationStatus: result.newReservationStatus,
        totalPaid: result.totalPaid,
        reservationTotal: result.reservationTotal,
        isComplete: result.totalPaid >= result.reservationTotal
      },
      message: 'Pago procesado exitosamente'
    })

  } catch (error) {
    console.error('Error confirming payment:', error)
    return NextResponse.json(
      { error: 'Error confirmando pago' },
      { status: 500 }
    )
  }
}





