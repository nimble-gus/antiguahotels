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
          }
        },
        roomType: {
          select: {
            id: true,
            name: true,
            baseRate: true,
            occupancy: true,
            bedConfiguration: true,
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

    // Serializar BigInt
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
      },
      roomType: {
        ...room.roomType,
        id: room.roomType.id.toString(),
        baseRate: room.roomType.baseRate.toString(),
      }
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
