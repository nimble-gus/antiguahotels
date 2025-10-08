import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { onReservationCreated } from '@/lib/notifications/triggers'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const reservationId = searchParams.get('reservationId')

    if (!reservationId) {
      return NextResponse.json({ error: 'reservationId requerido' }, { status: 400 })
    }

    console.log('🧪 Debug: Testing trigger for reservation:', reservationId)

    try {
      // Verificar que la reservación existe
      const reservation = await prisma.reservation.findUnique({
        where: { id: BigInt(reservationId) },
        include: {
          guest: {
            select: { firstName: true, lastName: true, email: true }
          }
        }
      })

      if (!reservation) {
        return NextResponse.json({ 
          success: false, 
          error: 'Reservación no encontrada',
          reservationId 
        })
      }

      console.log('✅ Reservation found:', {
        id: reservation.id.toString(),
        confirmationNumber: reservation.confirmationNumber,
        guestEmail: reservation.guest.email
      })

      // Ejecutar el trigger manualmente
      const result = await onReservationCreated(BigInt(reservationId))

      return NextResponse.json({
        success: true,
        message: 'Trigger ejecutado exitosamente',
        reservationId,
        reservationData: {
          confirmationNumber: reservation.confirmationNumber,
          guestName: `${reservation.guest.firstName} ${reservation.guest.lastName}`,
          guestEmail: reservation.guest.email
        },
        triggerResult: result
      })

    } catch (triggerError) {
      console.error('❌ Error executing trigger:', triggerError)
      return NextResponse.json({
        success: false,
        error: triggerError instanceof Error ? triggerError.message : 'Unknown trigger error',
        stack: triggerError instanceof Error ? triggerError.stack : undefined
      })
    }

  } catch (error) {
    console.error('Error in debug trigger:', error)
    return NextResponse.json(
      { error: 'Error ejecutando debug trigger' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Obtener la última reservación creada
    const lastReservation = await prisma.reservation.findFirst({
      orderBy: { createdAt: 'desc' },
      include: {
        guest: {
          select: { firstName: true, lastName: true, email: true }
        }
      }
    })

    if (!lastReservation) {
      return NextResponse.json({ 
        success: false, 
        error: 'No hay reservaciones en el sistema' 
      })
    }

    console.log('🧪 Testing trigger with last reservation:', lastReservation.id.toString())

    try {
      const result = await onReservationCreated(lastReservation.id)

      return NextResponse.json({
        success: true,
        message: 'Trigger ejecutado para la última reservación',
        reservation: {
          id: lastReservation.id.toString(),
          confirmationNumber: lastReservation.confirmationNumber,
          guestName: `${lastReservation.guest.firstName} ${lastReservation.guest.lastName}`,
          guestEmail: lastReservation.guest.email,
          createdAt: lastReservation.createdAt.toISOString()
        },
        triggerResult: result
      })

    } catch (triggerError) {
      console.error('❌ Error executing trigger:', triggerError)
      return NextResponse.json({
        success: false,
        error: triggerError instanceof Error ? triggerError.message : 'Unknown trigger error',
        details: triggerError instanceof Error ? triggerError.stack : undefined
      })
    }

  } catch (error) {
    console.error('Error in POST debug trigger:', error)
    return NextResponse.json(
      { error: 'Error ejecutando debug trigger' },
      { status: 500 }
    )
  }
}





