import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Importar datos mock del archivo principal
const mockActivityImages: Record<string, any[]> = {}

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

    // Buscar y eliminar la imagen del mock
    if (mockActivityImages[activityId]) {
      const imageIndex = mockActivityImages[activityId].findIndex(img => img.id === imageId)
      
      if (imageIndex === -1) {
        return NextResponse.json(
          { error: 'Imagen no encontrada' },
          { status: 404 }
        )
      }

      const deletedImage = mockActivityImages[activityId][imageIndex]
      mockActivityImages[activityId].splice(imageIndex, 1)

      // Si era la imagen principal, hacer principal a la primera imagen restante
      if (deletedImage.isPrimary && mockActivityImages[activityId].length > 0) {
        mockActivityImages[activityId][0].isPrimary = true
        console.log('✅ New primary image set')
      }

      console.log('✅ Activity image deleted successfully')

      return NextResponse.json({
        success: true,
        message: 'Imagen eliminada exitosamente'
      })
    }

    return NextResponse.json(
      { error: 'Actividad no encontrada' },
      { status: 404 }
    )

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
    const body = await request.json()

    console.log('🌟 Setting primary image:', { activityId, imageId })

    // Buscar la imagen en el mock
    if (mockActivityImages[activityId]) {
      const image = mockActivityImages[activityId].find(img => img.id === imageId)
      
      if (!image) {
        return NextResponse.json(
          { error: 'Imagen no encontrada' },
          { status: 404 }
        )
      }

      // Quitar flag principal de todas las imágenes
      mockActivityImages[activityId].forEach(img => img.isPrimary = false)
      
      // Marcar la imagen seleccionada como principal
      image.isPrimary = true

      console.log('✅ Primary image updated successfully')

      return NextResponse.json({
        success: true,
        message: 'Imagen principal actualizada'
      })
    }

    return NextResponse.json(
      { error: 'Actividad no encontrada' },
      { status: 404 }
    )

  } catch (error) {
    console.error('❌ Error setting primary image:', error)
    return NextResponse.json(
      { error: 'Error estableciendo imagen principal' },
      { status: 500 }
    )
  }
}








