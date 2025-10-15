import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createPaymentIntent } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { reservationId, currency = 'usd' } = body

    console.log('💳 Creating payment intent for reservation:', reservationId)

    // Obtener datos de la reservación
    const reservation = await prisma.reservation.findUnique({
      where: { id: BigInt(reservationId) },
      include: {
        guest: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        payments: {
          where: { status: 'PAID' }
        }
      }
    })

    if (!reservation) {
      return NextResponse.json(
        { error: 'Reservación no encontrada' },
        { status: 404 }
      )
    }

    // Calcular monto pendiente
    const totalAmount = parseFloat(reservation.totalAmount.toString())
    const paidAmount = reservation.payments.reduce(
      (sum, payment) => sum + parseFloat(payment.amount.toString()), 
      0
    )
    const pendingAmount = totalAmount - paidAmount

    if (pendingAmount <= 0) {
      return NextResponse.json(
        { error: 'Esta reservación ya está completamente pagada' },
        { status: 400 }
      )
    }

    console.log('💰 Payment calculation:', {
      totalAmount,
      paidAmount,
      pendingAmount,
      currency
    })

    // Crear Payment Intent con Stripe
    const paymentIntent = await createPaymentIntent({
      amount: pendingAmount,
      currency: currency as 'usd' | 'gtq',
      reservationId,
      guestEmail: reservation.guest.email || undefined,
      description: `Pago para reservación ${reservation.confirmationNumber} - ${reservation.guest.firstName} ${reservation.guest.lastName}`,
      metadata: {
        guestName: `${reservation.guest.firstName} ${reservation.guest.lastName}`,
        confirmationNumber: reservation.confirmationNumber
      }
    })

    // Registrar intent en la base de datos
    await prisma.payment.create({
      data: {
        reservationId: BigInt(reservationId),
        paymentIntentId: paymentIntent.paymentIntentId,
        provider: 'STRIPE',
        status: 'INITIATED',
        paymentMethod: 'CREDIT_CARD', // Se actualizará cuando se complete
        amount: pendingAmount,
        currency: currency.toUpperCase(),
        notes: 'Payment Intent creado - Esperando confirmación del cliente'
      }
    })

    console.log('✅ Payment Intent created and registered')

    return NextResponse.json({
      success: true,
      ...paymentIntent,
      pendingAmount,
      reservationInfo: {
        confirmationNumber: reservation.confirmationNumber,
        guestName: `${reservation.guest.firstName} ${reservation.guest.lastName}`,
        totalAmount,
        paidAmount
      }
    })

  } catch (error) {
    console.error('Error creating payment intent:', error)
    return NextResponse.json(
      { error: 'Error creando intención de pago' },
      { status: 500 }
    )
  }
}








