import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const hotelId = searchParams.get('hotelId')
    const roomTypeId = searchParams.get('roomTypeId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const blockType = searchParams.get('blockType')

    // Construir filtros
    const where: any = {
      isActive: true
    }

    if (hotelId) {
      where.hotelId = BigInt(hotelId)
    }

    if (roomTypeId) {
      where.roomTypeId = BigInt(roomTypeId)
    }

    if (blockType) {
      where.blockType = blockType
    }

    if (startDate || endDate) {
      where.OR = []
      
      if (startDate && endDate) {
        // Buscar bloques que se superponen con el rango de fechas
        where.OR.push({
          AND: [
            { startDate: { lte: new Date(endDate) } },
            { endDate: { gte: new Date(startDate) } }
          ]
        })
      } else if (startDate) {
        where.OR.push({
          endDate: { gte: new Date(startDate) }
        })
      } else if (endDate) {
        where.OR.push({
          startDate: { lte: new Date(endDate) }
        })
      }
    }

    // Obtener bloques de disponibilidad
    const blocks = await prisma.availabilityBlock.findMany({
      where,
      include: {
        hotel: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        roomType: {
          select: {
            id: true,
            name: true
          }
        },
        adminUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: [
        { startDate: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    // Serializar BigInt
    const serializedBlocks = blocks.map(block => ({
      ...block,
      id: block.id.toString(),
      hotelId: block.hotelId.toString(),
      roomTypeId: block.roomTypeId?.toString() || null,
      createdBy: block.createdBy.toString(),
      startDate: block.startDate.toISOString().split('T')[0],
      endDate: block.endDate.toISOString().split('T')[0],
      createdAt: block.createdAt.toISOString(),
      updatedAt: block.updatedAt.toISOString(),
      hotel: {
        ...block.hotel,
        id: block.hotel.id.toString()
      },
      roomType: block.roomType ? {
        ...block.roomType,
        id: block.roomType.id.toString()
      } : null,
      adminUser: {
        ...block.adminUser,
        id: block.adminUser.id.toString()
      }
    }))

    return NextResponse.json(serializedBlocks)

  } catch (error) {
    console.error('Error fetching availability blocks:', error)
    return NextResponse.json(
      { error: 'Error obteniendo bloques de disponibilidad' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      hotelId,
      roomTypeId,
      startDate,
      endDate,
      blockType,
      reason,
      description
    } = body

    // Validar datos requeridos
    if (!hotelId || !startDate || !endDate || !blockType) {
      return NextResponse.json(
        { error: 'Datos requeridos faltantes' },
        { status: 400 }
      )
    }

    // Validar que la fecha de inicio sea anterior a la fecha de fin
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    if (start >= end) {
      return NextResponse.json(
        { error: 'La fecha de inicio debe ser anterior a la fecha de fin' },
        { status: 400 }
      )
    }

    // Verificar si ya existe un bloque que se superponga
    const overlappingBlock = await prisma.availabilityBlock.findFirst({
      where: {
        hotelId: BigInt(hotelId),
        roomTypeId: roomTypeId ? BigInt(roomTypeId) : null,
        isActive: true,
        OR: [
          {
            AND: [
              { startDate: { lte: end } },
              { endDate: { gte: start } }
            ]
          }
        ]
      }
    })

    if (overlappingBlock) {
      return NextResponse.json(
        { error: 'Ya existe un bloque de disponibilidad que se superpone con estas fechas' },
        { status: 409 }
      )
    }

    // Crear bloque de disponibilidad
    const block = await prisma.availabilityBlock.create({
      data: {
        hotelId: BigInt(hotelId),
        roomTypeId: roomTypeId ? BigInt(roomTypeId) : null,
        startDate: start,
        endDate: end,
        blockType,
        reason,
        description,
        createdBy: BigInt(session.user.id)
      }
    })

    console.log('✅ Availability block created:', block.id.toString())

    return NextResponse.json({
      success: true,
      block: {
        ...block,
        id: block.id.toString(),
        hotelId: block.hotelId.toString(),
        roomTypeId: block.roomTypeId?.toString() || null,
        createdBy: block.createdBy.toString(),
        startDate: block.startDate.toISOString().split('T')[0],
        endDate: block.endDate.toISOString().split('T')[0],
        createdAt: block.createdAt.toISOString(),
        updatedAt: block.updatedAt.toISOString()
      }
    })

  } catch (error) {
    console.error('Error creating availability block:', error)
    return NextResponse.json(
      { error: 'Error creando bloque de disponibilidad' },
      { status: 500 }
    )
  }
}






