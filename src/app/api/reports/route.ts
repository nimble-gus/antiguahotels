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
    const reportType = searchParams.get('type') || 'overview'
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const period = searchParams.get('period') || 'month' // month, quarter, year

    console.log('📊 Generating report:', { reportType, dateFrom, dateTo, period })

    // Calcular fechas por defecto
    const today = new Date()
    const defaultDateFrom = dateFrom ? new Date(dateFrom) : new Date(today.getFullYear(), today.getMonth(), 1)
    const defaultDateTo = dateTo ? new Date(dateTo) : new Date(today.getFullYear(), today.getMonth() + 1, 0)

    switch (reportType) {
      case 'overview':
        return await generateOverviewReport(defaultDateFrom, defaultDateTo)
      case 'revenue':
        return await generateRevenueReport(defaultDateFrom, defaultDateTo, period)
      case 'occupancy':
        return await generateOccupancyReport(defaultDateFrom, defaultDateTo)
      case 'guests':
        return await generateGuestAnalytics(defaultDateFrom, defaultDateTo)
      case 'services':
        return await generateServicePerformance(defaultDateFrom, defaultDateTo)
      default:
        return NextResponse.json({ error: 'Tipo de reporte no válido' }, { status: 400 })
    }

  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json(
      { error: 'Error generando reporte' },
      { status: 500 }
    )
  }
}

// Reporte General de Resumen
async function generateOverviewReport(dateFrom: Date, dateTo: Date) {
  console.log('📊 Generating overview report...')

  const [
    totalReservations,
    totalRevenue,
    totalGuests,
    activeHotels,
    averageStayDuration,
    topServices,
    recentActivity
  ] = await Promise.all([
    // Total de reservaciones en el período
    prisma.reservation.count({
      where: {
        createdAt: { gte: dateFrom, lte: dateTo },
        status: { not: 'CANCELLED' }
      }
    }),

    // Ingresos totales
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: {
        status: 'PAID',
        processedAt: { gte: dateFrom, lte: dateTo }
      }
    }),

    // Total de huéspedes únicos
    prisma.guest.count({
      where: {
        createdAt: { gte: dateFrom, lte: dateTo }
      }
    }),

    // Hoteles activos
    prisma.hotel.count({
      where: { isActive: true }
    }),

    // Duración promedio de estadía
    prisma.accommodationStay.aggregate({
      _avg: { nights: true },
      where: {
        createdAt: { gte: dateFrom, lte: dateTo }
      }
    }),

    // Servicios más populares
    prisma.reservationItem.groupBy({
      by: ['itemType'],
      _count: { id: true },
      _sum: { amount: true },
      where: {
        createdAt: { gte: dateFrom, lte: dateTo }
      },
      orderBy: { _count: { id: 'desc' } }
    }),

    // Actividad reciente
    prisma.reservation.findMany({
      take: 10,
      where: {
        createdAt: { gte: dateFrom, lte: dateTo }
      },
      include: {
        guest: {
          select: { firstName: true, lastName: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  ])

  return NextResponse.json({
    reportType: 'overview',
    period: { from: dateFrom.toISOString(), to: dateTo.toISOString() },
    summary: {
      totalReservations,
      totalRevenue: (totalRevenue._sum.amount || 0).toString(),
      totalGuests,
      activeHotels,
      averageStayDuration: (averageStayDuration._avg.nights || 0).toFixed(1)
    },
    topServices: topServices.map(service => ({
      type: service.itemType,
      count: service._count.id,
      revenue: (service._sum.amount || 0).toString()
    })),
    recentActivity: recentActivity.map(reservation => ({
      id: reservation.id.toString(),
      confirmationNumber: reservation.confirmationNumber,
      guestName: `${reservation.guest.firstName} ${reservation.guest.lastName}`,
      status: reservation.status,
      totalAmount: reservation.totalAmount.toString(),
      createdAt: reservation.createdAt.toISOString()
    }))
  })
}

// Reporte de Ingresos
async function generateRevenueReport(dateFrom: Date, dateTo: Date, period: string) {
  console.log('💰 Generating revenue report...')

  // Ingresos por tipo de servicio
  const revenueByService = await prisma.reservationItem.groupBy({
    by: ['itemType'],
    _sum: { amount: true },
    _count: { id: true },
    where: {
      createdAt: { gte: dateFrom, lte: dateTo }
    }
  })

  // Ingresos por mes
  const monthlyRevenue = await prisma.payment.findMany({
    where: {
      status: 'PAID',
      processedAt: { gte: dateFrom, lte: dateTo }
    },
    select: {
      amount: true,
      currency: true,
      processedAt: true
    }
  })

  // Procesar datos por mes
  const revenueByMonth = []
  const months = []
  for (let d = new Date(dateFrom); d <= dateTo; d.setMonth(d.getMonth() + 1)) {
    months.push(new Date(d))
  }

  for (const month of months) {
    const monthStart = new Date(month.getFullYear(), month.getMonth(), 1)
    const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0)
    
    const monthPayments = monthlyRevenue.filter(payment => {
      const paymentDate = new Date(payment.processedAt!)
      return paymentDate >= monthStart && paymentDate <= monthEnd
    })

    const monthTotal = monthPayments.reduce((sum, payment) => 
      sum + parseFloat(payment.amount.toString()), 0
    )

    revenueByMonth.push({
      month: month.toISOString().substring(0, 7), // YYYY-MM
      monthName: month.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }),
      revenue: monthTotal.toFixed(2),
      transactions: monthPayments.length
    })
  }

  return NextResponse.json({
    reportType: 'revenue',
    period: { from: dateFrom.toISOString(), to: dateTo.toISOString() },
    revenueByService: revenueByService.map(item => ({
      service: item.itemType,
      revenue: (item._sum.amount || 0).toString(),
      transactions: item._count.id
    })),
    revenueByMonth,
    totalRevenue: monthlyRevenue.reduce((sum, payment) => 
      sum + parseFloat(payment.amount.toString()), 0
    ).toFixed(2)
  })
}

// Reporte de Ocupación
async function generateOccupancyReport(dateFrom: Date, dateTo: Date) {
  console.log('🏨 Generating occupancy report...')

  // Ocupación por hotel
  const occupancyByHotel = await prisma.accommodationStay.groupBy({
    by: ['hotelId'],
    _count: { id: true },
    _sum: { nights: true },
    where: {
      checkInDate: { gte: dateFrom },
      checkOutDate: { lte: dateTo }
    }
  })

  // Obtener información de hoteles
  const hotelsData = await Promise.all(
    occupancyByHotel.map(async (item) => {
      const hotel = await prisma.hotel.findUnique({
        where: { id: item.hotelId },
        select: { name: true, totalRooms: true }
      })
      
      const totalNights = item._sum.nights || 0
      const daysInPeriod = Math.ceil((dateTo.getTime() - dateFrom.getTime()) / (1000 * 60 * 60 * 24))
      const totalPossibleNights = (hotel?.totalRooms || 0) * daysInPeriod
      const occupancyRate = totalPossibleNights > 0 ? (totalNights / totalPossibleNights) * 100 : 0

      return {
        hotelId: item.hotelId.toString(),
        hotelName: hotel?.name || 'Hotel Desconocido',
        totalRooms: hotel?.totalRooms || 0,
        reservations: item._count.id,
        totalNights,
        occupancyRate: occupancyRate.toFixed(2)
      }
    })
  )

  return NextResponse.json({
    reportType: 'occupancy',
    period: { from: dateFrom.toISOString(), to: dateTo.toISOString() },
    occupancyByHotel: hotelsData,
    averageOccupancy: (
      hotelsData.reduce((sum, hotel) => sum + parseFloat(hotel.occupancyRate), 0) / 
      (hotelsData.length || 1)
    ).toFixed(2)
  })
}

// Análisis de Huéspedes
async function generateGuestAnalytics(dateFrom: Date, dateTo: Date) {
  console.log('👥 Generating guest analytics...')

  const [
    newGuests,
    returningGuests,
    guestsByCountry,
    averageSpending
  ] = await Promise.all([
    // Huéspedes nuevos
    prisma.guest.count({
      where: {
        createdAt: { gte: dateFrom, lte: dateTo }
      }
    }),

    // Huéspedes que regresan
    prisma.guest.count({
      where: {
        createdAt: { lt: dateFrom },
        reservations: {
          some: {
            createdAt: { gte: dateFrom, lte: dateTo }
          }
        }
      }
    }),

    // Huéspedes por país
    prisma.guest.groupBy({
      by: ['country'],
      _count: { id: true },
      where: {
        reservations: {
          some: {
            createdAt: { gte: dateFrom, lte: dateTo }
          }
        }
      },
      orderBy: { _count: { id: 'desc' } }
    }),

    // Gasto promedio por huésped
    prisma.reservation.aggregate({
      _avg: { totalAmount: true },
      where: {
        createdAt: { gte: dateFrom, lte: dateTo },
        status: { not: 'CANCELLED' }
      }
    })
  ])

  return NextResponse.json({
    reportType: 'guests',
    period: { from: dateFrom.toISOString(), to: dateTo.toISOString() },
    summary: {
      newGuests,
      returningGuests,
      totalGuests: newGuests + returningGuests,
      averageSpending: (averageSpending._avg.totalAmount || 0).toString()
    },
    guestsByCountry: guestsByCountry.map(item => ({
      country: item.country || 'No especificado',
      count: item._count.id
    }))
  })
}

// Rendimiento por Servicio
async function generateServicePerformance(dateFrom: Date, dateTo: Date) {
  console.log('🎯 Generating service performance report...')

  const serviceStats = await prisma.reservationItem.groupBy({
    by: ['itemType'],
    _count: { id: true },
    _sum: { amount: true },
    _avg: { amount: true },
    where: {
      createdAt: { gte: dateFrom, lte: dateTo }
    }
  })

  return NextResponse.json({
    reportType: 'services',
    period: { from: dateFrom.toISOString(), to: dateTo.toISOString() },
    services: serviceStats.map(service => ({
      type: service.itemType,
      bookings: service._count.id,
      totalRevenue: (service._sum.amount || 0).toString(),
      averageValue: (service._avg.amount || 0).toString()
    }))
  })
}





