'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  MapPin,
  Hotel,
  Package,
  Users,
  Star,
  Calendar,
  DollarSign,
  TrendingUp,
  Award,
  Clock,
  Bed,
  Eye,
  ChevronRight,
  Building
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface DetailedServiceReportsProps {
  dateRange: {
    from: string
    to: string
  }
}

interface DetailedReportData {
  topActivities?: any[]
  topRoomTypes?: any[]
  topHotels?: any[]
  topPackages?: any[]
}

export default function DetailedServiceReports({ dateRange }: DetailedServiceReportsProps) {
  const [loading, setLoading] = useState(true)
  const [detailedData, setDetailedData] = useState<DetailedReportData>({})
  const [activeTab, setActiveTab] = useState('hotels')

  useEffect(() => {
    fetchDetailedReports()
  }, [dateRange])

  const fetchDetailedReports = async () => {
    try {
      setLoading(true)
      console.log('📊 Fetching detailed service reports...')
      
      const params = new URLSearchParams({
        type: 'all',
        dateFrom: dateRange.from,
        dateTo: dateRange.to,
        limit: '10'
      })

      const response = await fetch(`/api/reports/detailed?${params}`)
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Detailed reports loaded:', data)
        setDetailedData(data)
      } else {
        console.error('❌ Failed to fetch detailed reports')
      }
    } catch (error) {
      console.error('Error fetching detailed reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const detailTabs = [
    { id: 'hotels', name: 'Hoteles Top', icon: Building, count: detailedData.topHotels?.length || 0 },
    { id: 'room-types', name: 'Tipos de Habitación', icon: Bed, count: detailedData.topRoomTypes?.length || 0 },
    { id: 'activities', name: 'Actividades Top', icon: MapPin, count: detailedData.topActivities?.length || 0 },
    { id: 'packages', name: 'Paquetes Top', icon: Package, count: detailedData.topPackages?.length || 0 },
  ]

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
            <span>Cargando reportes detallados...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Tabs para diferentes reportes detallados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="h-5 w-5" />
            <span>Rankings Detallados por Servicio</span>
          </CardTitle>
          <CardDescription>
            Análisis específico de los elementos más populares y rentables
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {detailTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          {/* Top Hoteles */}
          {activeTab === 'hotels' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                🏨 Hoteles Más Populares
              </h3>
              {detailedData.topHotels?.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No hay datos de hoteles para este período
                </div>
              ) : (
                detailedData.topHotels?.map((hotel: any, index: number) => (
                  <div key={hotel.hotelId} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                            #{index + 1}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{hotel.name}</h4>
                          <p className="text-sm text-gray-600">
                            {hotel.address}, {hotel.city}, {hotel.country}
                          </p>
                          <div className="flex items-center space-x-4 mt-1">
                            <div className="flex items-center space-x-1">
                              {[...Array(hotel.starRating)].map((_, i) => (
                                <Star key={i} className="h-3 w-3 text-yellow-400 fill-current" />
                              ))}
                            </div>
                            <span className="text-xs text-gray-500">
                              {hotel.totalRooms} habitaciones • {hotel.roomTypes} tipos
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-green-600">
                          {formatCurrency(parseFloat(hotel.totalRevenue))}
                        </p>
                        <p className="text-sm text-gray-600">{hotel.occupancyRate}% ocupación</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="bg-blue-50 p-2 rounded">
                        <p className="text-gray-600">Reservaciones</p>
                        <p className="font-semibold text-blue-600">{hotel.bookings}</p>
                      </div>
                      <div className="bg-purple-50 p-2 rounded">
                        <p className="text-gray-600">Noches Totales</p>
                        <p className="font-semibold text-purple-600">{hotel.totalNights}</p>
                      </div>
                      <div className="bg-green-50 p-2 rounded">
                        <p className="text-gray-600">Huéspedes Únicos</p>
                        <p className="font-semibold text-green-600">{hotel.uniqueGuests}</p>
                      </div>
                      <div className="bg-orange-50 p-2 rounded">
                        <p className="text-gray-600">Promedio Noches</p>
                        <p className="font-semibold text-orange-600">{hotel.averageNights}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Top Tipos de Habitación */}
          {activeTab === 'room-types' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                🛏️ Tipos de Habitación Más Reservados
              </h3>
              {detailedData.topRoomTypes?.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No hay datos de tipos de habitación para este período
                </div>
              ) : (
                detailedData.topRoomTypes?.map((roomType: any, index: number) => (
                  <div key={roomType.roomTypeId} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold text-sm">
                            #{index + 1}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{roomType.name}</h4>
                          <p className="text-sm text-gray-600">
                            {roomType.hotelName}
                          </p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-xs text-gray-500">
                              Capacidad: {roomType.capacity} personas
                            </span>
                            <span className="text-xs text-gray-500">
                              {roomType.totalRooms} habitaciones disponibles
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-green-600">
                          {formatCurrency(parseFloat(roomType.totalRevenue))}
                        </p>
                        <p className="text-sm text-gray-600">{roomType.occupancyRate}% ocupación</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="bg-blue-50 p-2 rounded">
                        <p className="text-gray-600">Reservaciones</p>
                        <p className="font-semibold text-blue-600">{roomType.bookings}</p>
                      </div>
                      <div className="bg-purple-50 p-2 rounded">
                        <p className="text-gray-600">Noches Totales</p>
                        <p className="font-semibold text-purple-600">{roomType.totalNights}</p>
                      </div>
                      <div className="bg-green-50 p-2 rounded">
                        <p className="text-gray-600">Tarifa Base</p>
                        <p className="font-semibold text-green-600">{formatCurrency(parseFloat(roomType.baseRate))}</p>
                      </div>
                      <div className="bg-orange-50 p-2 rounded">
                        <p className="text-gray-600">Promedio Noches</p>
                        <p className="font-semibold text-orange-600">{roomType.averageNights}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Top Actividades */}
          {activeTab === 'activities' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                🎯 Actividades Más Populares
              </h3>
              {detailedData.topActivities?.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No hay datos de actividades para este período
                </div>
              ) : (
                detailedData.topActivities?.map((activity: any, index: number) => (
                  <div key={activity.activityId} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold text-sm">
                            #{index + 1}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{activity.name}</h4>
                          <p className="text-sm text-gray-600">{activity.description}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {activity.category}
                            </span>
                            <span className="text-xs text-gray-500">
                              📍 {activity.location}
                            </span>
                            <span className="text-xs text-gray-500">
                              ⏱️ {activity.duration}h
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-green-600">
                          {formatCurrency(parseFloat(activity.totalRevenue))}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatCurrency(parseFloat(activity.basePrice))} precio base
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div className="bg-blue-50 p-2 rounded">
                        <p className="text-gray-600">Reservaciones</p>
                        <p className="font-semibold text-blue-600">{activity.bookings}</p>
                      </div>
                      <div className="bg-purple-50 p-2 rounded">
                        <p className="text-gray-600">Total Participantes</p>
                        <p className="font-semibold text-purple-600">{activity.totalParticipants}</p>
                      </div>
                      <div className="bg-orange-50 p-2 rounded">
                        <p className="text-gray-600">Promedio Participantes</p>
                        <p className="font-semibold text-orange-600">{activity.averageParticipants}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Top Paquetes */}
          {activeTab === 'packages' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                📦 Paquetes Más Populares
              </h3>
              {detailedData.topPackages?.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No hay datos de paquetes para este período
                </div>
              ) : (
                detailedData.topPackages?.map((pkg: any, index: number) => (
                  <div key={pkg.packageId} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold text-sm">
                            #{index + 1}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{pkg.name}</h4>
                          <p className="text-sm text-gray-600">{pkg.description}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-xs text-gray-500">
                              📅 {pkg.duration} días
                            </span>
                            <span className="text-xs text-gray-500">
                              👥 {pkg.minParticipants}-{pkg.fixedCapacity} personas
                            </span>
                            <span className="text-xs text-gray-500">
                              🏨 {pkg.includedHotels} hoteles • 🎯 {pkg.includedActivities} actividades
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-green-600">
                          {formatCurrency(parseFloat(pkg.totalRevenue))}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatCurrency(parseFloat(pkg.fixedPrice))} precio fijo
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div className="bg-blue-50 p-2 rounded">
                        <p className="text-gray-600">Reservaciones</p>
                        <p className="font-semibold text-blue-600">{pkg.bookings}</p>
                      </div>
                      <div className="bg-purple-50 p-2 rounded">
                        <p className="text-gray-600">Total Participantes</p>
                        <p className="font-semibold text-purple-600">{pkg.totalParticipants}</p>
                      </div>
                      <div className="bg-orange-50 p-2 rounded">
                        <p className="text-gray-600">Promedio Participantes</p>
                        <p className="font-semibold text-orange-600">{pkg.averageParticipants}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
