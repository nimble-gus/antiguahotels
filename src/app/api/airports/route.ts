import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const active = searchParams.get('active')
    const search = searchParams.get('search') || ''

    // Construir filtros
    const where: any = {}
    
    if (active === 'true') {
      where.isActive = true
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { iata: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { country: { contains: search, mode: 'insensitive' } },
      ]
    }

    console.log('🛬 Fetching airports with filters:', { active, search, where })

    const airports = await prisma.airport.findMany({
      where,
      orderBy: { name: 'asc' }
    })

    // Serializar BigInt
    const serializedAirports = airports.map(airport => ({
      ...airport,
      id: airport.id.toString(),
      createdAt: airport.createdAt.toISOString(),
    }))

    console.log('🛬 Found airports:', serializedAirports.length)

    return NextResponse.json({
      airports: serializedAirports
    })

  } catch (error) {
    console.error('Error fetching airports:', error)
    return NextResponse.json(
      { error: 'Error obteniendo aeropuertos' },
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
    console.log('🛬 Creating airport:', body)

    const {
      iata,
      name,
      city,
      country,
      isActive
    } = body

    // Validaciones básicas
    if (!name) {
      return NextResponse.json(
        { error: 'Nombre del aeropuerto es requerido' },
        { status: 400 }
      )
    }

    // Crear aeropuerto
    const result = await prisma.airport.create({
      data: {
        iata: iata || null,
        name,
        city,
        country,
        isActive: isActive !== false,
      }
    })

    console.log('✅ Airport created successfully:', result.name)

    return NextResponse.json({
      success: true,
      airport: {
        ...result,
        id: result.id.toString(),
        createdAt: result.createdAt.toISOString(),
      },
      message: 'Aeropuerto creado exitosamente'
    })

  } catch (error) {
    console.error('Error creating airport:', error)
    return NextResponse.json(
      { error: 'Error creando aeropuerto' },
      { status: 500 }
    )
  }
}
