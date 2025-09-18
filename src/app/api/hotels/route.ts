import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateHotelCode } from '@/lib/hotel-utils'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const city = searchParams.get('city') || ''
    const isActive = searchParams.get('active')

    const skip = (page - 1) * limit

    // Construir filtros
    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (city) {
      where.city = { contains: city, mode: 'insensitive' }
    }

    if (isActive !== null && isActive !== '') {
      where.isActive = isActive === 'true'
    }

    // Obtener hoteles con conteo
    const [hotels, totalCount] = await Promise.all([
      prisma.hotel.findMany({
        where,
        include: {
          roomTypes: {
            select: {
              id: true,
              name: true,
              baseRate: true,
              occupancy: true,
              isActive: true,
            }
          },
          _count: {
            select: {
              rooms: true,
              roomTypes: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.hotel.count({ where })
    ])

    // Serializar BigInt
    const serializedHotels = hotels.map(hotel => ({
      ...hotel,
      id: hotel.id.toString(),
      latitude: hotel.latitude?.toString(),
      longitude: hotel.longitude?.toString(),
      createdAt: hotel.createdAt.toISOString(),
      updatedAt: hotel.updatedAt.toISOString(),
      roomTypes: hotel.roomTypes.map(rt => ({
        ...rt,
        id: rt.id.toString(),
        baseRate: rt.baseRate.toString(),
      })),
      _count: {
        rooms: hotel._count.rooms,
        roomTypes: hotel._count.roomTypes,
      }
    }))

    return NextResponse.json({
      hotels: serializedHotels,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      }
    })

  } catch (error) {
    console.error('Error fetching hotels:', error)
    return NextResponse.json(
      { error: 'Error obteniendo hoteles' },
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
      name,
      brand,
      description,
      logoUrl,
      address,
      city,
      country,
      postalCode,
      latitude,
      longitude,
      wazeLink,
      googleMapsLink,
      phone,
      email,
      website,
      checkInTime,
      checkOutTime,
      timezone,
      amenityIds
    } = body

    // Validaciones básicas
    if (!name || !city || !address) {
      return NextResponse.json(
        { error: 'Nombre, ciudad y dirección son requeridos' },
        { status: 400 }
      )
    }

    // Generar código automáticamente
    const generatedCode = await generateHotelCode(name, city)
    console.log(`🏨 Código generado para "${name}": ${generatedCode}`)

    // Crear hotel
    const hotel = await prisma.hotel.create({
      data: {
        name,
        code: generatedCode,
        brand: brand || null,
        description: description || null,
        logoUrl: logoUrl || null,
        address,
        city,
        country: country || 'Guatemala',
        postalCode: postalCode || null,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        wazeLink: wazeLink || null,
        googleMapsLink: googleMapsLink || null,
        phone: phone || null,
        email: email || null,
        website: website || null,
        checkInTime: checkInTime ? new Date(`1970-01-01T${checkInTime}:00.000Z`) : null,
        checkOutTime: checkOutTime ? new Date(`1970-01-01T${checkOutTime}:00.000Z`) : null,
        timezone: timezone || 'America/Guatemala',
      },
      include: {
        roomTypes: true,
        _count: {
          select: {
            rooms: true,
            roomTypes: true,
          }
        }
      }
    })

    // Agregar amenidades si se proporcionan
    if (amenityIds && amenityIds.length > 0) {
      await prisma.entityAmenity.createMany({
        data: amenityIds.map((amenityId: string) => ({
          entityType: 'HOTEL' as const,
          entityId: hotel.id,
          amenityId: BigInt(amenityId),
        }))
      })
    }

    // Serializar respuesta
    const serializedHotel = {
      ...hotel,
      id: hotel.id.toString(),
      latitude: hotel.latitude?.toString(),
      longitude: hotel.longitude?.toString(),
      createdAt: hotel.createdAt.toISOString(),
      updatedAt: hotel.updatedAt.toISOString(),
      roomTypes: hotel.roomTypes.map(rt => ({
        ...rt,
        id: rt.id.toString(),
        hotelId: rt.hotelId.toString(),
        baseRate: rt.baseRate.toString(),
        createdAt: rt.createdAt.toISOString(),
        updatedAt: rt.updatedAt.toISOString(),
      })),
    }

    return NextResponse.json(serializedHotel)

  } catch (error) {
    console.error('Error creating hotel:', error)
    return NextResponse.json(
      { error: 'Error creando hotel' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    console.log('🔍 Update hotel request body:', JSON.stringify(body, null, 2))
    
    const { id, amenityIds, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID requerido' },
        { status: 400 }
      )
    }

    console.log('🔍 Update data before processing:', updateData)

    // Filtrar solo los campos que se pueden actualizar
    const allowedFields = [
      'name', 'code', 'brand', 'description', 'logoUrl', 'address', 
      'city', 'country', 'postalCode', 'latitude', 'longitude',
      'wazeLink', 'googleMapsLink', 'phone', 'email', 'website',
      'checkInTime', 'checkOutTime', 'rating', 'timezone', 'isActive'
    ]

    const data: any = {}
    
    // Solo incluir campos permitidos
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        data[field] = updateData[field]
      }
    })

    // Conversiones especiales
    if (data.latitude) data.latitude = parseFloat(data.latitude)
    if (data.longitude) data.longitude = parseFloat(data.longitude)
    if (data.rating) data.rating = parseFloat(data.rating)
    
    // Arreglar formato de tiempo
    if (data.checkInTime && data.checkInTime !== '') {
      // Si viene como "15:00", convertir correctamente
      if (typeof data.checkInTime === 'string' && data.checkInTime.match(/^\d{2}:\d{2}$/)) {
        data.checkInTime = new Date(`1970-01-01T${data.checkInTime}:00.000Z`)
      } else {
        delete data.checkInTime // No actualizar si el formato es inválido
      }
    }
    
    if (data.checkOutTime && data.checkOutTime !== '') {
      if (typeof data.checkOutTime === 'string' && data.checkOutTime.match(/^\d{2}:\d{2}$/)) {
        data.checkOutTime = new Date(`1970-01-01T${data.checkOutTime}:00.000Z`)
      } else {
        delete data.checkOutTime
      }
    }

    console.log('🔍 Final data to update:', JSON.stringify(data, null, 2))

    // Actualizar hotel
    const hotel = await prisma.hotel.update({
      where: { id: BigInt(id) },
      data,
      include: {
        roomTypes: true,
        _count: {
          select: {
            rooms: true,
            roomTypes: true,
          }
        }
      }
    })

    // Actualizar amenidades si se proporcionan
    if (amenityIds !== undefined) {
      // Eliminar amenidades existentes
      await prisma.entityAmenity.deleteMany({
        where: {
          entityType: 'HOTEL',
          entityId: BigInt(id),
        }
      })

      // Agregar nuevas amenidades
      if (amenityIds.length > 0) {
        await prisma.entityAmenity.createMany({
          data: amenityIds.map((amenityId: string) => ({
            entityType: 'HOTEL' as const,
            entityId: BigInt(id),
            amenityId: BigInt(amenityId),
          }))
        })
      }
    }

    // Serializar respuesta
    const serializedHotel = {
      ...hotel,
      id: hotel.id.toString(),
      latitude: hotel.latitude?.toString(),
      longitude: hotel.longitude?.toString(),
      createdAt: hotel.createdAt.toISOString(),
      updatedAt: hotel.updatedAt.toISOString(),
      roomTypes: hotel.roomTypes.map(rt => ({
        ...rt,
        id: rt.id.toString(),
        hotelId: rt.hotelId.toString(),
        baseRate: rt.baseRate.toString(),
        createdAt: rt.createdAt.toISOString(),
        updatedAt: rt.updatedAt.toISOString(),
      })),
    }

    return NextResponse.json(serializedHotel)

  } catch (error) {
    console.error('Error updating hotel:', error)
    return NextResponse.json(
      { error: 'Error actualizando hotel' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
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

    if (!id) {
      return NextResponse.json(
        { error: 'ID requerido' },
        { status: 400 }
      )
    }

    // Verificar si el hotel tiene reservaciones activas
    const activeBookings = await prisma.accommodationStay.count({
      where: {
        hotelId: BigInt(id),
        reservationItem: {
          reservation: {
            status: { in: ['PENDING', 'CONFIRMED'] }
          }
        }
      }
    })

    if (activeBookings > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar el hotel porque tiene reservaciones activas' },
        { status: 400 }
      )
    }

    // Eliminar hotel (cascade eliminará relacionados)
    await prisma.hotel.delete({
      where: { id: BigInt(id) }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error deleting hotel:', error)
    return NextResponse.json(
      { error: 'Error eliminando hotel' },
      { status: 500 }
    )
  }
}
