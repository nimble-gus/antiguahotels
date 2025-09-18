import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    const where: any = {
      isActive: true
    }

    if (category) {
      where.category = category
    }

    const amenities = await prisma.amenity.findMany({
      where,
      orderBy: [
        { category: 'asc' },
        { name: 'asc' }
      ]
    })

    // Serializar BigInt
    const serializedAmenities = amenities.map(amenity => ({
      ...amenity,
      id: amenity.id.toString(),
      createdAt: amenity.createdAt.toISOString(),
    }))

    return NextResponse.json(serializedAmenities)

  } catch (error) {
    console.error('Error fetching amenities:', error)
    return NextResponse.json(
      { error: 'Error obteniendo amenidades' },
      { status: 500 }
    )
  }
}
