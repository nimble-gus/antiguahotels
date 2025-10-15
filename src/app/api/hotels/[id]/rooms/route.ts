import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const hotelId = params.id

    const rooms = await prisma.room.findMany({
      where: {
        hotelId: BigInt(hotelId)
      },
      include: {
        roomType: {
          select: {
            name: true,
            baseRate: true,
            occupancy: true,
            bedConfiguration: true,
            description: true,
          }
        }
      },
      orderBy: [
        { floorNumber: 'asc' },
        { code: 'asc' }
      ]
    })

    // Obtener amenidades para cada habitación usando SQL directo
    let roomAmenities = []
    if (rooms.length > 0) {
      const roomIds = rooms.map(r => r.id.toString()).join(',')
      console.log('🔍 Fetching amenities for rooms:', roomIds)
      
      // Usar FIND_IN_SET para evitar problemas con foreign keys
      roomAmenities = await prisma.$queryRaw<any[]>`
        SELECT 
          ea.entity_id as room_id,
          a.id as amenity_id,
          a.name as amenity_name,
          a.icon as amenity_icon,
          a.category as amenity_category
        FROM entity_amenities ea
        JOIN amenities a ON ea.amenity_id = a.id
        WHERE ea.entity_type = 'ROOM' 
        AND FIND_IN_SET(ea.entity_id, ${roomIds})
      `
      console.log('✅ Room amenities found:', roomAmenities.length)
      console.log('📋 Amenities data:', roomAmenities)
    }

    // Obtener imágenes para cada tipo de habitación
    let roomTypeImages = []
    if (rooms.length > 0) {
      const roomTypeIds = rooms.map(r => r.roomTypeId.toString()).join(',')
      console.log('🖼️ Fetching images for room types:', roomTypeIds)
      
      roomTypeImages = await prisma.$queryRaw<any[]>`
        SELECT 
          ei.entity_id as room_type_id,
          ei.image_url as image_url,
          ei.alt_text as alt_text,
          ei.is_primary as is_primary,
          ei.display_order as display_order
        FROM entity_images ei
        WHERE ei.entity_type = 'ROOM_TYPE' 
        AND FIND_IN_SET(ei.entity_id, ${roomTypeIds})
        ORDER BY ei.entity_id, ei.is_primary DESC, ei.display_order ASC
      `
      console.log('✅ Room type images found:', roomTypeImages.length)
      console.log('📋 Images data:', roomTypeImages)
    }

    // Crear mapa de amenidades por habitación
    const amenitiesMap = new Map()
    if (Array.isArray(roomAmenities)) {
      roomAmenities.forEach((amenity: any) => {
        const roomId = amenity.room_id.toString()
        if (!amenitiesMap.has(roomId)) {
          amenitiesMap.set(roomId, [])
        }
        amenitiesMap.get(roomId).push({
          id: amenity.amenity_id.toString(),
          name: amenity.amenity_name,
          icon: amenity.amenity_icon,
          category: amenity.amenity_category
        })
      })
    }

    // Crear mapa de imágenes por tipo de habitación
    const imagesMap = new Map()
    if (Array.isArray(roomTypeImages)) {
      roomTypeImages.forEach((image: any) => {
        const roomTypeId = image.room_type_id.toString()
        if (!imagesMap.has(roomTypeId)) {
          imagesMap.set(roomTypeId, [])
        }
        imagesMap.get(roomTypeId).push({
          imageUrl: image.image_url,
          altText: image.alt_text,
          isPrimary: Boolean(image.is_primary),
          displayOrder: image.display_order
        })
      })
    }

    // Serializar BigInt y agregar amenidades e imágenes
    const serializedRooms = rooms.map(room => {
      const roomTypeImages = imagesMap.get(room.roomTypeId.toString()) || []
      const primaryImage = roomTypeImages.find((img: any) => img.isPrimary) || roomTypeImages[0]
      
      return {
        ...room,
        id: room.id.toString(),
        hotelId: room.hotelId.toString(),
        roomTypeId: room.roomTypeId.toString(),
        createdAt: room.createdAt.toISOString(),
        updatedAt: room.updatedAt.toISOString(),
        roomType: {
          ...room.roomType,
          baseRate: room.roomType.baseRate.toString(),
          imageUrl: primaryImage?.imageUrl || null,
          images: roomTypeImages
        },
        amenities: amenitiesMap.get(room.id.toString()) || []
      }
    })

    return NextResponse.json(serializedRooms)

  } catch (error) {
    console.error('Error fetching rooms:', error)
    return NextResponse.json(
      { error: 'Error obteniendo habitaciones' },
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

    const hotelId = params.id
    const body = await request.json()
    const {
      roomTypeId,
      code,
      floorNumber,
      isActive = true,
      amenities = []
    } = body

    console.log('🏨 Creating room with data:', {
      hotelId,
      roomTypeId,
      code,
      floorNumber,
      isActive,
      amenities
    })

    // Validaciones
    if (!roomTypeId || !code) {
      return NextResponse.json(
        { error: 'Tipo de habitación y código son requeridos' },
        { status: 400 }
      )
    }

    // Verificar si el código ya existe en este hotel
    const existingRoom = await prisma.room.findFirst({
      where: {
        hotelId: BigInt(hotelId),
        code
      }
    })

    if (existingRoom) {
      return NextResponse.json(
        { error: 'Ya existe una habitación con este código en el hotel' },
        { status: 409 }
      )
    }

    // Crear habitación con transacción para incluir amenidades
    const result = await prisma.$transaction(async (tx) => {
      // Crear habitación
      const room = await tx.room.create({
        data: {
          hotelId: BigInt(hotelId),
          roomTypeId: BigInt(roomTypeId),
          code,
          floorNumber: floorNumber ? parseInt(floorNumber) : null,
          isActive,
        },
        include: {
          roomType: {
            select: {
              name: true,
              baseRate: true,
              occupancy: true,
              bedConfiguration: true,
              description: true,
            }
          }
        }
      })

      // Agregar amenidades si se proporcionaron
      if (amenities.length > 0) {
        console.log('🔧 Adding amenities:', amenities)
        for (const amenityId of amenities) {
          console.log('➕ Adding amenity:', amenityId, 'to room:', room.id.toString())
          await tx.$executeRaw`
            INSERT INTO entity_amenities (entity_type, entity_id, amenity_id, created_at)
            VALUES ('ROOM', ${room.id}, ${BigInt(amenityId)}, NOW())
          `
        }
        console.log('✅ Amenities added successfully')
      }

      return room
    })

    // Serializar respuesta
    const serializedRoom = {
      ...result,
      id: result.id.toString(),
      hotelId: result.hotelId.toString(),
      roomTypeId: result.roomTypeId.toString(),
      createdAt: result.createdAt.toISOString(),
      updatedAt: result.updatedAt.toISOString(),
      roomType: {
        ...result.roomType,
        baseRate: result.roomType.baseRate.toString(),
      }
    }

    return NextResponse.json(serializedRoom)

  } catch (error) {
    console.error('Error creating room:', error)
    return NextResponse.json(
      { error: 'Error creando habitación' },
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

    const hotelId = params.id
    const { searchParams } = new URL(request.url)
    const roomId = searchParams.get('id')
    const body = await request.json()

    if (!roomId) {
      return NextResponse.json(
        { error: 'ID de habitación requerido' },
        { status: 400 }
      )
    }

    const {
      roomTypeId,
      code,
      floorNumber,
      isActive,
      amenities = []
    } = body

    console.log('🔄 Updating room with data:', {
      roomId,
      roomTypeId,
      code,
      floorNumber,
      isActive,
      amenities
    })

    // Validaciones
    if (!roomTypeId || !code) {
      return NextResponse.json(
        { error: 'Tipo de habitación y código son requeridos' },
        { status: 400 }
      )
    }

    // Verificar si el código ya existe en otra habitación del mismo hotel
    const existingRoom = await prisma.room.findFirst({
      where: {
        hotelId: BigInt(hotelId),
        code,
        NOT: { id: BigInt(roomId) }
      }
    })

    if (existingRoom) {
      return NextResponse.json(
        { error: 'Ya existe una habitación con este código en el hotel' },
        { status: 409 }
      )
    }

    // Actualizar habitación con transacción para manejar amenidades
    const result = await prisma.$transaction(async (tx) => {
      // Actualizar habitación
      const room = await tx.room.update({
        where: { id: BigInt(roomId) },
        data: {
          roomTypeId: BigInt(roomTypeId),
          code,
          floorNumber: floorNumber ? parseInt(floorNumber) : null,
          isActive,
        },
        include: {
          roomType: {
            select: {
              name: true,
              baseRate: true,
              occupancy: true,
              bedConfiguration: true,
              description: true,
            }
          }
        }
      })

      // Actualizar amenidades
      // Primero eliminar amenidades existentes
      console.log('🗑️ Deleting existing amenities for room:', roomId)
      await tx.$executeRaw`
        DELETE FROM entity_amenities 
        WHERE entity_type = 'ROOM' AND entity_id = ${BigInt(roomId)}
      `

      // Luego agregar las nuevas amenidades
      if (amenities.length > 0) {
        console.log('➕ Adding new amenities:', amenities)
        for (const amenityId of amenities) {
          console.log('➕ Adding amenity:', amenityId, 'to room:', roomId)
          await tx.$executeRaw`
            INSERT INTO entity_amenities (entity_type, entity_id, amenity_id, created_at)
            VALUES ('ROOM', ${BigInt(roomId)}, ${BigInt(amenityId)}, NOW())
          `
        }
        console.log('✅ Amenities updated successfully')
      } else {
        console.log('⚠️ No amenities to add')
      }

      return room
    })

    // Serializar respuesta
    const serializedRoom = {
      ...result,
      id: result.id.toString(),
      hotelId: result.hotelId.toString(),
      roomTypeId: result.roomTypeId.toString(),
      createdAt: result.createdAt.toISOString(),
      updatedAt: result.updatedAt.toISOString(),
      roomType: {
        ...result.roomType,
        baseRate: result.roomType.baseRate.toString(),
      }
    }

    return NextResponse.json(serializedRoom)

  } catch (error) {
    console.error('Error updating room:', error)
    return NextResponse.json(
      { error: 'Error actualizando habitación' },
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
    const roomId = searchParams.get('id')

    if (!roomId) {
      return NextResponse.json(
        { error: 'ID de habitación requerido' },
        { status: 400 }
      )
    }

    // Verificar si la habitación tiene reservaciones activas
    const activeBookings = await prisma.accommodationStay.count({
      where: {
        assignedRoom: {
          id: BigInt(roomId)
        },
        reservationItem: {
          reservation: {
            status: { in: ['PENDING', 'CONFIRMED'] }
          }
        }
      }
    })

    if (activeBookings > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar la habitación porque tiene reservaciones activas' },
        { status: 400 }
      )
    }

    // Verificar si hay inventario bloqueado
    const blockedInventory = await prisma.roomInventory.count({
      where: {
        roomId: BigInt(roomId),
        OR: [
          { isBlocked: true },
          { reservationItemId: { not: null } }
        ]
      }
    })

    if (blockedInventory > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar la habitación porque tiene inventario bloqueado' },
        { status: 400 }
      )
    }

    // Eliminar habitación (cascade eliminará relacionados)
    await prisma.room.delete({
      where: { id: BigInt(roomId) }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error deleting room:', error)
    return NextResponse.json(
      { error: 'Error eliminando habitación' },
      { status: 500 }
    )
  }
}
