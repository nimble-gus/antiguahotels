import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const messageId = params.id

    console.log('📧 Fetching contact message:', messageId)

    const message = await prisma.contactMessage.findUnique({
      where: { id: BigInt(messageId) }
    })

    if (!message) {
      return NextResponse.json({ error: 'Mensaje no encontrado' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: {
        id: message.id.toString(),
        name: message.name,
        email: message.email,
        phone: message.phone,
        subject: message.subject,
        message: message.message,
        preferredContact: message.preferredContact,
        status: message.status,
        isRead: message.isRead,
        response: message.response,
        respondedAt: message.respondedAt?.toISOString(),
        createdAt: message.createdAt.toISOString(),
        updatedAt: message.updatedAt.toISOString()
      }
    })

  } catch (error) {
    console.error('Error fetching contact message:', error)
    return NextResponse.json(
      { error: 'Error obteniendo mensaje de contacto' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const messageId = params.id
    const body = await request.json()
    const { status, isRead, response } = body

    console.log('📧 Updating contact message:', messageId, { status, isRead })

    const updateData: any = {}
    
    if (status !== undefined) {
      updateData.status = status
    }
    
    if (isRead !== undefined) {
      updateData.isRead = isRead
    }
    
    if (response !== undefined) {
      updateData.response = response
      updateData.respondedAt = new Date()
    }

    const message = await prisma.contactMessage.update({
      where: { id: BigInt(messageId) },
      data: updateData
    })

    console.log('✅ Contact message updated:', message.id)

    return NextResponse.json({
      success: true,
      message: {
        id: message.id.toString(),
        name: message.name,
        email: message.email,
        phone: message.phone,
        subject: message.subject,
        message: message.message,
        preferredContact: message.preferredContact,
        status: message.status,
        isRead: message.isRead,
        response: message.response,
        respondedAt: message.respondedAt?.toISOString(),
        createdAt: message.createdAt.toISOString(),
        updatedAt: message.updatedAt.toISOString()
      },
      message: 'Mensaje actualizado exitosamente'
    })

  } catch (error) {
    console.error('Error updating contact message:', error)
    return NextResponse.json(
      { error: 'Error actualizando mensaje de contacto' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Solo Super Admin puede eliminar mensajes' }, { status: 401 })
    }

    const messageId = params.id

    console.log('📧 Deleting contact message:', messageId)

    await prisma.contactMessage.delete({
      where: { id: BigInt(messageId) }
    })

    console.log('✅ Contact message deleted:', messageId)

    return NextResponse.json({
      success: true,
      message: 'Mensaje eliminado exitosamente'
    })

  } catch (error) {
    console.error('Error deleting contact message:', error)
    return NextResponse.json(
      { error: 'Error eliminando mensaje de contacto' },
      { status: 500 }
    )
  }
}


