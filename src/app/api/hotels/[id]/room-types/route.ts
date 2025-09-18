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
    const { searchParams } = new URL(request.url)
    const active = searchParams.get('active')
    
    console.log('🏨 Fetching room types for hotel ID:', hotelId, 'active:', active)

    const where: any = {
      hotelId: BigInt(hotelId)
    }
    
    if (active === 'true') {
      where.isActive = true
    }

    const roomTypes = await prisma.roomType.findMany({
      where,
      include: {
        _count: {
          select: {
            rooms: true
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    // Serializar BigInt
    const serializedRoomTypes = roomTypes.map(rt => ({
      ...rt,
      id: rt.id.toString(),
      hotelId: rt.hotelId.toString(),
      baseRate: rt.baseRate.toString(),
      createdAt: rt.createdAt.toISOString(),
      updatedAt: rt.updatedAt.toISOString(),
      _count: {
        rooms: rt._count.rooms
      }
    }))

    console.log('✅ Found room types:', serializedRoomTypes.length)
    return NextResponse.json({ roomTypes: serializedRoomTypes })

  } catch (error) {
    console.error('Error fetching room types:', error)
    return NextResponse.json(
      { error: 'Error obteniendo tipos de habitación' },
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
      name,
      description,
      occupancy,
      maxAdults,
      maxChildren,
      bedConfiguration,
      roomSizeSqm,
      baseRate,
      currency,
      amenityIds
    } = body

    // Validaciones
    if (!name || !occupancy || !maxAdults || !baseRate) {
      return NextResponse.json(
        { error: 'Nombre, ocupación, adultos máximos y precio base son requeridos' },
        { status: 400 }
      )
    }

    // Verificar si el tipo de habitación ya existe en este hotel
    const existingRoomType = await prisma.roomType.findFirst({
      where: {
        hotelId: BigInt(hotelId),
        name
      }
    })

    if (existingRoomType) {
      return NextResponse.json(
        { error: 'Ya existe un tipo de habitación con este nombre en el hotel' },
        { status: 409 }
      )
    }

    // Crear tipo de habitación
    const roomType = await prisma.roomType.create({
      data: {
        hotelId: BigInt(hotelId),
        name,
        description: description || null,
        occupancy: parseInt(occupancy),
        maxAdults: parseInt(maxAdults),
        maxChildren: parseInt(maxChildren) || 0,
        bedConfiguration: bedConfiguration || null,
        roomSizeSqm: roomSizeSqm ? parseInt(roomSizeSqm) : null,
        baseRate: parseFloat(baseRate),
        currency: currency || 'USD',
      },
      include: {
        _count: {
          select: {
            rooms: true
          }
        }
      }
    })

    // Agregar amenidades si se proporcionan
    if (amenityIds && amenityIds.length > 0) {
      await prisma.entityAmenity.createMany({
        data: amenityIds.map((amenityId: string) => ({
          entityType: 'ROOM_TYPE' as const,
          entityId: roomType.id,
          amenityId: BigInt(amenityId),
        }))
      })
    }

    // Serializar respuesta
    const serializedRoomType = {
      ...roomType,
      id: roomType.id.toString(),
      hotelId: roomType.hotelId.toString(),
      baseRate: roomType.baseRate.toString(),
      createdAt: roomType.createdAt.toISOString(),
      updatedAt: roomType.updatedAt.toISOString(),
    }

    return NextResponse.json(serializedRoomType)

  } catch (error) {
    console.error('Error creating room type:', error)
    return NextResponse.json(
      { error: 'Error creando tipo de habitación' },
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
    const roomTypeId = searchParams.get('id')
    const body = await request.json()

    if (!roomTypeId) {
      return NextResponse.json(
        { error: 'ID de tipo de habitación requerido' },
        { status: 400 }
      )
    }

    const {
      name,
      description,
      occupancy,
      maxAdults,
      maxChildren,
      bedConfiguration,
      roomSizeSqm,
      baseRate,
      currency,
      isActive
    } = body

    // Validaciones
    if (!name || !occupancy || !maxAdults || !baseRate) {
      return NextResponse.json(
        { error: 'Nombre, ocupación, adultos máximos y precio base son requeridos' },
        { status: 400 }
      )
    }

    // Verificar si el nombre ya existe en otro tipo de habitación del mismo hotel
    const existingRoomType = await prisma.roomType.findFirst({
      where: {
        hotelId: BigInt(hotelId),
        name,
        NOT: { id: BigInt(roomTypeId) }
      }
    })

    if (existingRoomType) {
      return NextResponse.json(
        { error: 'Ya existe un tipo de habitación con este nombre en el hotel' },
        { status: 409 }
      )
    }

    // Actualizar tipo de habitación
    const roomType = await prisma.roomType.update({
      where: { id: BigInt(roomTypeId) },
      data: {
        name,
        description: description || null,
        occupancy: parseInt(occupancy),
        maxAdults: parseInt(maxAdults),
        maxChildren: parseInt(maxChildren) || 0,
        bedConfiguration: bedConfiguration || null,
        roomSizeSqm: roomSizeSqm ? parseInt(roomSizeSqm) : null,
        baseRate: parseFloat(baseRate),
        currency: currency || 'USD',
        isActive: isActive ?? true,
      },
      include: {
        _count: {
          select: {
            rooms: true
          }
        }
      }
    })

    // Serializar respuesta
    const serializedRoomType = {
      ...roomType,
      id: roomType.id.toString(),
      hotelId: roomType.hotelId.toString(),
      baseRate: roomType.baseRate.toString(),
      createdAt: roomType.createdAt.toISOString(),
      updatedAt: roomType.updatedAt.toISOString(),
    }

    return NextResponse.json(serializedRoomType)

  } catch (error) {
    console.error('Error updating room type:', error)
    return NextResponse.json(
      { error: 'Error actualizando tipo de habitación' },
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
    const roomTypeId = searchParams.get('id')

    if (!roomTypeId) {
      return NextResponse.json(
        { error: 'ID de tipo de habitación requerido' },
        { status: 400 }
      )
    }

    // Verificar si el tipo de habitación tiene habitaciones asociadas
    const roomsCount = await prisma.room.count({
      where: {
        roomTypeId: BigInt(roomTypeId)
      }
    })

    if (roomsCount > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar el tipo de habitación porque tiene habitaciones asociadas' },
        { status: 400 }
      )
    }

    // Verificar si hay reservaciones activas
    const activeBookings = await prisma.accommodationStay.count({
      where: {
        roomTypeId: BigInt(roomTypeId),
        reservationItem: {
          reservation: {
            status: { in: ['PENDING', 'CONFIRMED'] }
          }
        }
      }
    })

    if (activeBookings > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar el tipo de habitación porque tiene reservaciones activas' },
        { status: 400 }
      )
    }

    // Eliminar amenidades asociadas
    await prisma.entityAmenity.deleteMany({
      where: {
        entityType: 'ROOM_TYPE',
        entityId: BigInt(roomTypeId)
      }
    })

    // Eliminar tipo de habitación
    await prisma.roomType.delete({
      where: { id: BigInt(roomTypeId) }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error deleting room type:', error)
    return NextResponse.json(
      { error: 'Error eliminando tipo de habitación' },
      { status: 500 }
    )
  }
}
