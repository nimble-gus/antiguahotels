import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { imageId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const imageId = params.imageId

    // Obtener información de la imagen
    const image = await prisma.$queryRaw`
      SELECT entity_id
      FROM entity_images 
      WHERE id = ${BigInt(imageId)}
      AND entity_type = 'ROOM_TYPE'
    `

    if (!image || (image as any[]).length === 0) {
      return NextResponse.json(
        { error: 'Imagen no encontrada' },
        { status: 404 }
      )
    }

    const imageData = (image as any[])[0]
    const roomTypeId = imageData.entity_id

    // Quitar la imagen principal actual
    await prisma.$executeRaw`
      UPDATE entity_images 
      SET is_primary = 0 
      WHERE entity_type = 'ROOM_TYPE' 
      AND entity_id = ${BigInt(roomTypeId)}
    `

    // Establecer esta imagen como principal
    await prisma.$executeRaw`
      UPDATE entity_images 
      SET is_primary = 1 
      WHERE id = ${BigInt(imageId)}
      AND entity_type = 'ROOM_TYPE'
    `

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error setting primary image:', error)
    return NextResponse.json(
      { error: 'Error estableciendo imagen principal' },
      { status: 500 }
    )
  }
}





