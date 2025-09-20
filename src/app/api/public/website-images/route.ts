import { NextRequest, NextResponse } from 'next/server'
import { getPersistentImages } from '@/lib/persistent-website-images'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const pageSection = searchParams.get('pageSection') || 'hero'
    const pageType = searchParams.get('pageType') || 'home'

    // Obtener todas las imágenes persistentes
    const allImages = getPersistentImages()

    // Filtrar por sección y tipo de página
    const filteredImages = allImages.filter(img => 
      img.pageSection === pageSection && 
      img.pageType === pageType &&
      img.isActive
    )

    // Ordenar por sortOrder
    filteredImages.sort((a, b) => a.sortOrder - b.sortOrder)

    console.log('📸 Public API - Filtered images:', filteredImages.length, 'for section:', pageSection)

    return NextResponse.json({
      images: filteredImages,
      totalCount: filteredImages.length,
      pageSection,
      pageType
    })

  } catch (error) {
    console.error('Error fetching public website images:', error)
    return NextResponse.json(
      { error: 'Error obteniendo imágenes del sitio web' },
      { status: 500 }
    )
  }
}