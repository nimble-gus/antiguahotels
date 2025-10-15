import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const reportType = searchParams.get('type') || 'all'
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const limit = parseInt(searchParams.get('limit') || '10')

    console.log('📊 Generating detailed report:', { reportType, dateFrom, dateTo, limit })

    // Calcular fechas por defecto
    const today = new Date()
    const defaultDateFrom = dateFrom ? new Date(dateFrom) : new Date(today.getFullYear(), today.getMonth(), 1)
    const defaultDateTo = dateTo ? new Date(dateTo) : new Date(today.getFullYear(), today.getMonth() + 1, 0)

    switch (reportType) {
      case 'activities':
        return await getTopActivities(defaultDateFrom, defaultDateTo, limit)
      case 'room-types':
        return await getTopRoomTypes(defaultDateFrom, defaultDateTo, limit)
      case 'hotels':
        return await getTopHotels(defaultDateFrom, defaultDateTo, limit)
      case 'packages':
        return await getTopPackages(defaultDateFrom, defaultDateTo, limit)
      case 'all':
        return await getAllDetailedReports(defaultDateFrom, defaultDateTo, limit)
      default:
        return NextResponse.json({ error: 'Tipo de reporte no válido' }, { status: 400 })
    }

  } catch (error) {
    console.error('Error generating detailed report:', error)
    return NextResponse.json(
      { error: 'Error generando reporte detallado' },
      { status: 500 }
    )
  }
}

// Actividades más populares
async function getTopActivities(dateFrom: Date, dateTo: Date, limit: number) {
  const topActivities = await getTopActivitiesData(dateFrom, dateTo, limit)
  
  return NextResponse.json({
    reportType: 'activities',
    period: { from: dateFrom.toISOString(), to: dateTo.toISOString() },
    topActivities
  })
}

// Tipos de habitación más reservados
async function getTopRoomTypes(dateFrom: Date, dateTo: Date, limit: number) {
  const topRoomTypes = await getTopRoomTypesData(dateFrom, dateTo, limit)
  
  return NextResponse.json({
    reportType: 'room-types',
    period: { from: dateFrom.toISOString(), to: dateTo.toISOString() },
    topRoomTypes
  })
}

// Hoteles más populares
async function getTopHotels(dateFrom: Date, dateTo: Date, limit: number) {
  const topHotels = await getTopHotelsData(dateFrom, dateTo, limit)
  
  return NextResponse.json({
    reportType: 'hotels',
    period: { from: dateFrom.toISOString(), to: dateTo.toISOString() },
    topHotels
  })
}

// Paquetes más populares
async function getTopPackages(dateFrom: Date, dateTo: Date, limit: number) {
  const topPackages = await getTopPackagesData(dateFrom, dateTo, limit)
  
  return NextResponse.json({
    reportType: 'packages',
    period: { from: dateFrom.toISOString(), to: dateTo.toISOString() },
    topPackages
  })
}

// Reporte completo con todos los detalles
async function getAllDetailedReports(dateFrom: Date, dateTo: Date, limit: number) {
  console.log('📊 Generating comprehensive detailed report...')

  // Generar todos los reportes en paralelo directamente
  const [
    topActivities,
    topRoomTypes,
    topHotels,
    topPackages
  ] = await Promise.all([
    getTopActivitiesData(dateFrom, dateTo, limit),
    getTopRoomTypesData(dateFrom, dateTo, limit),
    getTopHotelsData(dateFrom, dateTo, limit),
    getTopPackagesData(dateFrom, dateTo, limit)
  ])

  return NextResponse.json({
    reportType: 'all',
    period: { from: dateFrom.toISOString(), to: dateTo.toISOString() },
    topActivities,
    topRoomTypes,
    topHotels,
    topPackages
  })
}

// Funciones auxiliares que retornan solo los datos, no NextResponse
async function getTopActivitiesData(dateFrom: Date, dateTo: Date, limit: number) {
  console.log('🎯 Generating top activities data...')

  const topActivities = await prisma.activityBooking.groupBy({
    by: ['activityId'],
    _count: { id: true },
    _sum: { participants: true },
    where: {
      createdAt: { gte: dateFrom, lte: dateTo }
    },
    orderBy: { _count: { id: 'desc' } },
    take: limit
  })

  // Obtener detalles de las actividades
  const activitiesWithDetails = await Promise.all(
    topActivities.map(async (item: any) => {
      const activity = await prisma.activity.findUnique({
        where: { id: item.activityId },
        select: {
          name: true,
          description: true,
          basePrice: true,
          durationHours: true,
          location: true
        }
      })

      // Calcular ingresos totales
      const totalRevenue = await prisma.reservationItem.aggregate({
        _sum: { amount: true },
        where: {
          itemType: 'ACTIVITY',
          activityBooking: {
            activityId: item.activityId
          },
          createdAt: { gte: dateFrom, lte: dateTo }
        }
      })

      return {
        activityId: item.activityId.toString(),
        name: activity?.name || 'Actividad Desconocida',
        description: activity?.description || '',
        location: activity?.location || '',
        basePrice: activity?.basePrice?.toString() || '0',
        duration: activity?.durationHours || 0,
        bookings: item._count.id,
        totalParticipants: item._sum.participants || 0,
        totalRevenue: (totalRevenue._sum.amount || 0).toString(),
        averageParticipants: ((item._sum.participants || 0) / item._count.id).toFixed(1)
      }
    })
  )

  return activitiesWithDetails
}

async function getTopRoomTypesData(dateFrom: Date, dateTo: Date, limit: number) {
  console.log('🏨 Generating top room types data...')

  const topRoomTypes = await prisma.accommodationStay.groupBy({
    by: ['roomTypeId'],
    _count: { id: true },
    _sum: { nights: true },
    where: {
      createdAt: { gte: dateFrom, lte: dateTo }
    },
    orderBy: { _count: { id: 'desc' } },
    take: limit
  })

  // Obtener detalles de los tipos de habitación
  const roomTypesWithDetails = await Promise.all(
    topRoomTypes.map(async (item: any) => {
      const roomType = await prisma.roomType.findUnique({
        where: { id: item.roomTypeId },
        include: {
          hotel: {
            select: { name: true }
          },
          _count: {
            select: { rooms: true }
          }
        }
      })

      // Calcular ingresos totales
      const totalRevenue = await prisma.reservationItem.aggregate({
        _sum: { amount: true },
        where: {
          itemType: 'ACCOMMODATION',
          accommodationStay: {
            roomTypeId: item.roomTypeId
          },
          createdAt: { gte: dateFrom, lte: dateTo }
        }
      })

      // Calcular tasa de ocupación
      const totalRooms = roomType?._count.rooms || 0
      const daysInPeriod = Math.ceil((dateTo.getTime() - dateFrom.getTime()) / (1000 * 60 * 60 * 24))
      const totalPossibleNights = totalRooms * daysInPeriod
      const occupancyRate = totalPossibleNights > 0 ? ((item._sum.nights || 0) / totalPossibleNights) * 100 : 0

      return {
        roomTypeId: item.roomTypeId.toString(),
        name: roomType?.name || 'Tipo Desconocido',
        hotelName: roomType?.hotel.name || 'Hotel Desconocido',
        baseRate: roomType?.baseRate?.toString() || '0',
        capacity: roomType?.occupancy || 0,
        totalRooms: totalRooms,
        bookings: item._count.id,
        totalNights: item._sum.nights || 0,
        totalRevenue: (totalRevenue._sum.amount || 0).toString(),
        occupancyRate: occupancyRate.toFixed(2),
        averageNights: ((item._sum.nights || 0) / item._count.id).toFixed(1)
      }
    })
  )

  return roomTypesWithDetails
}

async function getTopHotelsData(dateFrom: Date, dateTo: Date, limit: number) {
  console.log('🏨 Generating top hotels data...')

  const topHotels = await prisma.accommodationStay.groupBy({
    by: ['hotelId'],
    _count: { id: true },
    _sum: { nights: true },
    where: {
      createdAt: { gte: dateFrom, lte: dateTo }
    },
    orderBy: { _count: { id: 'desc' } },
    take: limit
  })

  // Obtener detalles de los hoteles
  const hotelsWithDetails = await Promise.all(
    topHotels.map(async (item: any) => {
      const hotel = await prisma.hotel.findUnique({
        where: { id: item.hotelId },
        select: {
          name: true,
          address: true,
          city: true,
          country: true,
          totalRooms: true,
          rating: true,
          _count: {
            select: { roomTypes: true }
          }
        }
      })

      // Calcular ingresos totales del hotel
      const totalRevenue = await prisma.reservationItem.aggregate({
        _sum: { amount: true },
        where: {
          itemType: 'ACCOMMODATION',
          accommodationStay: {
            hotelId: item.hotelId
          },
          createdAt: { gte: dateFrom, lte: dateTo }
        }
      })

      // Calcular tasa de ocupación general del hotel
      const totalRooms = hotel?.totalRooms || 0
      const daysInPeriod = Math.ceil((dateTo.getTime() - dateFrom.getTime()) / (1000 * 60 * 60 * 24))
      const totalPossibleNights = totalRooms * daysInPeriod
      const occupancyRate = totalPossibleNights > 0 ? ((item._sum.nights || 0) / totalPossibleNights) * 100 : 0

      // Obtener huéspedes únicos
      const uniqueGuests = await prisma.reservation.findMany({
        where: {
          reservationItems: {
            some: {
              accommodationStay: {
                hotelId: item.hotelId
              }
            }
          },
          createdAt: { gte: dateFrom, lte: dateTo }
        },
        select: { guestId: true },
        distinct: ['guestId']
      })

      return {
        hotelId: item.hotelId.toString(),
        name: hotel?.name || 'Hotel Desconocido',
        address: hotel?.address || '',
        city: hotel?.city || '',
        country: hotel?.country || '',
        starRating: hotel?.rating || 0,
        totalRooms: totalRooms,
        roomTypes: hotel?._count.roomTypes || 0,
        bookings: item._count.id,
        totalNights: item._sum.nights || 0,
        totalRevenue: (totalRevenue._sum.amount || 0).toString(),
        occupancyRate: occupancyRate.toFixed(2),
        uniqueGuests: uniqueGuests.length,
        averageNights: ((item._sum.nights || 0) / item._count.id).toFixed(1)
      }
    })
  )

  return hotelsWithDetails
}

async function getTopPackagesData(dateFrom: Date, dateTo: Date, limit: number) {
  console.log('📦 Generating top packages data...')

  const topPackages = await prisma.packageBooking.groupBy({
    by: ['packageId'],
    _count: { id: true },
    _sum: { pax: true },
    where: {
      createdAt: { gte: dateFrom, lte: dateTo }
    },
    orderBy: { _count: { id: 'desc' } },
    take: limit
  })

  // Obtener detalles de los paquetes
  const packagesWithDetails = await Promise.all(
    topPackages.map(async (item: any) => {
      const packageData = await prisma.package.findUnique({
        where: { id: item.packageId },
        select: {
          name: true,
          description: true,
          durationDays: true,
          basePrice: true,
          capacity: true,
          minParticipants: true,
          _count: {
            select: {
              packageHotels: true,
              packageActivities: true
            }
          }
        }
      })

      // Calcular ingresos totales
      const totalRevenue = await prisma.reservationItem.aggregate({
        _sum: { amount: true },
        where: {
          itemType: 'PACKAGE',
          packageBooking: {
            packageId: item.packageId
          },
          createdAt: { gte: dateFrom, lte: dateTo }
        }
      })

      return {
        packageId: item.packageId.toString(),
        name: packageData?.name || 'Paquete Desconocido',
        description: packageData?.description || '',
        duration: packageData?.durationDays || 0,
        fixedPrice: packageData?.basePrice?.toString() || '0',
        fixedCapacity: packageData?.capacity || 0,
        minParticipants: packageData?.minParticipants || 0,
        includedHotels: packageData?._count.packageHotels || 0,
        includedActivities: packageData?._count.packageActivities || 0,
        bookings: item._count.id,
        totalParticipants: item._sum.pax || 0,
        totalRevenue: (totalRevenue._sum.amount || 0).toString(),
        averageParticipants: ((item._sum.pax || 0) / item._count.id).toFixed(1)
      }
    })
  )

  return packagesWithDetails
}
