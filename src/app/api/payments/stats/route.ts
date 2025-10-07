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

    console.log('📊 Fetching payment statistics...')
    
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

    // Obtener estadísticas de pagos
    const [
      totalRevenueResult,
      pendingAmountResult,
      paidTodayResult,
      totalTransactions,
      paymentsByStatus,
      paymentsByMethod,
      revenueByMonth
    ] = await Promise.all([
      // Ingresos totales (solo pagos exitosos)
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: 'PAID' }
      }),
      
      // Monto pendiente (reservaciones sin pagar completamente)
      prisma.reservation.aggregate({
        _sum: { totalAmount: true },
        where: { 
          paymentStatus: { in: ['PENDING', 'PARTIAL'] },
          status: { not: 'CANCELLED' }
        }
      }),
      
      // Pagado hoy
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
          status: 'PAID',
          processedAt: {
            gte: startOfDay,
            lt: endOfDay
          }
        }
      }),
      
      // Total de transacciones
      prisma.payment.count(),
      
      // Pagos por estado
      prisma.payment.groupBy({
        by: ['status'],
        _count: { id: true },
        _sum: { amount: true }
      }),
      
      // Pagos por método
      prisma.payment.groupBy({
        by: ['paymentMethod'],
        _count: { id: true },
        _sum: { amount: true },
        where: { status: 'PAID' }
      }),
      
      // Ingresos por mes (últimos 6 meses)
      prisma.payment.groupBy({
        by: ['processedAt'],
        _sum: { amount: true },
        where: {
          status: 'PAID',
          processedAt: {
            gte: new Date(today.getFullYear(), today.getMonth() - 6, 1)
          }
        }
      })
    ])

    // Procesar datos de ingresos por mes
    const monthlyRevenue = []
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1)
      const monthName = monthDate.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })
      
      const monthRevenue = revenueByMonth
        .filter(item => {
          if (!item.processedAt) return false
          const itemDate = new Date(item.processedAt)
          return itemDate.getMonth() === monthDate.getMonth() && 
                 itemDate.getFullYear() === monthDate.getFullYear()
        })
        .reduce((sum, item) => sum + parseFloat(item._sum.amount?.toString() || '0'), 0)
      
      monthlyRevenue.push({
        month: monthName,
        revenue: monthRevenue.toFixed(2)
      })
    }

    const stats = {
      totalRevenue: (totalRevenueResult._sum.amount || 0).toString(),
      pendingAmount: (pendingAmountResult._sum.totalAmount || 0).toString(),
      paidToday: (paidTodayResult._sum.amount || 0).toString(),
      totalTransactions,
      paymentsByStatus: paymentsByStatus.map(item => ({
        status: item.status,
        count: item._count.id,
        amount: (item._sum.amount || 0).toString()
      })),
      paymentsByMethod: paymentsByMethod.map(item => ({
        method: item.paymentMethod,
        count: item._count.id,
        amount: (item._sum.amount || 0).toString()
      })),
      monthlyRevenue
    }

    console.log('📊 Payment stats calculated:', {
      totalRevenue: stats.totalRevenue,
      pendingAmount: stats.pendingAmount,
      paidToday: stats.paidToday,
      totalTransactions: stats.totalTransactions
    })

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Error fetching payment stats:', error)
    return NextResponse.json(
      { error: 'Error obteniendo estadísticas de pagos' },
      { status: 500 }
    )
  }
}



