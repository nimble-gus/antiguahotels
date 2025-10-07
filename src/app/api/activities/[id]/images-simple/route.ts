import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Datos mock temporales para testing
let mockActivityImages: Record<string, any[]> = {}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const activityId = params.id
    console.log('📸 Fetching images for activity:', activityId)

    // Por ahora usar datos mock
    const images = mockActivityImages[activityId] || []
    
    console.log('📸 Found images:', images.length)

    return NextResponse.json({
      images: images,
      totalCount: images.length
    })

  } catch (error) {
    console.error('Error fetching activity images:', error)
    return NextResponse.json(
      { error: 'Error obteniendo imágenes de la actividad' },
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
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const activityId = params.id
    const body = await request.json()
    const {
      imageUrl,
      cloudinaryPublicId,
      altText,
      isPrimary,
      sortOrder
    } = body

    console.log('📸 Adding image to activity:', activityId, { imageUrl, isPrimary })

    // Validaciones
    if (!imageUrl || !cloudinaryPublicId) {
      return NextResponse.json(
        { error: 'URL de imagen y Public ID son requeridos' },
        { status: 400 }
      )
    }

    // Inicializar array si no existe
    if (!mockActivityImages[activityId]) {
      mockActivityImages[activityId] = []
    }

    // Si es imagen principal, quitar el flag de las demás
    if (isPrimary) {
      mockActivityImages[activityId].forEach(img => img.isPrimary = false)
    }

    // Crear nueva imagen
    const newImage = {
      id: Date.now().toString(),
      imageUrl,
      cloudinaryPublicId,
      altText: altText || `Imagen de actividad`,
      isPrimary: isPrimary || false,
      sortOrder: sortOrder || mockActivityImages[activityId].length + 1,
      createdAt: new Date().toISOString()
    }

    mockActivityImages[activityId].push(newImage)

    console.log('✅ Image added successfully')

    return NextResponse.json({
      success: true,
      image: newImage
    })

  } catch (error) {
    console.error('Error creating activity image:', error)
    return NextResponse.json(
      { error: 'Error creando imagen de la actividad' },
      { status: 500 }
    )
  }
}



