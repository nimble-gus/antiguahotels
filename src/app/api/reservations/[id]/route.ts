import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const reservationId = params.id

    const reservation = await prisma.reservation.findUnique({
      where: { id: BigInt(reservationId) },
      include: {
        guest: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            country: true,
          }
        },
        reservationItems: {
          include: {
            accommodationStay: {
              include: {
                hotel: {
                  select: {
                    name: true,
                    code: true,
                  }
                },
                roomType: {
                  select: {
                    name: true,
                  }
                },
                assignedRoom: {
                  select: {
                    code: true,
                  }
                }
              }
            },
            activityBooking: {
              include: {
                activity: {
                  select: {
                    name: true,
                  }
                }
              }
            }
          }
        },
        payments: true,
      }
    })

    if (!reservation) {
      return NextResponse.json(
        { error: 'Reservación no encontrada' },
        { status: 404 }
      )
    }

    // Serializar BigInt y fechas
    const serializedReservation = {
      ...reservation,
      id: reservation.id.toString(),
      guestId: reservation.guestId.toString(),
      totalAmount: reservation.totalAmount.toString(),
      createdAt: reservation.createdAt.toISOString(),
      updatedAt: reservation.updatedAt.toISOString(),
      checkin: reservation.checkin?.toISOString(),
      checkout: reservation.checkout?.toISOString(),
      reservationItems: reservation.reservationItems.map(item => ({
        ...item,
        id: item.id.toString(),
        reservationId: item.reservationId.toString(),
        unitPrice: item.unitPrice.toString(),
        amount: item.amount.toString(),
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
        accommodationStay: item.accommodationStay ? {
          ...item.accommodationStay,
          id: item.accommodationStay.id.toString(),
          reservationItemId: item.accommodationStay.reservationItemId.toString(),
          hotelId: item.accommodationStay.hotelId.toString(),
          roomTypeId: item.accommodationStay.roomTypeId.toString(),
          assignedRoomId: item.accommodationStay.assignedRoomId?.toString(),
          checkInDate: item.accommodationStay.checkInDate.toISOString(),
          checkOutDate: item.accommodationStay.checkOutDate.toISOString(),
          createdAt: item.accommodationStay.createdAt.toISOString(),
        } : null,
        activityBooking: item.activityBooking ? {
          ...item.activityBooking,
          id: item.activityBooking.id.toString(),
          reservationItemId: item.activityBooking.reservationItemId.toString(),
          activityId: item.activityBooking.activityId.toString(),
          scheduleId: item.activityBooking.scheduleId?.toString(),
          activityDate: item.activityBooking.activityDate.toISOString(),
          startTime: item.activityBooking.startTime.toISOString(),
          createdAt: item.activityBooking.createdAt.toISOString(),
        } : null,
      })),
      payments: reservation.payments.map(payment => ({
        ...payment,
        id: payment.id.toString(),
        reservationId: payment.reservationId.toString(),
        amount: payment.amount.toString(),
        createdAt: payment.createdAt.toISOString(),
        updatedAt: payment.updatedAt.toISOString(),
        processedAt: payment.processedAt?.toISOString(),
      }))
    }

    return NextResponse.json(serializedReservation)

  } catch (error) {
    console.error('Error fetching reservation:', error)
    return NextResponse.json(
      { error: 'Error obteniendo reservación' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const reservationId = params.id
    console.log('🗑️ Deleting reservation:', reservationId)

    // Verificar que la reservación existe
    const reservation = await prisma.reservation.findUnique({
      where: { id: BigInt(reservationId) },
      include: {
        reservationItems: {
          include: {
            accommodationStay: true
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

    // Verificar si se puede eliminar (no está confirmada)
    if (reservation.status === 'CONFIRMED') {
      return NextResponse.json(
        { error: 'No se puede eliminar una reservación confirmada. Cámbiala a CANCELLED primero.' },
        { status: 400 }
      )
    }

    // Eliminar en transacción
    await prisma.$transaction(async (tx) => {
      // Liberar inventario de habitaciones
      for (const item of reservation.reservationItems) {
        if (item.accommodationStay) {
          await tx.roomInventory.deleteMany({
            where: {
              reservationItemId: item.id
            }
          })
          console.log(`🔓 Freed room inventory for item ${item.id}`)
        }
      }

      // Eliminar accommodation stays
      await tx.accommodationStay.deleteMany({
        where: {
          reservationItemId: {
            in: reservation.reservationItems.map(item => item.id)
          }
        }
      })

      // Eliminar activity bookings
      await tx.activityBooking.deleteMany({
        where: {
          reservationItemId: {
            in: reservation.reservationItems.map(item => item.id)
          }
        }
      })

      // Eliminar package bookings
      await tx.packageBooking.deleteMany({
        where: {
          reservationItemId: {
            in: reservation.reservationItems.map(item => item.id)
          }
        }
      })

      // Eliminar shuttle transfers
      await tx.shuttleTransfer.deleteMany({
        where: {
          reservationItemId: {
            in: reservation.reservationItems.map(item => item.id)
          }
        }
      })

      // Eliminar reservation items
      await tx.reservationItem.deleteMany({
        where: {
          reservationId: reservation.id
        }
      })

      // Eliminar payments
      await tx.payment.deleteMany({
        where: {
          reservationId: reservation.id
        }
      })

      // Finalmente eliminar la reservación
      await tx.reservation.delete({
        where: { id: reservation.id }
      })

      console.log(`✅ Reservation ${reservation.confirmationNumber} deleted successfully`)
    })

    return NextResponse.json({
      success: true,
      message: 'Reservación eliminada exitosamente'
    })

  } catch (error) {
    console.error('Error deleting reservation:', error)
    return NextResponse.json(
      { error: 'Error eliminando reservación' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const reservationId = params.id
    const body = await request.json()

    console.log('✏️ Updating reservation:', reservationId, body)

    // Verificar que la reservación existe
    const existingReservation = await prisma.reservation.findUnique({
      where: { id: BigInt(reservationId) }
    })

    if (!existingReservation) {
      return NextResponse.json(
        { error: 'Reservación no encontrada' },
        { status: 404 }
      )
    }

    // Actualizar solo campos permitidos
    const updateData: any = {}
    
    if (body.status !== undefined) updateData.status = body.status
    if (body.specialRequests !== undefined) updateData.specialRequests = body.specialRequests
    if (body.notes !== undefined) updateData.notes = body.notes

    const updatedReservation = await prisma.reservation.update({
      where: { id: BigInt(reservationId) },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      reservation: {
        ...updatedReservation,
        id: updatedReservation.id.toString(),
        guestId: updatedReservation.guestId.toString(),
        totalAmount: updatedReservation.totalAmount.toString(),
        createdAt: updatedReservation.createdAt.toISOString(),
        updatedAt: updatedReservation.updatedAt.toISOString(),
        checkin: updatedReservation.checkin?.toISOString(),
        checkout: updatedReservation.checkout?.toISOString(),
      },
      message: 'Reservación actualizada exitosamente'
    })

  } catch (error) {
    console.error('Error updating reservation:', error)
    return NextResponse.json(
      { error: 'Error actualizando reservación' },
      { status: 500 }
    )
  }
}








