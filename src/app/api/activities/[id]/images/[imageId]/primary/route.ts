import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

    // Verificar que la imagen existe y pertenece a la actividad
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

    // Quitar flag principal de todas las imágenes de esta actividad
    await prisma.entityImage.updateMany({
      where: {
        entityType: 'ACTIVITY',
        entityId: BigInt(activityId)
      },
      data: { isPrimary: false }
    })

    // Marcar la imagen seleccionada como principal
    await prisma.entityImage.update({
      where: { id: BigInt(imageId) },
      data: { isPrimary: true }
    })

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



