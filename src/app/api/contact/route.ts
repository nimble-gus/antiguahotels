import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, subject, message, preferredContact } = body

    console.log('📧 New contact message:', { name, email, subject })

    // Validar datos requeridos
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Nombre, email, asunto y mensaje son requeridos' },
        { status: 400 }
      )
    }

    // Crear mensaje de contacto
    const contactMessage = await prisma.contactMessage.create({
      data: {
        name,
        email,
        phone: phone || null,
        subject,
        message,
        preferredContact: preferredContact || 'email',
        status: 'NEW',
        isRead: false
      }
    })

    console.log('✅ Contact message created:', contactMessage.id)

    // Aquí podrías agregar lógica para enviar notificaciones por email
    // await sendContactNotification(contactMessage)

    return NextResponse.json({
      success: true,
      message: 'Mensaje enviado exitosamente',
      id: contactMessage.id.toString()
    })

  } catch (error) {
    console.error('Error creating contact message:', error)
    return NextResponse.json(
      { error: 'Error enviando mensaje' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    console.log('📧 Fetching contact messages:', { page, limit, status, search })

    // Construir filtros
    const whereClause: any = {}
    
    if (status) {
      whereClause.status = status
    }
    
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Obtener mensajes con paginación
    const [messages, totalCount] = await Promise.all([
      prisma.contactMessage.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.contactMessage.count({ where: whereClause })
    ])

    console.log('✅ Found contact messages:', messages.length)

    const formattedMessages = messages.map(message => ({
      id: message.id.toString(),
      name: message.name,
      email: message.email,
      phone: message.phone,
      subject: message.subject,
      message: message.message,
      preferredContact: message.preferredContact,
      status: message.status,
      isRead: message.isRead,
      createdAt: message.createdAt.toISOString(),
      updatedAt: message.updatedAt.toISOString()
    }))

    return NextResponse.json({
      success: true,
      messages: formattedMessages,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching contact messages:', error)
    return NextResponse.json(
      { error: 'Error obteniendo mensajes de contacto' },
      { status: 500 }
    )
  }
}


