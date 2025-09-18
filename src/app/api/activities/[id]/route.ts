import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const activityId = params.id

    const activity = await prisma.activity.findUnique({
      where: {
        id: BigInt(activityId)
      },
      include: {
        _count: {
          select: {
            activitySchedules: true,
            activityBookings: true,
          }
        }
      }
    })

    if (!activity) {
      return NextResponse.json(
        { error: 'Actividad no encontrada' },
        { status: 404 }
      )
    }

    // Serializar BigInt y Decimal
    const serializedActivity = {
      ...activity,
      id: activity.id.toString(),
      basePrice: activity.basePrice.toString(),
      durationHours: activity.durationHours?.toString(),
      createdAt: activity.createdAt.toISOString(),
      updatedAt: activity.updatedAt.toISOString(),
    }

    return NextResponse.json(serializedActivity)

  } catch (error) {
    console.error('Error fetching activity:', error)
    return NextResponse.json(
      { error: 'Error obteniendo actividad' },
      { status: 500 }
    )
  }
}
