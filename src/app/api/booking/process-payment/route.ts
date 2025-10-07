import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createCyberSourceTransaction, confirmCyberSourcePayment } from '@/lib/cybersource'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { reservationId, cardData, amount, currency } = body

    console.log('💳 Processing CyberSource payment for reservation:', reservationId)

    // Validar datos requeridos
    if (!reservationId || !cardData || !amount) {
      return NextResponse.json(
        { error: 'Datos de pago incompletos' },
        { status: 400 }
      )
    }

    // Obtener reservación
    const reservation = await prisma.reservation.findUnique({
      where: { id: BigInt(reservationId) },
      include: {
        guest: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    if (!reservation) {
      return NextResponse.json(
        { error: 'Reservación no encontrada' },
        { status: 404 }
      )
    }

    // Verificar que la reservación esté pendiente de pago
    if (reservation.paymentStatus === 'PAID') {
      return NextResponse.json(
        { error: 'Esta reservación ya está pagada' },
        { status: 400 }
      )
    }

    // Verificar que el monto coincida
    const reservationAmount = parseFloat(reservation.totalAmount.toString())
    if (Math.abs(amount - reservationAmount) > 0.01) {
      return NextResponse.json(
        { error: 'El monto no coincide con la reservación' },
        { status: 400 }
      )
    }

    console.log('🏦 Creating CyberSource transaction...')

    // Crear transacción con CyberSource
    const cyberSourceResult = await createCyberSourceTransaction({
      amount: amount,
      currency: currency || 'USD',
      reservationId: reservationId,
      customerEmail: reservation.guest.email,
      description: `Pago para reservación ${reservation.confirmationNumber} - ${reservation.guest.firstName} ${reservation.guest.lastName}`,
      metadata: {
        guestName: `${reservation.guest.firstName} ${reservation.guest.lastName}`,
        confirmationNumber: reservation.confirmationNumber,
        serviceType: reservation.serviceType
      }
    })

    console.log('🏦 CyberSource result:', cyberSourceResult)

    // Si la integración está pendiente, simular el proceso
    if (cyberSourceResult.status === 'pending_integration') {
      console.log('⚠️ CyberSource integration pending - simulating payment')
      
      // Simular pago exitoso para desarrollo
      const simulatedPayment = await prisma.payment.create({
        data: {
          reservationId: BigInt(reservationId),
          paymentIntentId: `sim_${Date.now()}`,
          provider: 'CYBERSOURCE',
          status: 'PAID',
          paymentMethod: 'CREDIT_CARD',
          amount: amount,
          currency: currency || 'USD',
          txnRef: `sim_txn_${Date.now()}`,
          processedAt: new Date(),
          notes: 'Pago simulado - CyberSource integration pending',
          gatewayResponse: {
            simulated: true,
            cardType: cardData.cardType || 'Unknown',
            last4: cardData.cardNumber?.slice(-4) || '****'
          } as any
        }
      })

      // Actualizar estado de la reservación
      await prisma.reservation.update({
        where: { id: BigInt(reservationId) },
        data: {
          paymentStatus: 'PAID',
          status: 'CONFIRMED'
        }
      })

      console.log('✅ Simulated payment processed successfully')

      return NextResponse.json({
        success: true,
        paymentId: simulatedPayment.id.toString(),
        status: 'simulated',
        message: 'Pago simulado exitosamente - CyberSource integration pending',
        reservation: {
          id: reservation.id.toString(),
          confirmationNumber: reservation.confirmationNumber,
          status: 'CONFIRMED',
          paymentStatus: 'PAID'
        }
      })
    }

    // Si CyberSource está configurado, procesar pago real
    if (cyberSourceResult.success) {
      // Crear registro de pago
      const payment = await prisma.payment.create({
        data: {
          reservationId: BigInt(reservationId),
          paymentIntentId: cyberSourceResult.transactionId || `cs_${Date.now()}`,
          provider: 'CYBERSOURCE',
          status: 'INITIATED',
          paymentMethod: 'CREDIT_CARD',
          amount: amount,
          currency: currency || 'USD',
          txnRef: cyberSourceResult.transactionId,
          notes: 'Pago iniciado con CyberSource/NeoNet',
          gatewayResponse: cyberSourceResult as any
        }
      })

      // Confirmar pago con CyberSource
      const confirmationResult = await confirmCyberSourcePayment(cyberSourceResult.transactionId!)

      if (confirmationResult.success) {
        // Actualizar pago como completado
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'PAID',
            processedAt: new Date(),
            notes: 'Pago confirmado por CyberSource/NeoNet',
            gatewayResponse: confirmationResult as any
          }
        })

        // Actualizar estado de la reservación
        await prisma.reservation.update({
          where: { id: BigInt(reservationId) },
          data: {
            paymentStatus: 'PAID',
            status: 'CONFIRMED'
          }
        })

        console.log('✅ CyberSource payment confirmed successfully')

        return NextResponse.json({
          success: true,
          paymentId: payment.id.toString(),
          status: 'confirmed',
          message: 'Pago procesado exitosamente con CyberSource/NeoNet',
          reservation: {
            id: reservation.id.toString(),
            confirmationNumber: reservation.confirmationNumber,
            status: 'CONFIRMED',
            paymentStatus: 'PAID'
          }
        })
      } else {
        // Pago falló
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'FAILED',
            notes: 'Pago falló en CyberSource/NeoNet',
            gatewayResponse: confirmationResult as any
          }
        })

        return NextResponse.json({
          success: false,
          error: 'El pago fue rechazado por el procesador',
          details: confirmationResult.message
        }, { status: 400 })
      }
    } else {
      return NextResponse.json({
        success: false,
        error: 'Error creando transacción con CyberSource',
        details: cyberSourceResult.message
      }, { status: 400 })
    }

  } catch (error) {
    console.error('❌ Error processing CyberSource payment:', error)
    return NextResponse.json(
      { 
        error: 'Error procesando el pago',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
