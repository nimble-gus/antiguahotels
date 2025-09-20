import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('🎯 Fetching featured activities for public site...')

    // Obtener actividades destacadas con sus imágenes principales usando SQL directo
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
        ei.image_url,
        ei.alt_text,
        ei.cloudinary_public_id
      FROM activities a
      LEFT JOIN entity_images ei ON (
        ei.entity_type = 'ACTIVITY' 
        AND ei.entity_id = a.id 
        AND ei.is_primary = 1
      )
      WHERE a.is_active = 1 AND a.is_featured = 1
      ORDER BY a.featured_order ASC
      LIMIT 6
    ` as any[]

    // Formatear datos para el frontend
    const formattedActivities = activitiesWithImages.map(activity => ({
      id: activity.id.toString(),
      title: activity.name,
      description: activity.description || activity.short_description,
      image: activity.image_url || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop',
      location: activity.location || 'Antigua Guatemala',
      duration: activity.duration_hours ? `${activity.duration_hours} horas` : 'Día completo',
      participants: `${activity.min_participants}${activity.max_participants ? `-${activity.max_participants}` : '+'} personas`,
      price: activity.base_price.toString(),
      currency: activity.currency || 'USD',
      // rating y reviews removidos - no se mostrarán
      features: [], // Etiquetas removidas - no se mostrarán
      href: `/activities/${activity.id}`,
      badge: activity.difficulty_level || 'Moderado'
    }))

    console.log(`✅ Found ${formattedActivities.length} featured activities`)

    // Si hay actividades reales, devolverlas
    if (formattedActivities.length > 0) {
      return NextResponse.json({
        activities: formattedActivities,
        totalCount: formattedActivities.length,
        source: 'database'
      })
    }

    // Si no hay actividades destacadas, devolver array vacío
    console.log('ℹ️ No featured activities found in database')
    return NextResponse.json({
      activities: [],
      totalCount: 0,
      source: 'database',
      message: 'No hay actividades marcadas como destacadas'
    })

  } catch (error) {
    console.error('❌ Error fetching featured activities:', error)
    
    // Solo usar fallback si hay error de conexión real
    const mockActivities = [
      {
        id: '1',
        title: 'Tour Volcán Pacaya',
        description: 'Aventura única al volcán activo con guía experto y equipamiento incluido.',
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop',
        location: 'Volcán Pacaya',
        duration: '6 horas',
        participants: '4-12 personas',
        price: '45',
        currency: 'USD',
        // rating y reviews removidos
        features: [], // Etiquetas removidas
        href: '/activities/1',
        badge: 'Aventura'
      },
      {
        id: '2',
        title: 'City Tour Antigua',
        description: 'Recorrido histórico por la ciudad colonial más hermosa de Guatemala.',
        image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&h=300&fit=crop',
        location: 'Antigua Guatemala',
        duration: '4 horas',
        participants: '2-15 personas',
        price: '25',
        currency: 'USD',
        // rating y reviews removidos
        features: [], // Etiquetas removidas
        href: '/activities/2',
        badge: 'Cultural'
      },
      {
        id: '3',
        title: 'Mercado y Cocina Local',
        description: 'Experiencia gastronómica auténtica con clase de cocina tradicional.',
        image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=500&h=300&fit=crop',
        location: 'Antigua Guatemala',
        duration: '5 horas',
        participants: '4-8 personas',
        price: '65',
        currency: 'USD',
        // rating y reviews removidos
        features: [], // Etiquetas removidas
        href: '/activities/3',
        badge: 'Gastronómico'
      }
    ]

    return NextResponse.json({
      activities: mockActivities,
      totalCount: mockActivities.length,
      source: 'fallback',
      error: 'Error de base de datos - usando datos de ejemplo'
    })
  }
}
