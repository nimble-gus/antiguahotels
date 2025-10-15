import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`🎯 Fetching package ${params.id}...`)
    
    const packageId = BigInt(params.id)

    // Obtener paquete básico
    const packageData = await prisma.package.findUnique({
      where: {
        id: packageId,
        active: true
      }
    })

    if (!packageData) {
      return NextResponse.json(
        { error: 'Paquete no encontrado' },
        { status: 404 }
      )
    }

    // Obtener imágenes por separado
    const entityImages = await prisma.entityImage.findMany({
      where: {
        entityType: 'PACKAGE',
        entityId: packageId
      },
      orderBy: [
        { isPrimary: 'desc' },
        { displayOrder: 'asc' }
      ]
    })

    // Obtener hoteles del paquete
    const packageHotels = await prisma.packageHotel.findMany({
      where: {
        packageId: packageId
      },
      include: {
        hotel: true,
        roomType: true
      },
      orderBy: {
        checkInDay: 'asc'
      }
    })

    // Obtener actividades del paquete
    const packageActivities = await prisma.packageActivity.findMany({
      where: {
        packageId: packageId
      },
      include: {
        activity: true
      },
      orderBy: {
        dayNumber: 'asc'
      }
    })

    // Obtener sesiones disponibles del paquete
    const packageSessions = await prisma.packageSession.findMany({
      where: {
        packageId: packageId,
        isActive: true,
        startTs: { gte: new Date() }
      },
      orderBy: {
        startTs: 'asc'
      }
    })

    // Formatear imágenes
    const images = entityImages.length > 0 
      ? entityImages.map(img => ({
          id: img.id.toString(),
          imageUrl: img.imageUrl,
          altText: img.altText || packageData.name,
          isPrimary: img.isPrimary,
          displayOrder: img.displayOrder
        }))
      : [{
          id: 'placeholder',
          imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
          altText: packageData.name,
          isPrimary: true,
          displayOrder: 0
        }]

    // Formatear hoteles
    const hotels = packageHotels.map(ph => ({
      id: ph.hotel.id.toString(),
      name: ph.hotel.name,
      city: ph.hotel.city,
      address: ph.hotel.address,
      rating: ph.hotel.rating ? parseFloat(ph.hotel.rating.toString()) : null,
      roomType: {
        id: ph.roomType.id.toString(),
        name: ph.roomType.name,
        description: ph.roomType.description,
        maxOccupancy: ph.roomType.maxOccupancy,
        bedConfiguration: ph.roomType.bedConfiguration
      },
      nights: ph.nights,
      checkInDay: ph.checkInDay
    }))

    // Formatear actividades
    const activities = packageActivities.map(pa => ({
      id: pa.activity.id.toString(),
      name: pa.activity.name,
      description: pa.activity.description,
      shortDescription: pa.activity.shortDescription,
      durationHours: pa.activity.durationHours ? parseFloat(pa.activity.durationHours.toString()) : null,
      difficultyLevel: pa.activity.difficultyLevel,
      location: pa.activity.location,
      basePrice: parseFloat(pa.activity.basePrice.toString()),
      currency: pa.activity.currency,
      dayNumber: pa.dayNumber,
      participantsIncluded: pa.participantsIncluded
    }))

    // Formatear sesiones
    const sessions = packageSessions.map(session => ({
      id: session.id.toString(),
      startTs: session.startTs.toISOString(),
      endTs: session.endTs.toISOString(),
      capacity: session.capacity,
      priceOverride: session.priceOverride ? parseFloat(session.priceOverride.toString()) : null,
      isActive: session.isActive
    }))

    // Formatear datos para el frontend
    const formattedPackage = {
      id: packageData.id.toString(),
      name: packageData.name,
      description: packageData.description || packageData.shortDescription || '',
      shortDescription: packageData.shortDescription || '',
      durationDays: Number(packageData.durationDays),
      durationNights: Number(packageData.durationNights),
      minParticipants: Number(packageData.minParticipants),
      maxParticipants: packageData.maxParticipants ? Number(packageData.maxParticipants) : null,
      basePrice: parseFloat(packageData.basePrice.toString()),
      pricePerCouple: packageData.pricePerCouple ? parseFloat(packageData.pricePerCouple.toString()) : null,
      currency: packageData.currency,
      capacity: packageData.capacity ? Number(packageData.capacity) : null,
      whatIncludes: packageData.whatIncludes,
      whatExcludes: packageData.whatExcludes,
      itinerary: packageData.itinerary,
      cancellationPolicy: packageData.cancellationPolicy,
      isActive: packageData.active,
      images,
      hotels,
      activities,
      sessions,
      // Información calculada
      totalDuration: `${Number(packageData.durationDays)} días / ${Number(packageData.durationNights)} noches`,
      priceRange: packageData.pricePerCouple 
        ? `$${parseFloat(packageData.basePrice.toString())} - $${parseFloat(packageData.pricePerCouple.toString())}`
        : `$${parseFloat(packageData.basePrice.toString())}`,
      participants: packageData.maxParticipants 
        ? `${Number(packageData.minParticipants)}-${Number(packageData.maxParticipants)} personas`
        : `${Number(packageData.minParticipants)}+ personas`
    }

    console.log(`✅ Found package: ${formattedPackage.name}`)

    return NextResponse.json(formattedPackage)

  } catch (error) {
    console.error('❌ Error fetching package:', error)
    return NextResponse.json(
      { 
        error: 'Error obteniendo paquete',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}





