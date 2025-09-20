import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { onPaymentConfirmed } from '@/lib/notifications/triggers'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status') || ''
    const paymentMethod = searchParams.get('paymentMethod') || ''
    const provider = searchParams.get('provider') || ''
    const search = searchParams.get('search') || ''
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    const skip = (page - 1) * limit

    // Construir filtros
    const where: any = {}
    
    if (status && status !== 'all') {
      where.status = status
    }

    if (paymentMethod && paymentMethod !== 'all') {
      where.paymentMethod = paymentMethod
    }

    if (provider && provider !== 'all') {
      where.provider = provider
    }

    if (search) {
      where.OR = [
        { txnRef: { contains: search, mode: 'insensitive' } },
        { reservation: { confirmationNumber: { contains: search, mode: 'insensitive' } } },
        { reservation: { guest: {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ]
        }}}
      ]
    }

    if (dateFrom) {
      where.processedAt = { gte: new Date(dateFrom + 'T00:00:00') }
    }

    if (dateTo) {
      where.processedAt = { 
        ...where.processedAt,
        lte: new Date(dateTo + 'T23:59:59') 
      }
    }

    console.log('💳 Fetching payments with filters:', { page, limit, status, paymentMethod, provider, search, where })

    // Obtener pagos con información relacionada
    const [payments, totalCount] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          reservation: {
            include: {
              guest: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  phone: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.payment.count({ where })
    ])

    console.log('💳 Database query completed. Found payments:', payments.length)

    // Serializar BigInt y Decimal
    const serializedPayments = payments.map(payment => ({
      ...payment,
      id: payment.id.toString(),
      reservationId: payment.reservationId.toString(),
      amount: payment.amount.toString(),
      createdAt: payment.createdAt.toISOString(),
      updatedAt: payment.updatedAt.toISOString(),
      processedAt: payment.processedAt?.toISOString(),
      reservation: {
        ...payment.reservation,
        id: payment.reservation.id.toString(),
        guestId: payment.reservation.guestId.toString(),
        totalAmount: payment.reservation.totalAmount.toString(),
        createdAt: payment.reservation.createdAt.toISOString(),
        updatedAt: payment.reservation.updatedAt.toISOString(),
        checkin: payment.reservation.checkin?.toISOString(),
        checkout: payment.reservation.checkout?.toISOString(),
        guest: {
          ...payment.reservation.guest,
          id: payment.reservation.guest.id.toString()
        }
      }
    }))

    console.log('💳 Found payments:', serializedPayments.length)

    return NextResponse.json({
      payments: serializedPayments,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      }
    })

  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json(
      { error: 'Error obteniendo pagos' },
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
    console.log('💳 Creating payment:', body)

    const {
      reservationId,
      provider,
      paymentMethod,
      amount,
      currency,
      txnRef,
      notes,
      processedAt
    } = body

    // Validaciones básicas
    if (!reservationId || !provider || !paymentMethod || !amount) {
      return NextResponse.json(
        { error: 'Campos requeridos: reservación, proveedor, método de pago y monto' },
        { status: 400 }
      )
    }

    // Verificar que la reservación existe
    const reservation = await prisma.reservation.findUnique({
      where: { id: BigInt(reservationId) },
      include: {
        payments: true
      }
    })

    if (!reservation) {
      return NextResponse.json(
        { error: 'Reservación no encontrada' },
        { status: 404 }
      )
    }

    // Calcular total pagado hasta ahora
    const totalPaid = reservation.payments
      .filter(p => p.status === 'PAID')
      .reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0)

    const newAmount = parseFloat(amount)
    const reservationTotal = parseFloat(reservation.totalAmount.toString())
    const newTotalPaid = totalPaid + newAmount

    console.log('💰 Payment calculation:', {
      reservationTotal,
      totalPaid,
      newAmount,
      newTotalPaid,
      remaining: reservationTotal - newTotalPaid
    })

    // Validar que no se exceda el monto total
    if (newTotalPaid > reservationTotal) {
      return NextResponse.json(
        { error: `El pago excede el monto total. Máximo permitido: ${(reservationTotal - totalPaid).toFixed(2)}` },
        { status: 400 }
      )
    }

    // Crear pago en transacción
    const result = await prisma.$transaction(async (tx) => {
      // Crear pago
      const payment = await tx.payment.create({
        data: {
          reservationId: BigInt(reservationId),
          provider,
          status: 'PAID', // Para pagos manuales del admin
          paymentMethod,
          amount: newAmount,
          currency: currency || 'USD',
          txnRef,
          processedAt: processedAt ? new Date(processedAt) : new Date(),
          notes,
        }
      })

      // Actualizar estado de pago de la reservación
      let newPaymentStatus: 'PENDING' | 'PARTIAL' | 'PAID' = 'PENDING'
      
      if (newTotalPaid >= reservationTotal) {
        newPaymentStatus = 'PAID'
        // Si el pago está completo, confirmar la reservación
        await tx.reservation.update({
          where: { id: BigInt(reservationId) },
          data: { 
            paymentStatus: 'PAID',
            status: 'CONFIRMED' // Auto-confirmar cuando se paga completo
          }
        })
      } else if (newTotalPaid > 0) {
        newPaymentStatus = 'PARTIAL'
        await tx.reservation.update({
          where: { id: BigInt(reservationId) },
          data: { paymentStatus: 'PARTIAL' }
        })
      }

      console.log('💳 Payment status updated:', newPaymentStatus)

      return payment
    })

    console.log('✅ Payment created successfully')

    // 🔔 Disparar notificación de pago confirmado
    try {
      console.log('🔔 PAYMENT NOTIFICATION TRIGGER: Starting for payment:', result.id.toString())
      console.log('💳 Payment amount:', result.amount.toString(), result.currency)
      console.log('📧 Payment status:', result.status)
      
      const triggerResult = await onPaymentConfirmed(result.id)
      console.log('✅ PAYMENT NOTIFICATION TRIGGER: Completed successfully', triggerResult)
    } catch (notificationError) {
      console.error('❌ PAYMENT NOTIFICATION TRIGGER: Failed with error:', notificationError)
      console.error('❌ Error stack:', notificationError instanceof Error ? notificationError.stack : 'No stack')
      // No fallar el pago por errores de notificación
    }

    return NextResponse.json({
      success: true,
      payment: {
        ...result,
        id: result.id.toString(),
        reservationId: result.reservationId.toString(),
        amount: result.amount.toString(),
        createdAt: result.createdAt.toISOString(),
        updatedAt: result.updatedAt.toISOString(),
        processedAt: result.processedAt?.toISOString(),
      },
      message: 'Pago registrado exitosamente'
    })

  } catch (error) {
    console.error('Error creating payment:', error)
    return NextResponse.json(
      { error: 'Error registrando pago' },
      { status: 500 }
    )
  }
}
