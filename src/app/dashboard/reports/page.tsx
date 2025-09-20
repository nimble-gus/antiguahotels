'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Calendar,
  Hotel,
  MapPin,
  Package,
  CreditCard,
  Download,
  Filter,
  RefreshCw,
  Eye,
  Globe,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import DetailedServiceReports from '@/components/detailed-service-reports'

interface ReportData {
  reportType: string
  period: { from: string; to: string }
  summary?: any
  [key: string]: any
}

export default function ReportsPage() {
  const [loading, setLoading] = useState(true)
  const [activeReport, setActiveReport] = useState('overview')
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  })
  const [period, setPeriod] = useState('month')

  useEffect(() => {
    fetchReport()
  }, [activeReport, dateRange, period])

  const fetchReport = async () => {
    try {
      setLoading(true)
      console.log('📊 Fetching report:', activeReport)
      
      const params = new URLSearchParams({
        type: activeReport,
        dateFrom: dateRange.from,
        dateTo: dateRange.to,
        period
      })

      const response = await fetch(`/api/reports?${params}`)
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Report data loaded:', data.reportType)
        setReportData(data)
      } else {
        console.error('❌ Failed to fetch report')
      }
    } catch (error) {
      console.error('Error fetching report:', error)
    } finally {
      setLoading(false)
    }
  }

  const reportTabs = [
    { id: 'overview', name: 'Resumen General', icon: BarChart3 },
    { id: 'revenue', name: 'Ingresos', icon: DollarSign },
    { id: 'occupancy', name: 'Ocupación', icon: Hotel },
    { id: 'guests', name: 'Huéspedes', icon: Users },
    { id: 'services', name: 'Servicios', icon: MapPin },
  ]

  const getServiceIcon = (serviceType: string) => {
    switch (serviceType) {
      case 'ACCOMMODATION': return <Hotel className="h-4 w-4" />
      case 'ACTIVITY': return <MapPin className="h-4 w-4" />
      case 'PACKAGE': return <Package className="h-4 w-4" />
      case 'SHUTTLE': return <Calendar className="h-4 w-4" />
      default: return <BarChart3 className="h-4 w-4" />
    }
  }

  const getServiceLabel = (serviceType: string) => {
    switch (serviceType) {
      case 'ACCOMMODATION': return 'Alojamiento'
      case 'ACTIVITY': return 'Actividades'
      case 'PACKAGE': return 'Paquetes'
      case 'SHUTTLE': return 'Shuttle'
      default: return serviceType
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reportes y Analytics</h1>
          <p className="text-gray-600">Análisis de rendimiento y métricas de negocio</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={fetchReport} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button variant="outline" onClick={() => alert('Exportar reporte - Por implementar')}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Filtros de Fecha y Período */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filtros de Período</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Desde
              </label>
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange({...dateRange, from: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Hasta
              </label>
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange({...dateRange, to: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Agrupación
              </label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="day">Por Día</option>
                <option value="week">Por Semana</option>
                <option value="month">Por Mes</option>
                <option value="quarter">Por Trimestre</option>
                <option value="year">Por Año</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={() => {
                  const today = new Date()
                  setDateRange({
                    from: new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0],
                    to: today.toISOString().split('T')[0]
                  })
                  setPeriod('month')
                }}
                variant="outline"
                className="w-full"
              >
                Este Mes
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs de Reportes */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {reportTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveReport(tab.id)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeReport === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Contenido del Reporte */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
          <span>Generando reporte...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Reporte de Resumen General */}
          {activeReport === 'overview' && reportData && (
            <div className="space-y-6">
              {/* KPIs Principales */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Calendar className="h-8 w-8 text-blue-500" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Reservaciones</p>
                        <p className="text-2xl font-bold text-gray-900">{reportData.summary.totalReservations}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <DollarSign className="h-8 w-8 text-green-500" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Ingresos</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatCurrency(parseFloat(reportData.summary.totalRevenue))}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Users className="h-8 w-8 text-purple-500" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Huéspedes</p>
                        <p className="text-2xl font-bold text-gray-900">{reportData.summary.totalGuests}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Hotel className="h-8 w-8 text-orange-500" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Hoteles Activos</p>
                        <p className="text-2xl font-bold text-gray-900">{reportData.summary.activeHotels}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Clock className="h-8 w-8 text-yellow-500" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Estadía Promedio</p>
                        <p className="text-2xl font-bold text-gray-900">{reportData.summary.averageStayDuration}</p>
                        <p className="text-xs text-gray-500">noches</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Servicios Más Populares */}
              <Card>
                <CardHeader>
                  <CardTitle>🎯 Rendimiento por Servicio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {reportData.topServices?.map((service: any, index: number) => (
                      <div key={service.type} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            {getServiceIcon(service.type)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{getServiceLabel(service.type)}</p>
                            <p className="text-sm text-gray-600">{service.count} reservaciones</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">
                            {formatCurrency(parseFloat(service.revenue))}
                          </p>
                          <p className="text-xs text-gray-500">
                            #{index + 1} más popular
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Actividad Reciente */}
              <Card>
                <CardHeader>
                  <CardTitle>📋 Actividad Reciente</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {reportData.recentActivity?.map((activity: any) => (
                      <div key={activity.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <div>
                            <p className="font-medium">{activity.confirmationNumber}</p>
                            <p className="text-sm text-gray-600">{activity.guestName}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(parseFloat(activity.totalAmount))}</p>
                          <p className="text-xs text-gray-500">{formatDate(activity.createdAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Reporte de Ingresos */}
          {activeReport === 'revenue' && reportData && (
            <div className="space-y-6">
              {/* Resumen de Ingresos */}
              <Card>
                <CardHeader>
                  <CardTitle>💰 Resumen de Ingresos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-green-600 mb-2">
                      {formatCurrency(parseFloat(reportData.totalRevenue || '0'))}
                    </p>
                    <p className="text-gray-600">
                      Total del período seleccionado
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Ingresos por Servicio */}
              <Card>
                <CardHeader>
                  <CardTitle>📊 Ingresos por Tipo de Servicio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {reportData.revenueByService?.map((service: any) => (
                      <div key={service.service} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          {getServiceIcon(service.service)}
                          <div>
                            <p className="font-medium">{getServiceLabel(service.service)}</p>
                            <p className="text-sm text-gray-600">{service.transactions} transacciones</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-green-600">
                            {formatCurrency(parseFloat(service.revenue))}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Ingresos por Mes */}
              {reportData.revenueByMonth && (
                <Card>
                  <CardHeader>
                    <CardTitle>📈 Tendencia Mensual</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {reportData.revenueByMonth.map((month: any) => (
                        <div key={month.month} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                          <div>
                            <p className="font-medium">{month.monthName}</p>
                            <p className="text-sm text-gray-600">{month.transactions} transacciones</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-blue-600">
                              {formatCurrency(parseFloat(month.revenue))}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Reporte de Ocupación */}
          {activeReport === 'occupancy' && reportData && (
            <div className="space-y-6">
              {/* Ocupación Promedio */}
              <Card>
                <CardHeader>
                  <CardTitle>🏨 Ocupación Promedio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-blue-600 mb-2">
                      {reportData.averageOccupancy}%
                    </p>
                    <p className="text-gray-600">
                      Ocupación promedio del período
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Ocupación por Hotel */}
              <Card>
                <CardHeader>
                  <CardTitle>📊 Ocupación por Hotel</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reportData.occupancyByHotel?.map((hotel: any) => (
                      <div key={hotel.hotelId} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-medium text-gray-900">{hotel.hotelName}</h4>
                            <p className="text-sm text-gray-600">{hotel.totalRooms} habitaciones</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-blue-600">{hotel.occupancyRate}%</p>
                            <p className="text-sm text-gray-600">ocupación</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Reservaciones</p>
                            <p className="font-medium">{hotel.reservations}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Noches Totales</p>
                            <p className="font-medium">{hotel.totalNights}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Reporte de Huéspedes */}
          {activeReport === 'guests' && reportData && (
            <div className="space-y-6">
              {/* Resumen de Huéspedes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Users className="h-8 w-8 text-green-500" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Huéspedes Nuevos</p>
                        <p className="text-2xl font-bold text-gray-900">{reportData.summary.newGuests}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <RefreshCw className="h-8 w-8 text-blue-500" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Huéspedes Recurrentes</p>
                        <p className="text-2xl font-bold text-gray-900">{reportData.summary.returningGuests}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <TrendingUp className="h-8 w-8 text-purple-500" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Gasto Promedio</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatCurrency(parseFloat(reportData.summary.averageSpending))}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Huéspedes por País */}
              <Card>
                <CardHeader>
                  <CardTitle>🌍 Huéspedes por País</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {reportData.guestsByCountry?.map((country: any, index: number) => (
                      <div key={country.country} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Globe className="h-5 w-5 text-blue-500" />
                          <div>
                            <p className="font-medium">{country.country}</p>
                            <p className="text-sm text-gray-600">#{index + 1} más frecuente</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-blue-600">{country.count}</p>
                          <p className="text-sm text-gray-600">huéspedes</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Reporte de Servicios */}
          {activeReport === 'services' && reportData && (
            <div className="space-y-6">
              {/* Resumen General por Tipo de Servicio */}
              <Card>
                <CardHeader>
                  <CardTitle>🎯 Rendimiento por Servicio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {reportData.services?.map((service: any) => (
                      <div key={service.type} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            {getServiceIcon(service.type)}
                            <h4 className="font-medium text-gray-900">{getServiceLabel(service.type)}</h4>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-green-600">
                              {formatCurrency(parseFloat(service.totalRevenue))}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Reservaciones</p>
                            <p className="font-medium">{service.bookings}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Valor Promedio</p>
                            <p className="font-medium">{formatCurrency(parseFloat(service.averageValue))}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Detalles Específicos por Servicio */}
              <DetailedServiceReports dateRange={dateRange} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
