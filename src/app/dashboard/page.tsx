'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Calendar,
  Users, 
  DollarSign, 
  Hotel, 
  MapPin,
  Package,
  CreditCard
} from 'lucide-react'

interface DashboardStats {
  totalReservations: number
  confirmedReservations: number
  pendingReservations: number
  totalRevenue: number
  monthlyRevenue: number
  activeHotels: number
  totalGuests: number
  occupancyRate: number
  recentReservations: any[]
  revenueByType: any[]
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      console.log('📊 Fetching dashboard stats...')
      const response = await fetch('/api/dashboard/stats')
      console.log('📊 Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('📊 Dashboard data received:', data)
        setStats(data)
      } else {
        console.error('📊 Dashboard API error:', response.status, response.statusText)
        const errorData = await response.text()
        console.error('📊 Error details:', errorData)
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Resumen general del sistema de reservaciones</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reservaciones</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalReservations || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{stats?.confirmedReservations || 0} confirmadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(stats?.totalRevenue || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              +${(stats?.monthlyRevenue || 0).toLocaleString()} este mes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hoteles Activos</CardTitle>
            <Hotel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeHotels || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.occupancyRate || 0}% ocupación promedio
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Huéspedes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalGuests || 0}</div>
            <p className="text-xs text-muted-foreground">
              Huéspedes registrados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity and Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Reservations */}
        <Card>
          <CardHeader>
            <CardTitle>Reservaciones Recientes</CardTitle>
            <CardDescription>
              Últimas reservaciones realizadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recentReservations?.slice(0, 5).map((reservation, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {reservation.confirmationNumber}
                    </p>
                    <p className="text-sm text-gray-500">
                      {reservation.guestName} • ${reservation.totalAmount}
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(reservation.createdAt).toLocaleDateString()}
                  </div>
                </div>
              )) || (
                <p className="text-gray-500 text-center py-4">
                  No hay reservaciones recientes
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Revenue by Type */}
        <Card>
          <CardHeader>
            <CardTitle>Ingresos por Tipo</CardTitle>
            <CardDescription>
              Distribución de ingresos por servicio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.revenueByType?.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {item.type === 'ACCOMMODATION' && <Hotel className="h-4 w-4 text-blue-500" />}
                    {item.type === 'ACTIVITY' && <MapPin className="h-4 w-4 text-green-500" />}
                    {item.type === 'PACKAGE' && <Package className="h-4 w-4 text-purple-500" />}
                    {item.type === 'SHUTTLE' && <CreditCard className="h-4 w-4 text-orange-500" />}
                    <span className="text-sm font-medium capitalize">
                      {item.type.toLowerCase()}
                    </span>
                  </div>
                  <div className="text-sm font-medium">
                    ${item.revenue.toLocaleString()}
                  </div>
                </div>
              )) || (
                <p className="text-gray-500 text-center py-4">
                  No hay datos de ingresos disponibles
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}
