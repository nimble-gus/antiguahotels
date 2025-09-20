import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { onReservationCreated, onPaymentConfirmed } from '@/lib/notifications/triggers'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const reservationId = searchParams.get('reservationId') || 'latest'

    console.log('🔔 GET trigger request for reservation:', reservationId)

    let targetReservationId: bigint

    if (reservationId === 'latest') {
      // Obtener la última reservación
      const lastReservation = await prisma.reservation.findFirst({
        orderBy: { createdAt: 'desc' },
        select: { id: true, confirmationNumber: true }
      })

      if (!lastReservation) {
        return NextResponse.json({ 
          error: 'No hay reservaciones en el sistema' 
        }, { status: 404 })
      }

      targetReservationId = lastReservation.id
      console.log('📋 Using latest reservation:', lastReservation.confirmationNumber)
    } else {
      targetReservationId = BigInt(reservationId)
    }

    console.log('📧 Triggering reservation notifications for ID:', targetReservationId.toString())
    const result = await onReservationCreated(targetReservationId)

    return NextResponse.json({
      success: true,
      message: `Notificaciones enviadas exitosamente para reservación ${targetReservationId}`,
      reservationId: targetReservationId.toString(),
      result
    })

  } catch (error) {
    console.error('❌ Error in GET trigger:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { type, id } = body

    console.log('🔔 Manual trigger request:', { type, id })

    if (!type || !id) {
      return NextResponse.json({ 
        error: 'Tipo y ID son requeridos',
        usage: 'POST { "type": "reservation" | "payment", "id": "123" }'
      }, { status: 400 })
    }

    let result
    
    if (type === 'reservation') {
      console.log('📧 Triggering reservation notifications for ID:', id)
      result = await onReservationCreated(BigInt(id))
    } else if (type === 'payment') {
      console.log('💳 Triggering payment notifications for ID:', id)
      result = await onPaymentConfirmed(BigInt(id))
    } else {
      return NextResponse.json({ 
        error: 'Tipo no válido. Use "reservation" o "payment"' 
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: `Notificaciones enviadas exitosamente para ${type} ${id}`,
      result
    })

  } catch (error) {
    console.error('❌ Error in manual trigger:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
