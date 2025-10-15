import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { v2 as cloudinary } from 'cloudinary'

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; imageId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const activityId = params.id
    const imageId = params.imageId

    console.log('🗑️ Deleting activity image:', { activityId, imageId })

    // Obtener la imagen antes de eliminarla
    const image = await prisma.entityImage.findFirst({
      where: {
        id: BigInt(imageId),
        entityType: 'ACTIVITY',
        entityId: BigInt(activityId)
      }
    })

    if (!image) {
      return NextResponse.json(
        { error: 'Imagen no encontrada' },
        { status: 404 }
      )
    }

    // Eliminar de Cloudinary
    try {
      if (image.cloudinaryPublicId) {
        await cloudinary.uploader.destroy(image.cloudinaryPublicId)
      }
      console.log('✅ Image deleted from Cloudinary:', image.cloudinaryPublicId)
    } catch (cloudinaryError) {
      console.error('⚠️ Error deleting from Cloudinary:', cloudinaryError)
      // Continuar con la eliminación de la BD aunque falle Cloudinary
    }

    // Eliminar de la base de datos
    await prisma.entityImage.delete({
      where: { id: BigInt(imageId) }
    })

    // Si era la imagen principal, hacer principal a la primera imagen restante
    if (image.isPrimary) {
      const remainingImages = await prisma.entityImage.findFirst({
        where: {
          entityType: 'ACTIVITY',
          entityId: BigInt(activityId)
        },
        orderBy: { displayOrder: 'asc' }
      })

      if (remainingImages) {
        await prisma.entityImage.update({
          where: { id: remainingImages.id },
          data: { isPrimary: true }
        })
        console.log('✅ New primary image set:', remainingImages.id.toString())
      }
    }

    console.log('✅ Activity image deleted successfully')

    return NextResponse.json({
      success: true,
      message: 'Imagen eliminada exitosamente'
    })

  } catch (error) {
    console.error('❌ Error deleting activity image:', error)
    return NextResponse.json(
      { error: 'Error eliminando imagen de la actividad' },
      { status: 500 }
    )
  }
}








