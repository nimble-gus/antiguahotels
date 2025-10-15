import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const roomTypeId = params.id

    const roomType = await prisma.roomType.findUnique({
      where: {
        id: BigInt(roomTypeId)
      },
      include: {
        hotel: {
          select: {
            name: true,
            code: true
          }
        }
      }
    })

    if (!roomType) {
      return NextResponse.json(
        { error: 'Tipo de habitación no encontrado' },
        { status: 404 }
      )
    }

    // Serializar BigInt
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
    console.error('Error fetching room type:', error)
    return NextResponse.json(
      { error: 'Error obteniendo tipo de habitación' },
      { status: 500 }
    )
  }
}









