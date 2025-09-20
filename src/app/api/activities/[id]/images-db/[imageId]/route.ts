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

    // Obtener la imagen antes de eliminarla usando Prisma
    const [image] = await prisma.$queryRaw`
      SELECT * FROM entity_images 
      WHERE id = ${BigInt(imageId)} AND entity_type = 'ACTIVITY' AND entity_id = ${BigInt(activityId)}
    ` as any[]

    if (!image) {
      return NextResponse.json(
        { error: 'Imagen no encontrada' },
        { status: 404 }
      )
    }

    // Eliminar de Cloudinary
    try {
      await cloudinary.uploader.destroy(image.cloudinary_public_id)
      console.log('✅ Image deleted from Cloudinary:', image.cloudinary_public_id)
    } catch (cloudinaryError) {
      console.error('⚠️ Error deleting from Cloudinary:', cloudinaryError)
      // Continuar con la eliminación de la BD aunque falle Cloudinary
    }

    // Eliminar de la base de datos usando Prisma
    await prisma.$executeRaw`
      DELETE FROM entity_images WHERE id = ${BigInt(imageId)}
    `

    // Si era la imagen principal, hacer principal a la primera imagen restante
    if (image.is_primary === 1) {
      await prisma.$executeRaw`
        UPDATE entity_images 
        SET is_primary = 1 
        WHERE entity_type = 'ACTIVITY' AND entity_id = ${BigInt(activityId)}
        ORDER BY display_order ASC 
        LIMIT 1
      `
      console.log('✅ New primary image set')
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

export async function PUT(
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

    console.log('🌟 Setting primary image:', { activityId, imageId })

    // Verificar que la imagen existe usando Prisma
    const [image] = await prisma.$queryRaw`
      SELECT id FROM entity_images 
      WHERE id = ${BigInt(imageId)} AND entity_type = 'ACTIVITY' AND entity_id = ${BigInt(activityId)}
    ` as any[]

    if (!image) {
      return NextResponse.json(
        { error: 'Imagen no encontrada' },
        { status: 404 }
      )
    }

    // Quitar flag principal de todas las imágenes de esta actividad
    await prisma.$executeRaw`
      UPDATE entity_images 
      SET is_primary = 0 
      WHERE entity_type = 'ACTIVITY' AND entity_id = ${BigInt(activityId)}
    `

    // Marcar la imagen seleccionada como principal
    await prisma.$executeRaw`
      UPDATE entity_images 
      SET is_primary = 1 
      WHERE id = ${BigInt(imageId)}
    `

    console.log('✅ Primary image updated successfully')

    return NextResponse.json({
      success: true,
      message: 'Imagen principal actualizada'
    })

  } catch (error) {
    console.error('❌ Error setting primary image:', error)
    return NextResponse.json(
      { error: 'Error estableciendo imagen principal' },
      { status: 500 }
    )
  }
}
