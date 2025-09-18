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
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const packageId = params.id

    console.log('📦 Fetching package with ID:', packageId)

    const pkg = await prisma.package.findUnique({
      where: {
        id: BigInt(packageId)
      },
      include: {
        packageHotels: {
          include: {
            hotel: true,
            roomType: true
          }
        },
        packageActivities: {
          include: {
            activity: true
          }
        },
        _count: {
          select: {
            packageBookings: true,
            packageSessions: true
          }
        }
      }
    })

    if (!pkg) {
      return NextResponse.json({ error: 'Paquete no encontrado' }, { status: 404 })
    }

    console.log('✅ Package found:', pkg.name)

    // Serializar BigInt y Decimal
    const serializedPackage = {
      ...pkg,
      id: pkg.id.toString(),
      basePrice: pkg.basePrice.toString(),
      createdAt: pkg.createdAt.toISOString(),
      updatedAt: pkg.updatedAt.toISOString(),
      packageHotels: pkg.packageHotels.map(ph => ({
        ...ph,
        id: ph.id.toString(),
        packageId: ph.packageId.toString(),
        hotelId: ph.hotelId.toString(),
        roomTypeId: ph.roomTypeId.toString(),
        createdAt: ph.createdAt.toISOString(),
        hotel: {
          ...ph.hotel,
          id: ph.hotel.id.toString(),
          createdAt: ph.hotel.createdAt.toISOString(),
          updatedAt: ph.hotel.updatedAt.toISOString()
        },
        roomType: {
          ...ph.roomType,
          id: ph.roomType.id.toString(),
          hotelId: ph.roomType.hotelId.toString(),
          baseRate: ph.roomType.baseRate.toString(),
          createdAt: ph.roomType.createdAt.toISOString(),
          updatedAt: ph.roomType.updatedAt.toISOString()
        }
      })),
      packageActivities: pkg.packageActivities.map(pa => ({
        ...pa,
        id: pa.id.toString(),
        packageId: pa.packageId.toString(),
        activityId: pa.activityId.toString(),
        createdAt: pa.createdAt.toISOString(),
        activity: {
          ...pa.activity,
          id: pa.activity.id.toString(),
          basePrice: pa.activity.basePrice.toString(),
          createdAt: pa.activity.createdAt.toISOString(),
          updatedAt: pa.activity.updatedAt.toISOString()
        }
      }))
    }

    return NextResponse.json(serializedPackage)

  } catch (error) {
    console.error('Error fetching package:', error)
    return NextResponse.json(
      { error: 'Error obteniendo paquete' },
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
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const packageId = params.id
    const body = await request.json()

    console.log('📦 Updating package with ID:', packageId)
    console.log('📝 Update data:', body)

    const {
      name,
      description,
      shortDescription,
      durationDays,
      durationNights,
      minParticipants,
      maxParticipants,
      basePrice,
      currency,
      capacity,
      whatIncludes,
      whatExcludes,
      itinerary,
      isActive,
      hotels, // Array de hoteles con { hotelId, roomTypeId, nights, checkInDay }
      activities // Array de actividades con { activityId, dayNumber, participantsIncluded }
    } = body

    // Validaciones básicas
    if (!name || !basePrice) {
      return NextResponse.json(
        { error: 'Nombre y precio base son requeridos' },
        { status: 400 }
      )
    }

    const result = await prisma.$transaction(async (tx) => {
      // Actualizar el paquete
      const updatedPackage = await tx.package.update({
        where: {
          id: BigInt(packageId)
        },
        data: {
          name,
          description,
          shortDescription,
          durationDays: parseInt(durationDays),
          durationNights: parseInt(durationNights),
          minParticipants: parseInt(minParticipants) || 1,
          maxParticipants: maxParticipants ? parseInt(maxParticipants) : null,
          basePrice: parseFloat(basePrice),
          currency: currency || 'USD',
          capacity: capacity ? parseInt(capacity) : null,
          whatIncludes,
          whatExcludes,
          itinerary,
          active: isActive !== false,
        }
      })

      // Eliminar hoteles existentes y agregar nuevos
      if (hotels && Array.isArray(hotels)) {
        await tx.packageHotel.deleteMany({
          where: { packageId: BigInt(packageId) }
        })

        for (const hotel of hotels) {
          await tx.packageHotel.create({
            data: {
              packageId: BigInt(packageId),
              hotelId: BigInt(hotel.hotelId),
              roomTypeId: BigInt(hotel.roomTypeId),
              nights: parseInt(hotel.nights),
              checkInDay: parseInt(hotel.checkInDay)
            }
          })
        }
      }

      // Eliminar actividades existentes y agregar nuevas
      if (activities && Array.isArray(activities)) {
        await tx.packageActivity.deleteMany({
          where: { packageId: BigInt(packageId) }
        })

        for (const activity of activities) {
          await tx.packageActivity.create({
            data: {
              packageId: BigInt(packageId),
              activityId: BigInt(activity.activityId),
              dayNumber: parseInt(activity.dayNumber),
              participantsIncluded: activity.participantsIncluded ? parseInt(activity.participantsIncluded) : null
            }
          })
        }
      }

      return updatedPackage
    })

    console.log('✅ Package updated successfully:', result.name)

    return NextResponse.json({
      success: true,
      package: {
        ...result,
        id: result.id.toString(),
        basePrice: result.basePrice.toString(),
        createdAt: result.createdAt.toISOString(),
        updatedAt: result.updatedAt.toISOString(),
      },
      message: 'Paquete actualizado exitosamente'
    })

  } catch (error) {
    console.error('Error updating package:', error)
    return NextResponse.json(
      { error: 'Error actualizando paquete' },
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
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const packageId = params.id

    console.log('📦 Deleting package with ID:', packageId)

    // Verificar si el paquete tiene reservaciones activas
    const activeBookings = await prisma.packageBooking.count({
      where: {
        packageId: BigInt(packageId)
      }
    })

    if (activeBookings > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar un paquete con reservaciones activas' },
        { status: 400 }
      )
    }

    await prisma.$transaction(async (tx) => {
      // Eliminar hoteles del paquete
      await tx.packageHotel.deleteMany({
        where: { packageId: BigInt(packageId) }
      })

      // Eliminar actividades del paquete
      await tx.packageActivity.deleteMany({
        where: { packageId: BigInt(packageId) }
      })

      // Eliminar sesiones del paquete
      await tx.packageSession.deleteMany({
        where: { packageId: BigInt(packageId) }
      })

      // Finalmente eliminar el paquete
      await tx.package.delete({
        where: { id: BigInt(packageId) }
      })
    })

    console.log('✅ Package deleted successfully')

    return NextResponse.json({
      success: true,
      message: 'Paquete eliminado exitosamente'
    })

  } catch (error) {
    console.error('Error deleting package:', error)
    return NextResponse.json(
      { error: 'Error eliminando paquete' },
      { status: 500 }
    )
  }
}