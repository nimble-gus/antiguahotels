import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { deleteFromCloudinary } from '@/lib/cloudinary'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const entityType = searchParams.get('entityType')
    const entityId = searchParams.get('entityId')

    if (!entityType || !entityId) {
      return NextResponse.json(
        { error: 'entityType y entityId son requeridos' },
        { status: 400 }
      )
    }

    const images = await prisma.entityImage.findMany({
      where: {
        entityType: entityType as any,
        entityId: BigInt(entityId),
      },
      orderBy: [
        { isPrimary: 'desc' },
        { displayOrder: 'asc' },
        { createdAt: 'asc' }
      ]
    })

    // Serializar BigInt
    const serializedImages = images.map(image => ({
      ...image,
      id: image.id.toString(),
      entityId: image.entityId.toString(),
      createdAt: image.createdAt.toISOString(),
    }))

    return NextResponse.json(serializedImages)

  } catch (error) {
    console.error('Error fetching images:', error)
    return NextResponse.json(
      { error: 'Error obteniendo imágenes' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      entityType,
      entityId,
      imageUrl,
      cloudinaryPublicId,
      altText,
      isPrimary = false,
      displayOrder = 0
    } = body

    // Validaciones
    if (!entityType || !entityId || !imageUrl) {
      return NextResponse.json(
        { error: 'entityType, entityId e imageUrl son requeridos' },
        { status: 400 }
      )
    }

    // Si se marca como primaria, desmarcar otras imágenes primarias
    if (isPrimary) {
      await prisma.entityImage.updateMany({
        where: {
          entityType: entityType as any,
          entityId: BigInt(entityId),
          isPrimary: true,
        },
        data: {
          isPrimary: false,
        }
      })
    }

    // Crear imagen
    const image = await prisma.entityImage.create({
      data: {
        entityType: entityType as any,
        entityId: BigInt(entityId),
        imageUrl,
        cloudinaryPublicId: cloudinaryPublicId || null,
        altText: altText || null,
        isPrimary,
        displayOrder,
      }
    })

    // Serializar respuesta
    const serializedImage = {
      ...image,
      id: image.id.toString(),
      entityId: image.entityId.toString(),
      createdAt: image.createdAt.toISOString(),
    }

    return NextResponse.json(serializedImage)

  } catch (error) {
    console.error('Error saving image:', error)
    return NextResponse.json(
      { error: 'Error guardando imagen' },
      { status: 500 }
    )
  }
}

// Actualizar imagen (marcar como primaria, cambiar orden, etc.)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { id, isPrimary, displayOrder, altText } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID requerido' },
        { status: 400 }
      )
    }

    // Si se marca como primaria, obtener info de la imagen para desmarcar otras
    if (isPrimary) {
      const currentImage = await prisma.entityImage.findUnique({
        where: { id: BigInt(id) }
      })

      if (currentImage) {
        await prisma.entityImage.updateMany({
          where: {
            entityType: currentImage.entityType,
            entityId: currentImage.entityId,
            isPrimary: true,
            NOT: { id: BigInt(id) }
          },
          data: {
            isPrimary: false,
          }
        })
      }
    }

    const updateData: any = {}
    if (isPrimary !== undefined) updateData.isPrimary = isPrimary
    if (displayOrder !== undefined) updateData.displayOrder = displayOrder
    if (altText !== undefined) updateData.altText = altText

    // Actualizar imagen
    const image = await prisma.entityImage.update({
      where: { id: BigInt(id) },
      data: updateData
    })

    // Serializar respuesta
    const serializedImage = {
      ...image,
      id: image.id.toString(),
      entityId: image.entityId.toString(),
      createdAt: image.createdAt.toISOString(),
    }

    return NextResponse.json(serializedImage)

  } catch (error) {
    console.error('Error updating image:', error)
    return NextResponse.json(
      { error: 'Error actualizando imagen' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID requerido' },
        { status: 400 }
      )
    }

    // Obtener imagen para eliminar de Cloudinary
    const image = await prisma.entityImage.findUnique({
      where: { id: BigInt(id) }
    })

    if (!image) {
      return NextResponse.json(
        { error: 'Imagen no encontrada' },
        { status: 404 }
      )
    }

    // Eliminar de Cloudinary si tiene publicId
    if (image.cloudinaryPublicId) {
      try {
        await deleteFromCloudinary(image.cloudinaryPublicId)
      } catch (error) {
        console.error('Error deleting from Cloudinary:', error)
        // Continuar aunque falle la eliminación de Cloudinary
      }
    }

    // Eliminar de base de datos
    await prisma.entityImage.delete({
      where: { id: BigInt(id) }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error deleting image:', error)
    return NextResponse.json(
      { error: 'Error eliminando imagen' },
      { status: 500 }
    )
  }
}
