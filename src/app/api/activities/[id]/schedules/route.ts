import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const activityId = params.id

    const schedules = await prisma.activitySchedule.findMany({
      where: {
        activityId: BigInt(activityId)
      },
      include: {
        _count: {
          select: {
            activityBookings: true
          }
        }
      },
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' }
      ]
    })

    // Serializar BigInt y Decimal
    const serializedSchedules = schedules.map(schedule => ({
      ...schedule,
      id: schedule.id.toString(),
      activityId: schedule.activityId.toString(),
      date: schedule.date.toISOString().split('T')[0],
      startTime: schedule.startTime.toISOString().substring(11, 19),
      endTime: schedule.endTime.toISOString().substring(11, 19),
      priceOverride: schedule.priceOverride?.toString(),
      createdAt: schedule.createdAt.toISOString(),
      updatedAt: schedule.updatedAt.toISOString(),
    }))

    return NextResponse.json(serializedSchedules)

  } catch (error) {
    console.error('Error fetching activity schedules:', error)
    return NextResponse.json(
      { error: 'Error obteniendo horarios' },
      { status: 500 }
    )
  }
}

export async function POST(
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

    const activityId = params.id
    const body = await request.json()
    const {
      date,
      startTime,
      endTime,
      availableSpots,
      priceOverride,
      isActive
    } = body

    // Validaciones
    if (!date || !startTime || !endTime || !availableSpots) {
      return NextResponse.json(
        { error: 'Fecha, horarios y cupos son requeridos' },
        { status: 400 }
      )
    }

    // Verificar que la fecha no sea en el pasado
    const scheduleDate = new Date(date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (scheduleDate < today) {
      return NextResponse.json(
        { error: 'No se pueden programar horarios en fechas pasadas' },
        { status: 400 }
      )
    }

    // Verificar que la hora de fin sea posterior a la de inicio
    if (startTime >= endTime) {
      return NextResponse.json(
        { error: 'La hora de finalización debe ser posterior a la de inicio' },
        { status: 400 }
      )
    }

    // Verificar que no haya conflicto de horarios
    const conflictingSchedule = await prisma.activitySchedule.findFirst({
      where: {
        activityId: BigInt(activityId),
        date: new Date(date),
        OR: [
          {
            AND: [
              { startTime: { lte: new Date(`1970-01-01T${startTime}:00`) } },
              { endTime: { gt: new Date(`1970-01-01T${startTime}:00`) } }
            ]
          },
          {
            AND: [
              { startTime: { lt: new Date(`1970-01-01T${endTime}:00`) } },
              { endTime: { gte: new Date(`1970-01-01T${endTime}:00`) } }
            ]
          }
        ]
      }
    })

    if (conflictingSchedule) {
      return NextResponse.json(
        { error: 'Ya existe un horario que se superpone con este tiempo' },
        { status: 409 }
      )
    }

    // Crear horario
    const schedule = await prisma.activitySchedule.create({
      data: {
        activityId: BigInt(activityId),
        date: new Date(date),
        startTime: new Date(`1970-01-01T${startTime}:00`),
        endTime: new Date(`1970-01-01T${endTime}:00`),
        availableSpots: parseInt(availableSpots),
        priceOverride: priceOverride ? parseFloat(priceOverride) : null,
        isActive: isActive ?? true,
      },
      include: {
        _count: {
          select: {
            activityBookings: true
          }
        }
      }
    })

    // Serializar respuesta
    const serializedSchedule = {
      ...schedule,
      id: schedule.id.toString(),
      activityId: schedule.activityId.toString(),
      date: schedule.date.toISOString().split('T')[0],
      startTime: schedule.startTime.toISOString().substring(11, 19),
      endTime: schedule.endTime.toISOString().substring(11, 19),
      priceOverride: schedule.priceOverride?.toString(),
      createdAt: schedule.createdAt.toISOString(),
      updatedAt: schedule.updatedAt.toISOString(),
    }

    return NextResponse.json(serializedSchedule)

  } catch (error) {
    console.error('Error creating activity schedule:', error)
    return NextResponse.json(
      { error: 'Error creando horario' },
      { status: 500 }
    )
  }
}

export async function PUT(
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

    const activityId = params.id
    const { searchParams } = new URL(request.url)
    const scheduleId = searchParams.get('id')
    const body = await request.json()

    if (!scheduleId) {
      return NextResponse.json(
        { error: 'ID de horario requerido' },
        { status: 400 }
      )
    }

    const {
      date,
      startTime,
      endTime,
      availableSpots,
      priceOverride,
      isActive
    } = body

    // Validaciones
    if (!date || !startTime || !endTime || !availableSpots) {
      return NextResponse.json(
        { error: 'Fecha, horarios y cupos son requeridos' },
        { status: 400 }
      )
    }

    // Verificar que la hora de fin sea posterior a la de inicio
    if (startTime >= endTime) {
      return NextResponse.json(
        { error: 'La hora de finalización debe ser posterior a la de inicio' },
        { status: 400 }
      )
    }

    // Verificar que no se reduzcan los cupos por debajo de las reservaciones existentes
    const existingBookings = await prisma.activityBooking.count({
      where: { scheduleId: BigInt(scheduleId) }
    })

    if (parseInt(availableSpots) < existingBookings) {
      return NextResponse.json(
        { error: `No se pueden reducir los cupos a menos de ${existingBookings} (reservaciones existentes)` },
        { status: 400 }
      )
    }

    // Actualizar horario
    const schedule = await prisma.activitySchedule.update({
      where: { id: BigInt(scheduleId) },
      data: {
        date: new Date(date),
        startTime: new Date(`1970-01-01T${startTime}:00`),
        endTime: new Date(`1970-01-01T${endTime}:00`),
        availableSpots: parseInt(availableSpots),
        priceOverride: priceOverride ? parseFloat(priceOverride) : null,
        isActive: isActive ?? true,
      },
      include: {
        _count: {
          select: {
            activityBookings: true
          }
        }
      }
    })

    // Serializar respuesta
    const serializedSchedule = {
      ...schedule,
      id: schedule.id.toString(),
      activityId: schedule.activityId.toString(),
      date: schedule.date.toISOString().split('T')[0],
      startTime: schedule.startTime.toISOString().substring(11, 19),
      endTime: schedule.endTime.toISOString().substring(11, 19),
      priceOverride: schedule.priceOverride?.toString(),
      createdAt: schedule.createdAt.toISOString(),
      updatedAt: schedule.updatedAt.toISOString(),
    }

    return NextResponse.json(serializedSchedule)

  } catch (error) {
    console.error('Error updating activity schedule:', error)
    return NextResponse.json(
      { error: 'Error actualizando horario' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    const { searchParams } = new URL(request.url)
    const scheduleId = searchParams.get('id')

    if (!scheduleId) {
      return NextResponse.json(
        { error: 'ID de horario requerido' },
        { status: 400 }
      )
    }

    // Verificar si el horario tiene reservaciones
    const bookingsCount = await prisma.activityBooking.count({
      where: { scheduleId: BigInt(scheduleId) }
    })

    if (bookingsCount > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar un horario que tiene reservaciones' },
        { status: 400 }
      )
    }

    // Eliminar horario
    await prisma.activitySchedule.delete({
      where: { id: BigInt(scheduleId) }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error deleting activity schedule:', error)
    return NextResponse.json(
      { error: 'Error eliminando horario' },
      { status: 500 }
    )
  }
}