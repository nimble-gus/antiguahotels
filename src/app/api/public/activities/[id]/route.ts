import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`🎯 Fetching activity ${params.id}...`)
    
    const activityId = BigInt(params.id)

    // Obtener actividad básica
    const activity = await prisma.activity.findUnique({
      where: {
        id: activityId,
        isActive: true
      },
      include: {
        activitySchedules: {
          where: {
            date: { gte: new Date() },
            availableSpots: { gt: 0 }
          },
          orderBy: [
            { date: 'asc' },
            { startTime: 'asc' }
          ]
        }
      }
    })

    if (!activity) {
      return NextResponse.json(
        { error: 'Actividad no encontrada' },
        { status: 404 }
      )
    }

    // Obtener imágenes por separado
    const entityImages = await prisma.entityImage.findMany({
      where: {
        entityType: 'ACTIVITY',
        entityId: activityId
      },
      orderBy: [
        { isPrimary: 'desc' },
        { displayOrder: 'asc' }
      ]
    })

    // Obtener amenidades por separado
    const entityAmenities = await prisma.entityAmenity.findMany({
      where: {
        entityType: 'ACTIVITY',
        entityId: activityId
      },
      include: {
        amenity: true
      }
    })

    // Formatear imágenes
    const images = entityImages.length > 0 
      ? entityImages.map(img => ({
          id: img.id.toString(),
          imageUrl: img.imageUrl,
          altText: img.altText || activity.name,
          isPrimary: img.isPrimary,
          displayOrder: img.displayOrder
        }))
      : [{
          id: 'placeholder',
          imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
          altText: activity.name,
          isPrimary: true,
          displayOrder: 0
        }]

    // Formatear horarios
    const schedules = activity.activitySchedules.map(schedule => ({
      id: schedule.id.toString(),
      startTime: schedule.startTime.toISOString().split('T')[1].substring(0, 5),
      endTime: schedule.endTime.toISOString().split('T')[1].substring(0, 5),
      date: schedule.date.toISOString().split('T')[0],
      availableSpots: schedule.availableSpots,
      maxSpots: schedule.maxSpots
    }))

    // Formatear amenidades
    const amenities = entityAmenities.map(ea => ({
      name: ea.amenity.name,
      icon: ea.amenity.icon,
      description: ea.amenity.description
    }))

    // Formatear datos para el frontend
    const formattedActivity = {
      id: activity.id.toString(),
      name: activity.name,
      description: activity.description || activity.shortDescription || '',
      shortDescription: activity.shortDescription || '',
      basePrice: parseFloat(activity.basePrice.toString()),
      currency: activity.currency,
      duration: activity.durationHours ? Math.round(parseFloat(activity.durationHours.toString()) * 60) : 0,
      durationHours: activity.durationHours ? parseFloat(activity.durationHours.toString()) : null,
      minParticipants: Number(activity.minParticipants),
      maxParticipants: activity.maxParticipants ? Number(activity.maxParticipants) : null,
      ageRestriction: activity.ageRestriction,
      difficulty: activity.difficultyLevel || 'moderate',
      location: activity.location || 'Antigua Guatemala',
      meetingPoint: activity.meetingPoint,
      whatIncludes: activity.whatIncludes,
      whatToBring: activity.whatToBring,
      cancellationPolicy: activity.cancellationPolicy,
      isActive: activity.isActive,
      isFeatured: activity.isFeatured,
      images,
      schedules,
      amenities
    }

    console.log(`✅ Found activity: ${formattedActivity.name}`)

    return NextResponse.json(formattedActivity)

  } catch (error) {
    console.error('❌ Error fetching activity:', error)
    return NextResponse.json(
      { 
        error: 'Error obteniendo actividad',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}