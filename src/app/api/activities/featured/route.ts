import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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
        { error: 'ID requerido' },
        { status: 400 }
      )
    }

    const { isFeatured, featuredOrder } = body

    console.log('🌟 Updating featured status:', { id, isFeatured, featuredOrder })

    // Solo actualizar campos de featured
    const activity = await prisma.activity.update({
      where: { id: BigInt(id) },
      data: {
        isFeatured: isFeatured ?? false,
        featuredOrder: featuredOrder || null,
      },
      select: {
        id: true,
        name: true,
        isFeatured: true,
        featuredOrder: true
      }
    })

    console.log('✅ Featured status updated successfully')

    return NextResponse.json({
      success: true,
      activity: {
        ...activity,
        id: activity.id.toString()
      }
    })

  } catch (error) {
    console.error('❌ Error updating featured status:', error)
    return NextResponse.json(
      { error: 'Error actualizando estado destacado' },
      { status: 500 }
    )
  }
}








