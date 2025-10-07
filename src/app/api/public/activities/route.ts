import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('🎯 Fetching public activities...')
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '9')
    const search = searchParams.get('search') || ''
    const difficulty = searchParams.get('difficulty') || ''
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')

    const skip = (page - 1) * limit

    // Usar la misma lógica que featured-activities pero para todas las actividades
    const activitiesWithImages = await prisma.$queryRaw`
      SELECT 
        a.id,
        a.name,
        a.description,
        a.short_description,
        a.duration_hours,
        a.min_participants,
        a.max_participants,
        a.base_price,
        a.currency,
        a.difficulty_level,
        a.location,
        a.is_featured,
        a.featured_order,
        a.is_active,
        ei.image_url,
        ei.alt_text,
        ei.cloudinary_public_id,
        ei.is_primary
      FROM activities a
      LEFT JOIN entity_images ei ON (
        ei.entity_type = 'ACTIVITY' 
        AND ei.entity_id = a.id 
        AND ei.is_primary = 1
      )
      WHERE a.is_active = 1
      ORDER BY a.name ASC
      LIMIT ${Number(limit)} OFFSET ${Number(skip)}
    ` as any[]

    console.log(`✅ Found ${activitiesWithImages.length} activities with images`)

    // Obtener el total de actividades para la paginación
    const totalCount = await prisma.$queryRaw`
      SELECT COUNT(*) as total
      FROM activities a
      WHERE a.is_active = 1
    ` as any[]

    const total = Number(totalCount[0]?.total) || 0
    const totalPages = Math.ceil(total / limit)

    // Formatear datos para el frontend
    const serializedActivities = activitiesWithImages.map(activity => ({
      id: activity.id.toString(),
      name: activity.name,
      description: activity.description || activity.short_description || '',
      basePrice: parseFloat(activity.base_price.toString()),
      currency: activity.currency,
      duration: activity.duration_hours ? Math.round(parseFloat(activity.duration_hours.toString()) * 60) : 0,
      minParticipants: Number(activity.min_participants),
      maxParticipants: activity.max_participants ? Number(activity.max_participants) : null,
      location: activity.location || 'Antigua Guatemala',
      difficulty: activity.difficulty_level || 'moderate',
      category: 'Aventura',
      isActive: Boolean(activity.is_active),
      isFeatured: Boolean(activity.is_featured),
      images: activity.image_url ? [{
        id: '1',
        imageUrl: activity.image_url,
        altText: activity.alt_text || activity.name,
        isPrimary: Boolean(activity.is_primary),
        displayOrder: 0
      }] : [{
        id: 'placeholder',
        imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop',
        altText: activity.name,
        isPrimary: true,
        displayOrder: 0
      }],
      schedules: [], // Por ahora sin horarios para simplificar
      availableSchedules: 0,
    }))

    console.log(`📤 Returning ${serializedActivities.length} serialized activities (page ${page}/${totalPages})`)

    return NextResponse.json({
      activities: serializedActivities,
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
    console.error('❌ Error fetching public activities:', error)
    return NextResponse.json(
      { 
        error: 'Error obteniendo actividades',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}