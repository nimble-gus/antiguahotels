import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('🎯 Fetching public packages...')
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '9')
    const search = searchParams.get('search') || ''
    const minDuration = searchParams.get('minDuration')
    const maxDuration = searchParams.get('maxDuration')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')

    const skip = (page - 1) * limit

    // Usar la misma lógica que featured-activities pero para paquetes
    const packagesWithImages = await prisma.$queryRaw`
      SELECT 
        p.id,
        p.name,
        p.description,
        p.short_description,
        p.duration_days,
        p.duration_nights,
        p.min_participants,
        p.max_participants,
        p.base_price,
        p.price_per_couple,
        p.currency,
        p.capacity,
        p.what_includes,
        p.what_excludes,
        p.itinerary,
        p.cancellation_policy,
        p.active,
        ei.image_url,
        ei.alt_text,
        ei.cloudinary_public_id,
        ei.is_primary
      FROM packages p
      LEFT JOIN entity_images ei ON (
        ei.entity_type = 'PACKAGE' 
        AND ei.entity_id = p.id 
        AND ei.is_primary = 1
      )
      WHERE p.active = 1
      ORDER BY p.name ASC
      LIMIT ${Number(limit)} OFFSET ${Number(skip)}
    ` as any[]

    console.log(`✅ Found ${packagesWithImages.length} packages with images`)

    // Obtener el total de paquetes para la paginación
    const totalCount = await prisma.$queryRaw`
      SELECT COUNT(*) as total
      FROM packages p
      WHERE p.active = 1
    ` as any[]

    const total = Number(totalCount[0]?.total) || 0
    const totalPages = Math.ceil(total / limit)

    // Formatear datos para el frontend
    const serializedPackages = packagesWithImages.map(pkg => ({
      id: pkg.id.toString(),
      name: pkg.name,
      description: pkg.description || pkg.short_description || '',
      shortDescription: pkg.short_description || '',
      durationDays: Number(pkg.duration_days),
      durationNights: Number(pkg.duration_nights),
      minParticipants: Number(pkg.min_participants),
      maxParticipants: pkg.max_participants ? Number(pkg.max_participants) : null,
      basePrice: parseFloat(pkg.base_price.toString()),
      pricePerCouple: pkg.price_per_couple ? parseFloat(pkg.price_per_couple.toString()) : null,
      currency: pkg.currency,
      capacity: pkg.capacity ? Number(pkg.capacity) : null,
      whatIncludes: pkg.what_includes,
      whatExcludes: pkg.what_excludes,
      itinerary: pkg.itinerary,
      cancellationPolicy: pkg.cancellation_policy,
      isActive: Boolean(pkg.active),
      images: pkg.image_url ? [{
        id: '1',
        imageUrl: pkg.image_url,
        altText: pkg.alt_text || pkg.name,
        isPrimary: Boolean(pkg.is_primary),
        displayOrder: 0
      }] : [{
        id: 'placeholder',
        imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop',
        altText: pkg.name,
        isPrimary: true,
        displayOrder: 0
      }],
      // Información adicional que se puede calcular
      totalDuration: `${Number(pkg.duration_days)} días / ${Number(pkg.duration_nights)} noches`,
      priceRange: pkg.price_per_couple 
        ? `$${parseFloat(pkg.base_price.toString())} - $${parseFloat(pkg.price_per_couple.toString())}`
        : `$${parseFloat(pkg.base_price.toString())}`,
      participants: pkg.max_participants 
        ? `${Number(pkg.min_participants)}-${Number(pkg.max_participants)} personas`
        : `${Number(pkg.min_participants)}+ personas`
    }))

    console.log(`📤 Returning ${serializedPackages.length} serialized packages (page ${page}/${totalPages})`)

    return NextResponse.json({
      packages: serializedPackages,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    })

  } catch (error) {
    console.error('❌ Error fetching public packages:', error)
    return NextResponse.json(
      { 
        error: 'Error obteniendo paquetes',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}





