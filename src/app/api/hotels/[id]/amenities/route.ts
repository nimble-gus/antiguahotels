import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const hotelId = params.id

    const amenities = await prisma.entityAmenity.findMany({
      where: {
        entityType: 'HOTEL',
        entityId: BigInt(hotelId),
      },
      include: {
        amenity: true
      }
    })

    // Serializar BigInt
    const serializedAmenities = amenities.map(ea => ({
      id: ea.amenity.id.toString(),
      name: ea.amenity.name,
      description: ea.amenity.description,
      icon: ea.amenity.icon,
      category: ea.amenity.category,
    }))

    return NextResponse.json(serializedAmenities)

  } catch (error) {
    console.error('Error fetching hotel amenities:', error)
    return NextResponse.json(
      { error: 'Error obteniendo amenidades del hotel' },
      { status: 500 }
    )
  }
}








