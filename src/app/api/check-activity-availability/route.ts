import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { scheduleId, participants } = await request.json()

    if (!scheduleId || !participants) {
      return NextResponse.json(
        { error: 'scheduleId y participants son requeridos' },
        { status: 400 }
      )
    }

    // Obtener el horario con información de disponibilidad
    const schedule = await prisma.activitySchedule.findUnique({
      where: { id: BigInt(scheduleId) },
      include: {
        activity: {
          select: {
            name: true,
            minParticipants: true,
            maxParticipants: true
          }
        }
      }
    })

    if (!schedule) {
      return NextResponse.json(
        { error: 'Horario no encontrado' },
        { status: 404 }
      )
    }

    // Verificar disponibilidad
    const availableSpots = schedule.availableSpots
    const isAvailable = availableSpots >= participants

    // Verificar límites de la actividad
    const withinMinLimit = participants >= schedule.activity.minParticipants
    const withinMaxLimit = !schedule.activity.maxParticipants || participants <= schedule.activity.maxParticipants

    return NextResponse.json({
      available: isAvailable && withinMinLimit && withinMaxLimit,
      availableSpots,
      requestedParticipants: participants,
      canAccommodate: availableSpots >= participants,
      withinLimits: withinMinLimit && withinMaxLimit,
      minParticipants: schedule.activity.minParticipants,
      maxParticipants: schedule.activity.maxParticipants,
      message: !isAvailable 
        ? `Solo hay ${availableSpots} lugares disponibles`
        : !withinMinLimit
        ? `Mínimo ${schedule.activity.minParticipants} participantes requeridos`
        : !withinMaxLimit
        ? `Máximo ${schedule.activity.maxParticipants} participantes permitidos`
        : 'Disponible'
    })

  } catch (error) {
    console.error('Error checking activity availability:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
