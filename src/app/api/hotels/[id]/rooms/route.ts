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
          }
        }
      },
      orderBy: [
        { floorNumber: 'asc' },
        { code: 'asc' }
      ]
    })

    // Serializar BigInt
    const serializedRooms = rooms.map(room => ({
      ...room,
      id: room.id.toString(),
      hotelId: room.hotelId.toString(),
      roomTypeId: room.roomTypeId.toString(),
      createdAt: room.createdAt.toISOString(),
      updatedAt: room.updatedAt.toISOString(),
      roomType: {
        ...room.roomType,
        baseRate: room.roomType.baseRate.toString(),
      }
    }))

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
      isActive = true
    } = body

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

    // Crear habitación
    const room = await prisma.room.create({
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
          }
        }
      }
    })

    // Serializar respuesta
    const serializedRoom = {
      ...room,
      id: room.id.toString(),
      hotelId: room.hotelId.toString(),
      roomTypeId: room.roomTypeId.toString(),
      createdAt: room.createdAt.toISOString(),
      updatedAt: room.updatedAt.toISOString(),
      roomType: {
        ...room.roomType,
        baseRate: room.roomType.baseRate.toString(),
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
      isActive
    } = body

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

    // Actualizar habitación
    const room = await prisma.room.update({
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
          }
        }
      }
    })

    // Serializar respuesta
    const serializedRoom = {
      ...room,
      id: room.id.toString(),
      hotelId: room.hotelId.toString(),
      roomTypeId: room.roomTypeId.toString(),
      createdAt: room.createdAt.toISOString(),
      updatedAt: room.updatedAt.toISOString(),
      roomType: {
        ...room.roomType,
        baseRate: room.roomType.baseRate.toString(),
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
