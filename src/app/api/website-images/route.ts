import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { 
  getPersistentImages, 
  addPersistentImage, 
  updatePersistentImage, 
  deletePersistentImage 
} from '@/lib/persistent-website-images'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const pageSection = searchParams.get('pageSection') || 'hero'

    // Obtener todas las imágenes persistentes
    const allImages = getPersistentImages()
    
    // Filtrar por sección
    const filteredImages = allImages.filter(img => img.pageSection === pageSection)

    return NextResponse.json({
      images: filteredImages,
      totalCount: filteredImages.length
    })

  } catch (error) {
    console.error('Error fetching website images:', error)
    return NextResponse.json(
      { error: 'Error obteniendo imágenes del sitio web' },
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
      imageKey,
      title,
      description,
      imageUrl,
      cloudinaryPublicId,
      altText,
      isActive,
      sortOrder,
      pageSection,
      pageType
    } = body

    // Validaciones básicas
    if (!imageKey || !title || !imageUrl || !cloudinaryPublicId) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    // Crear nueva imagen usando la función persistente
    const newImage = addPersistentImage({
      imageKey,
      title,
      description: description || null,
      imageUrl,
      cloudinaryPublicId,
      altText: altText || null,
      isActive: isActive !== undefined ? isActive : true,
      sortOrder: sortOrder || 0,
      pageSection: pageSection || 'hero',
      pageType: pageType || 'home'
    })

    return NextResponse.json({
      success: true,
      image: newImage
    })

  } catch (error) {
    console.error('Error creating website image:', error)
    return NextResponse.json(
      { error: 'Error creando imagen del sitio web' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
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
    const body = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: 'ID es requerido' },
        { status: 400 }
      )
    }

    // Actualizar la imagen usando la función persistente
    const updatedImage = updatePersistentImage(id, body)
    
    if (!updatedImage) {
      return NextResponse.json(
        { error: 'Imagen no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      image: updatedImage
    })

  } catch (error) {
    console.error('Error updating website image:', error)
    return NextResponse.json(
      { error: 'Error actualizando imagen del sitio web' },
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
        { error: 'ID es requerido' },
        { status: 400 }
      )
    }

    // Eliminar la imagen usando la función persistente
    const deleted = deletePersistentImage(id)
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'Imagen no encontrada' },
        { status: 404 }
      )
    }

    console.log('📸 Image deleted from admin API:', id)

    return NextResponse.json({ 
      success: true,
      message: 'Imagen eliminada exitosamente'
    })

  } catch (error) {
    console.error('Error deleting website image:', error)
    return NextResponse.json(
      { error: 'Error eliminando imagen del sitio web' },
      { status: 500 }
    )
  }
}