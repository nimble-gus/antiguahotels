import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const roomId = params.id

    const room = await prisma.room.findUnique({
      where: {
        id: BigInt(roomId)
      },
      include: {
        hotel: {
          select: {
            id: true,
            name: true,
            code: true,
            city: true,
            address: true,
            phone: true,
            email: true,
            logoUrl: true,
            checkInTime: true,
            checkOutTime: true,
          }
        },
        roomType: {
          select: {
            id: true,
            name: true,
            baseRate: true,
            occupancy: true,
            maxAdults: true,
            maxChildren: true,
            bedConfiguration: true,
            description: true,
          }
        }
      }
    })

    if (!room) {
      return NextResponse.json(
        { error: 'Habitación no encontrada' },
        { status: 404 }
      )
    }

    // Obtener amenidades de la habitación usando SQL directo
    let roomAmenities = []
    try {
      roomAmenities = await prisma.$queryRaw<any[]>`
        SELECT 
          a.id as amenity_id,
          a.name as amenity_name,
          a.icon as amenity_icon,
          a.category as amenity_category
        FROM entity_amenities ea
        JOIN amenities a ON ea.amenity_id = a.id
        WHERE ea.entity_type = 'ROOM' 
        AND ea.entity_id = ${roomId}
        ORDER BY a.name
      `
      console.log('✅ Room amenities found:', roomAmenities.length)
    } catch (amenityError) {
      console.error('Error fetching room amenities:', amenityError)
    }

    // Obtener imágenes del tipo de habitación
    let roomTypeImages = []
    try {
      roomTypeImages = await prisma.$queryRaw<any[]>`
        SELECT 
          ei.id as image_id,
          ei.image_url as imageUrl,
          ei.alt_text as altText,
          ei.is_primary as isPrimary,
          ei.display_order as displayOrder
        FROM entity_images ei
        WHERE ei.entity_type = 'ROOM_TYPE' 
        AND ei.entity_id = ${room.roomTypeId.toString()}
        ORDER BY ei.display_order, ei.created_at
      `
      console.log('✅ Room type images found:', roomTypeImages.length)
    } catch (imageError) {
      console.error('Error fetching room type images:', imageError)
    }

    // Serializar BigInt y agregar amenidades e imágenes
    const serializedRoom = {
      ...room,
      id: room.id.toString(),
      hotelId: room.hotelId.toString(),
      roomTypeId: room.roomTypeId.toString(),
      createdAt: room.createdAt.toISOString(),
      updatedAt: room.updatedAt.toISOString(),
      hotel: {
        ...room.hotel,
        id: room.hotel.id.toString(),
        checkInTime: room.hotel.checkInTime?.toString() || null,
        checkOutTime: room.hotel.checkOutTime?.toString() || null,
      },
      roomType: {
        ...room.roomType,
        id: room.roomType.id.toString(),
        baseRate: room.roomType.baseRate.toString(),
        imageUrl: roomTypeImages.find(img => img.isPrimary)?.imageUrl || roomTypeImages[0]?.imageUrl || null,
        images: roomTypeImages.map((image: any) => ({
          id: image.image_id.toString(),
          imageUrl: image.imageUrl,
          altText: image.altText,
          isPrimary: Boolean(image.isPrimary),
          displayOrder: image.displayOrder
        }))
      },
      amenities: roomAmenities.map((amenity: any) => ({
        id: amenity.amenity_id.toString(),
        name: amenity.amenity_name,
        icon: amenity.amenity_icon,
        category: amenity.amenity_category
      }))
    }

    return NextResponse.json(serializedRoom)

  } catch (error) {
    console.error('Error fetching room:', error)
    return NextResponse.json(
      { error: 'Error obteniendo habitación' },
      { status: 500 }
    )
  }
}



