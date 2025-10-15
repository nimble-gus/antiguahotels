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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const activityId = params.id

    // Obtener imágenes de la actividad
    const images = await prisma.entityImage.findMany({
      where: {
        entityType: 'ACTIVITY',
        entityId: BigInt(activityId)
      },
      orderBy: [
        { isPrimary: 'desc' }, // Principal primero
        { sortOrder: 'asc' }   // Luego por orden
      ]
    })

    // Formatear para el frontend
    const formattedImages = images.map(image => ({
      id: image.id.toString(),
      imageUrl: image.imageUrl,
      altText: image.altText,
      isPrimary: image.isPrimary,
      sortOrder: image.sortOrder,
      cloudinaryPublicId: image.cloudinaryPublicId,
      createdAt: image.createdAt.toISOString()
    }))

    return NextResponse.json({
      images: formattedImages,
      totalCount: formattedImages.length
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

    // Validaciones
    if (!imageUrl || !cloudinaryPublicId) {
      return NextResponse.json(
        { error: 'URL de imagen y Public ID son requeridos' },
        { status: 400 }
      )
    }

    // Verificar que la actividad existe
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
      await prisma.entityImage.updateMany({
        where: {
          entityType: 'ACTIVITY',
          entityId: BigInt(activityId)
        },
        data: { isPrimary: false }
      })
    }

    // Crear la nueva imagen
    const newImage = await prisma.entityImage.create({
      data: {
        entityType: 'ACTIVITY',
        entityId: BigInt(activityId),
        imageUrl,
        cloudinaryPublicId,
        altText: altText || null,
        isPrimary: isPrimary || false,
        sortOrder: sortOrder || 1
      }
    })

    return NextResponse.json({
      success: true,
      image: {
        id: newImage.id.toString(),
        imageUrl: newImage.imageUrl,
        altText: newImage.altText,
        isPrimary: newImage.isPrimary,
        sortOrder: newImage.sortOrder,
        cloudinaryPublicId: newImage.cloudinaryPublicId,
        createdAt: newImage.createdAt.toISOString()
      }
    })

  } catch (error) {
    console.error('Error creating activity image:', error)
    return NextResponse.json(
      { error: 'Error creando imagen de la actividad' },
      { status: 500 }
    )
  }
}








