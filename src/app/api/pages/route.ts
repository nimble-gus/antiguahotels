import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const pageKey = searchParams.get('key')
    const isPublic = searchParams.get('public') === 'true'

    console.log('📄 Fetching page content:', { pageKey, isPublic })

    let whereClause: any = { isActive: true }
    
    if (pageKey) {
      whereClause.pageKey = pageKey
    }

    // Si es una consulta pública, no necesitamos autenticación
    if (!isPublic) {
      const session = await getServerSession(authOptions)
      
      if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
      }
    }

    const pages = await prisma.pageContent.findMany({
      where: whereClause,
      orderBy: { pageKey: 'asc' }
    })

    console.log('✅ Found pages:', pages.length)

    // Si se solicita una página específica, devolver solo esa
    if (pageKey) {
      const page = pages[0]
      if (!page) {
        return NextResponse.json({ error: 'Página no encontrada' }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        page: {
          id: page.id.toString(),
          pageKey: page.pageKey,
          pageTitle: page.pageTitle,
          pageDescription: page.pageDescription,
          content: page.content,
          isActive: page.isActive,
          createdAt: page.createdAt.toISOString(),
          updatedAt: page.updatedAt.toISOString()
        }
      })
    }

    // Devolver todas las páginas
    const formattedPages = pages.map(page => ({
      id: page.id.toString(),
      pageKey: page.pageKey,
      pageTitle: page.pageTitle,
      pageDescription: page.pageDescription,
      content: page.content,
      isActive: page.isActive,
      createdAt: page.createdAt.toISOString(),
      updatedAt: page.updatedAt.toISOString()
    }))

    return NextResponse.json({
      success: true,
      pages: formattedPages,
      count: pages.length
    })

  } catch (error) {
    console.error('Error fetching page content:', error)
    return NextResponse.json(
      { error: 'Error obteniendo contenido de páginas' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { pageKey, pageTitle, pageDescription, content, isActive = true } = body

    console.log('📄 Creating/updating page content:', { pageKey, pageTitle })

    // Validar datos requeridos
    if (!pageKey || !pageTitle || !content) {
      return NextResponse.json(
        { error: 'pageKey, pageTitle y content son requeridos' },
        { status: 400 }
      )
    }

    // Crear o actualizar contenido de página
    const page = await prisma.pageContent.upsert({
      where: { pageKey },
      update: {
        pageTitle,
        pageDescription,
        content,
        isActive,
        updatedBy: session.user.id ? BigInt(session.user.id) : null
      },
      create: {
        pageKey,
        pageTitle,
        pageDescription,
        content,
        isActive,
        createdBy: session.user.id ? BigInt(session.user.id) : null,
        updatedBy: session.user.id ? BigInt(session.user.id) : null
      }
    })

    console.log('✅ Page content saved:', page.pageKey)

    return NextResponse.json({
      success: true,
      page: {
        id: page.id.toString(),
        pageKey: page.pageKey,
        pageTitle: page.pageTitle,
        pageDescription: page.pageDescription,
        content: page.content,
        isActive: page.isActive,
        createdAt: page.createdAt.toISOString(),
        updatedAt: page.updatedAt.toISOString()
      },
      message: 'Contenido de página guardado exitosamente'
    })

  } catch (error) {
    console.error('Error saving page content:', error)
    return NextResponse.json(
      { error: 'Error guardando contenido de página' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { id, pageKey, pageTitle, pageDescription, content, isActive } = body

    console.log('📄 Updating page content:', { id, pageKey })

    if (!id) {
      return NextResponse.json(
        { error: 'ID es requerido' },
        { status: 400 }
      )
    }

    const page = await prisma.pageContent.update({
      where: { id: BigInt(id) },
      data: {
        pageKey,
        pageTitle,
        pageDescription,
        content,
        isActive,
        updatedBy: session.user.id ? BigInt(session.user.id) : null
      }
    })

    console.log('✅ Page content updated:', page.pageKey)

    return NextResponse.json({
      success: true,
      page: {
        id: page.id.toString(),
        pageKey: page.pageKey,
        pageTitle: page.pageTitle,
        pageDescription: page.pageDescription,
        content: page.content,
        isActive: page.isActive,
        createdAt: page.createdAt.toISOString(),
        updatedAt: page.updatedAt.toISOString()
      },
      message: 'Contenido de página actualizado exitosamente'
    })

  } catch (error) {
    console.error('Error updating page content:', error)
    return NextResponse.json(
      { error: 'Error actualizando contenido de página' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Solo Super Admin puede eliminar contenido de páginas' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID es requerido' },
        { status: 400 }
      )
    }

    console.log('📄 Deleting page content:', id)

    await prisma.pageContent.delete({
      where: { id: BigInt(id) }
    })

    console.log('✅ Page content deleted:', id)

    return NextResponse.json({
      success: true,
      message: 'Contenido de página eliminado exitosamente'
    })

  } catch (error) {
    console.error('Error deleting page content:', error)
    return NextResponse.json(
      { error: 'Error eliminando contenido de página' },
      { status: 500 }
    )
  }
}

