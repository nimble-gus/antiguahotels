import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Dashboard stats API called')
    const today = new Date()
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const startOfYear = new Date(today.getFullYear(), 0, 1)
    
    console.log('📅 Date ranges:', { today, startOfMonth, startOfYear })

    // Get basic reservation stats
    const [
      totalReservations,
      confirmedReservations,
      pendingReservations,
      cancelledReservations
    ] = await Promise.all([
      prisma.reservation.count(),
      prisma.reservation.count({ where: { status: 'CONFIRMED' } }),
      prisma.reservation.count({ where: { status: 'PENDING' } }),
      prisma.reservation.count({ where: { status: 'CANCELLED' } })
    ])
    
    console.log('📈 Reservation counts:', {
      totalReservations,
      confirmedReservations,
      pendingReservations,
      cancelledReservations
    })

    // Get revenue stats
    const [totalRevenueResult, monthlyRevenueResult] = await Promise.all([
      prisma.reservation.aggregate({
        _sum: { totalAmount: true },
        where: { status: { in: ['CONFIRMED', 'COMPLETED'] } }
      }),
      prisma.reservation.aggregate({
        _sum: { totalAmount: true },
        where: {
          status: { in: ['CONFIRMED', 'COMPLETED'] },
          createdAt: { gte: startOfMonth }
        }
      })
    ])

    // Get hotel stats
    console.log('🏨 Fetching hotel and guest stats...')
    const [activeHotels, totalGuests] = await Promise.all([
      prisma.hotel.count({ where: { isActive: true } }),
      prisma.guest.count()
    ])
    
    console.log('🏨 Hotel and guest stats:', { activeHotels, totalGuests })

    // Get recent reservations with guest info
    const recentReservations = await prisma.reservation.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        guest: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    })

    // Get revenue by type
    const revenueByType = await prisma.reservationItem.groupBy({
      by: ['itemType'],
      _sum: { amount: true },
      where: {
        reservation: {
          status: { in: ['CONFIRMED', 'COMPLETED'] }
        }
      }
    })

    // Calculate occupancy rate (simplified)
    const totalRooms = await prisma.room.count({ where: { isActive: true } })
    const occupiedRooms = await prisma.accommodationStay.count({
      where: {
        checkInDate: { lte: today },
        checkOutDate: { gt: today },
        reservationItem: {
          reservation: {
            status: 'CONFIRMED'
          }
        }
      }
    })

    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0

    // Format the response
    const stats = {
      totalReservations,
      confirmedReservations,
      pendingReservations,
      cancelledReservations,
      totalRevenue: (totalRevenueResult._sum.totalAmount || 0).toString(),
      monthlyRevenue: (monthlyRevenueResult._sum.totalAmount || 0).toString(),
      activeHotels,
      totalGuests,
      occupancyRate,
      recentReservations: recentReservations.map((reservation: any) => ({
        id: reservation.id.toString(),
        confirmationNumber: reservation.confirmationNumber,
        guestName: `${reservation.guest.firstName} ${reservation.guest.lastName}`,
        totalAmount: reservation.totalAmount.toString(),
        status: reservation.status,
        createdAt: reservation.createdAt.toISOString()
      })),
      revenueByType: revenueByType.map((item: any) => ({
        type: item.itemType,
        revenue: (item._sum.amount || 0).toString()
      }))
    }

    console.log('📊 Final stats object:', stats)
    return NextResponse.json(stats)

  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Error fetching dashboard statistics' },
      { status: 500 }
    )
  }
}
