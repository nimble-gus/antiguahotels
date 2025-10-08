import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const roomTypes = await prisma.roomType.findMany({
      include: {
        hotel: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: [
        { hotel: { name: 'asc' } },
        { name: 'asc' }
      ]
    })

    const serializedRoomTypes = roomTypes.map(roomType => ({
      ...roomType,
      id: roomType.id.toString(),
      hotelId: roomType.hotelId.toString(),
      baseRate: roomType.baseRate.toString(),
      hotel: {
        ...roomType.hotel,
        id: roomType.hotel.id.toString()
      }
    }))

    return NextResponse.json(serializedRoomTypes)

  } catch (error) {
    console.error('Error fetching room types:', error)
    return NextResponse.json(
      { error: 'Error obteniendo tipos de habitación' },
      { status: 500 }
    )
  }
}


