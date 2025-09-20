import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let connection
  try {
    const activityId = params.id
    console.log('📸 Fetching images for activity:', activityId)

    // Usar consulta SQL directa con Prisma
    const images = await prisma.$queryRaw`
      SELECT 
        id, 
        image_url, 
        alt_text, 
        is_primary, 
        display_order, 
        cloudinary_public_id, 
        created_at 
      FROM entity_images 
      WHERE entity_type = 'ACTIVITY' AND entity_id = ${BigInt(activityId)}
      ORDER BY is_primary DESC, display_order ASC
    `

    const formattedImages = (images as any[]).map(row => ({
      id: row.id.toString(),
      imageUrl: row.image_url,
      altText: row.alt_text,
      isPrimary: row.is_primary === 1,
      sortOrder: row.display_order,
      cloudinaryPublicId: row.cloudinary_public_id,
      createdAt: row.created_at
    }))

    console.log('📸 Found images:', formattedImages.length)

    return NextResponse.json({
      images: formattedImages,
      totalCount: formattedImages.length
    })

  } catch (error) {
    console.error('❌ Error fetching activity images:', error)
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
  let connection
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

    // Verificar que la actividad existe usando Prisma
    const activity = await prisma.activity.findUnique({
      where: { id: BigInt(activityId) }
    })

    if (!activity) {
      return NextResponse.json(
        { error: 'Actividad no encontrada' },
        { status: 404 }
      )
    }

    // Si es imagen principal, quitar el flag de las demás
    if (isPrimary) {
      await prisma.$executeRaw`
        UPDATE entity_images 
        SET is_primary = 0 
        WHERE entity_type = 'ACTIVITY' AND entity_id = ${BigInt(activityId)}
      `
    }

    // Insertar nueva imagen usando SQL directo
    const result = await prisma.$executeRaw`
      INSERT INTO entity_images 
        (entity_type, entity_id, image_url, cloudinary_public_id, alt_text, is_primary, display_order, created_at) 
      VALUES ('ACTIVITY', ${BigInt(activityId)}, ${imageUrl}, ${cloudinaryPublicId}, ${altText || null}, ${isPrimary ? 1 : 0}, ${sortOrder || 1}, NOW())
    `

    // Obtener el ID de la imagen insertada
    const [insertedImage] = await prisma.$queryRaw`
      SELECT * FROM entity_images 
      WHERE entity_type = 'ACTIVITY' AND entity_id = ${BigInt(activityId)}
      ORDER BY created_at DESC 
      LIMIT 1
    ` as any[]

    console.log('✅ Image added successfully')

    return NextResponse.json({
      success: true,
      image: {
        id: insertedImage.id.toString(),
        imageUrl: insertedImage.image_url,
        cloudinaryPublicId: insertedImage.cloudinary_public_id,
        altText: insertedImage.alt_text,
        isPrimary: insertedImage.is_primary === 1,
        sortOrder: insertedImage.display_order,
        createdAt: insertedImage.created_at
      }
    })

  } catch (error) {
    console.error('❌ Error creating activity image:', error)
    return NextResponse.json(
      { error: 'Error creando imagen de la actividad' },
      { status: 500 }
    )
  }
}
