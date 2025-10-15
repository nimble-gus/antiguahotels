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
    const body = await request.json()
    const { displayOrder, altText } = body

    // Actualizar imagen
    await prisma.$executeRaw`
      UPDATE entity_images 
      SET 
        display_order = ${displayOrder || 0},
        alt_text = ${altText || ''}
      WHERE id = ${BigInt(imageId)}
      AND entity_type = 'ROOM_TYPE'
    `

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error updating image:', error)
    return NextResponse.json(
      { error: 'Error actualizando imagen' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    // Obtener información de la imagen para eliminar de Cloudinary
    const image = await prisma.$queryRaw`
      SELECT cloudinary_public_id, entity_id
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

    // Eliminar de la base de datos
    await prisma.$executeRaw`
      DELETE FROM entity_images 
      WHERE id = ${BigInt(imageId)}
      AND entity_type = 'ROOM_TYPE'
    `

    // TODO: Eliminar de Cloudinary si es necesario
    // if (imageData.cloudinary_public_id) {
    //   await cloudinary.uploader.destroy(imageData.cloudinary_public_id)
    // }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error deleting image:', error)
    return NextResponse.json(
      { error: 'Error eliminando imagen' },
      { status: 500 }
    )
  }
}






