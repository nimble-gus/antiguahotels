import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const roomTypeId = params.id

    // Verificar que el tipo de habitación existe
    const roomType = await prisma.roomType.findUnique({
      where: { id: BigInt(roomTypeId) },
      include: {
        hotel: {
          select: {
            name: true
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

    // Obtener imágenes usando SQL directo
    const images = await prisma.$queryRaw`
      SELECT 
        ei.id,
        ei.image_url as imageUrl,
        ei.alt_text as altText,
        ei.is_primary as isPrimary,
        ei.display_order as displayOrder,
        ei.cloudinary_public_id as cloudinaryPublicId
      FROM entity_images ei
      WHERE ei.entity_type = 'ROOM_TYPE' 
      AND ei.entity_id = ${BigInt(roomTypeId)}
      ORDER BY ei.is_primary DESC, ei.display_order ASC
    `

    const serializedImages = (images as any[]).map(image => ({
      id: image.id.toString(),
      imageUrl: image.imageUrl,
      altText: image.altText,
      isPrimary: Boolean(image.isPrimary),
      displayOrder: image.displayOrder,
      cloudinaryPublicId: image.cloudinaryPublicId
    }))

    return NextResponse.json(serializedImages)

  } catch (error) {
    console.error('Error fetching room type images:', error)
    return NextResponse.json(
      { error: 'Error obteniendo imágenes' },
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

    const roomTypeId = params.id
    const body = await request.json()
    const {
      imageUrl,
      cloudinaryPublicId,
      altText,
      isPrimary = false,
      displayOrder = 0
    } = body

    // Verificar que el tipo de habitación existe
    const roomType = await prisma.roomType.findUnique({
      where: { id: BigInt(roomTypeId) }
    })

    if (!roomType) {
      return NextResponse.json(
        { error: 'Tipo de habitación no encontrado' },
        { status: 404 }
      )
    }

    // Si esta imagen será principal, quitar la principal actual
    if (isPrimary) {
      await prisma.$executeRaw`
        UPDATE entity_images 
        SET is_primary = 0 
        WHERE entity_type = 'ROOM_TYPE' 
        AND entity_id = ${BigInt(roomTypeId)}
      `
    }

    // Insertar nueva imagen
    const result = await prisma.$executeRaw`
      INSERT INTO entity_images (
        entity_type, 
        entity_id, 
        image_url, 
        cloudinary_public_id, 
        alt_text, 
        is_primary, 
        display_order, 
        created_at
      ) VALUES (
        'ROOM_TYPE',
        ${BigInt(roomTypeId)},
        ${imageUrl},
        ${cloudinaryPublicId || null},
        ${altText || ''},
        ${isPrimary ? 1 : 0},
        ${displayOrder},
        NOW()
      )
    `

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error creating room type image:', error)
    return NextResponse.json(
      { error: 'Error creando imagen' },
      { status: 500 }
    )
  }
}






