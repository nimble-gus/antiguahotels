'use client'

import PublicLayout from '@/components/layout/public-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  Users, 
  Plane,
  ArrowRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  Car,
  Calendar,
  Star,
  Navigation
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import { useState, useEffect, useMemo } from 'react'

interface Airport {
  id: string
  name: string
  iata: string
  city: string
  country: string
}

interface Hotel {
  id: string
  name: string
  city: string
  address: string
  rating: number | null
}

interface ShuttleSchedule {
  id: string
  departureTime: string
  daysOfWeek: string
  isActive: boolean
}

interface ShuttleAvailability {
  id: string
  date: string
  departureTime: string
  availableSeats: number
  priceOverride: number | null
  isActive: boolean
}

interface ShuttleRoute {
  id: string
  name: string
  description: string
  fromAirport: Airport
  toHotel: Hotel
  direction: string
  distanceKm: number | null
  estimatedDurationMinutes: number | null
  basePrice: number
  currency: string
  isShared: boolean
  maxPassengers: number
  vehicleType: string | null
  isActive: boolean
  regularSchedules: ShuttleSchedule[]
  specificAvailability: ShuttleAvailability[]
  duration: string
  pricePerPerson: number
  totalPrice: number
  availableToday: boolean
  nextDeparture: string | null
}

interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

interface ShuttleResponse {
  routes: ShuttleRoute[]
  pagination: PaginationInfo
}

const directions = [
  { value: '', label: 'Todas las direcciones' },
  { value: 'ARRIVAL', label: 'Llegada (Aeropuerto → Hotel)' },
  { value: 'DEPARTURE', label: 'Salida (Hotel → Aeropuerto)' },
  { value: 'ROUNDTRIP', label: 'Ida y vuelta' }
]

const vehicleTypes = [
  { value: '', label: 'Todos los vehículos' },
  { value: 'Van', label: 'Van' },
  { value: 'Bus', label: 'Bus' },
  { value: 'Car', label: 'Carro privado' }
]

export default function ShuttlePage() {
  const { t } = useLanguage()
  const [routes, setRoutes] = useState<ShuttleRoute[]>([])
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDirection, setSelectedDirection] = useState('')
  const [selectedVehicleType, setSelectedVehicleType] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const loadRoutes = async (page = 1, search = '', direction = '', vehicleType = '', date = '') => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12', // 12 rutas por página
        ...(search && { search }),
        ...(direction && { direction }),
        ...(vehicleType && { vehicleType }),
        ...(date && { date })
      })

      const response = await fetch(`/api/public/shuttle?${params}`)
      if (response.ok) {
        const data: ShuttleResponse = await response.json()
        setRoutes(data.routes)
        setPagination(data.pagination)
        setCurrentPage(page)
      }
    } catch (error) {
      console.error('Error loading shuttle routes:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRoutes(1, searchTerm, selectedDirection, selectedVehicleType, selectedDate)
  }, [])

  const handleSearch = () => {
    setCurrentPage(1)
    loadRoutes(1, searchTerm, selectedDirection, selectedVehicleType, selectedDate)
  }

  const handleFilterChange = () => {
    setCurrentPage(1)
    loadRoutes(1, searchTerm, selectedDirection, selectedVehicleType, selectedDate)
  }

  const handlePageChange = (page: number) => {
    loadRoutes(page, searchTerm, selectedDirection, selectedVehicleType, selectedDate)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedDirection('')
    setSelectedVehicleType('')
    setSelectedDate('')
    setCurrentPage(1)
    loadRoutes(1, '', '', '', '')
  }

  const getDirectionLabel = (direction: string) => {
    switch (direction) {
      case 'ARRIVAL': return 'Llegada'
      case 'DEPARTURE': return 'Salida'
      case 'ROUNDTRIP': return 'Ida y vuelta'
      default: return direction
    }
  }

  const getDirectionIcon = (direction: string) => {
    switch (direction) {
      case 'ARRIVAL': return <Plane className="h-4 w-4" />
      case 'DEPARTURE': return <Navigation className="h-4 w-4" />
      case 'ROUNDTRIP': return <ArrowRight className="h-4 w-4" />
      default: return <Car className="h-4 w-4" />
    }
  }

  const formatPrice = (price: number, currency: string) => {
    return `$${price} ${currency}`
  }

  const formatTime = (time: string) => {
    return time.substring(0, 5)
  }

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Servicio de Shuttle
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Transporte cómodo y seguro entre el aeropuerto y tu hotel en Antigua Guatemala
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filtros */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Búsqueda */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Buscar rutas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Botón de filtros móvil */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtros
                {showFilters ? <X className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
              </Button>

              {/* Filtros desktop */}
              <div className="hidden lg:flex gap-4">
                <select
                  value={selectedDirection}
                  onChange={(e) => {
                    setSelectedDirection(e.target.value)
                    handleFilterChange()
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {directions.map(direction => (
                    <option key={direction.value} value={direction.value}>
                      {direction.label}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedVehicleType}
                  onChange={(e) => {
                    setSelectedVehicleType(e.target.value)
                    handleFilterChange()
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {vehicleTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>

                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-2"
                  placeholder="Fecha"
                />

                <Button onClick={handleSearch}>
                  <Search className="h-4 w-4 mr-2" />
                  Buscar
                </Button>
              </div>
            </div>

            {/* Filtros móviles */}
            {showFilters && (
              <div className="lg:hidden mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dirección
                    </label>
                    <select
                      value={selectedDirection}
                      onChange={(e) => setSelectedDirection(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {directions.map(direction => (
                        <option key={direction.value} value={direction.value}>
                          {direction.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vehículo
                    </label>
                    <select
                      value={selectedVehicleType}
                      onChange={(e) => setSelectedVehicleType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {vehicleTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha
                    </label>
                    <Input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button onClick={handleFilterChange} className="flex-1">
                    Aplicar Filtros
                  </Button>
                  <Button variant="outline" onClick={clearFilters}>
                    Limpiar
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}

          {/* Grid de rutas */}
          {!loading && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {routes.map((route) => (
                  <div key={route.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <div className="p-6">
                      {/* Header de la ruta */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          {getDirectionIcon(route.direction)}
                          <span className="text-sm font-medium text-blue-600">
                            {getDirectionLabel(route.direction)}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">
                            {formatPrice(route.pricePerPerson, route.currency)}
                          </div>
                          <div className="text-sm text-gray-500">por persona</div>
                        </div>
                      </div>

                      {/* Información de la ruta */}
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {route.name}
                        </h3>
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Plane className="h-4 w-4 mr-2 text-gray-400" />
                            <span className="font-medium">{route.fromAirport.name}</span>
                            {route.fromAirport.iata && (
                              <span className="ml-2 text-gray-500">({route.fromAirport.iata})</span>
                            )}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                            <span className="font-medium">{route.toHotel.name}</span>
                            {route.toHotel.rating && (
                              <div className="flex items-center ml-2">
                                <Star className="h-3 w-3 text-yellow-400 fill-current" />
                                <span className="ml-1 text-xs">{route.toHotel.rating}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Detalles de la ruta */}
                      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-gray-400" />
                          <span>{route.duration}</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2 text-gray-400" />
                          <span>{route.maxPassengers} pasajeros</span>
                        </div>
                        {route.distanceKm && (
                          <div className="flex items-center">
                            <Navigation className="h-4 w-4 mr-2 text-gray-400" />
                            <span>{route.distanceKm} km</span>
                          </div>
                        )}
                        <div className="flex items-center">
                          <Car className="h-4 w-4 mr-2 text-gray-400" />
                          <span>{route.isShared ? 'Compartido' : 'Privado'}</span>
                        </div>
                      </div>

                      {/* Disponibilidad */}
                      {route.availableToday && route.nextDeparture && (
                        <div className="mb-4 p-3 bg-green-50 rounded-lg">
                          <div className="flex items-center text-green-800 text-sm">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span className="font-medium">Disponible hoy</span>
                          </div>
                          <div className="text-green-700 text-sm mt-1">
                            Próxima salida: {formatTime(route.nextDeparture)}
                          </div>
                        </div>
                      )}

                      {/* Horarios regulares */}
                      {route.regularSchedules.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Horarios regulares</h4>
                          <div className="flex flex-wrap gap-1">
                            {route.regularSchedules.slice(0, 3).map((schedule) => (
                              <span
                                key={schedule.id}
                                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                              >
                                {formatTime(schedule.departureTime)}
                              </span>
                            ))}
                            {route.regularSchedules.length > 3 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded">
                                +{route.regularSchedules.length - 3} más
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Botón de reserva */}
                      <Button className="w-full">
                        <Calendar className="h-4 w-4 mr-2" />
                        Reservar Shuttle
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Paginación */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!pagination.hasPrevPage}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </Button>

                  <div className="flex space-x-1">
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          onClick={() => handlePageChange(pageNum)}
                          className="w-10 h-10"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                  >
                    Siguiente
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Información de paginación */}
              {pagination && (
                <div className="text-center text-sm text-gray-500 mt-4">
                  Mostrando {((currentPage - 1) * 12) + 1} - {Math.min(currentPage * 12, pagination.totalItems)} de {pagination.totalItems} rutas
                </div>
              )}
            </>
          )}

          {/* Sin resultados */}
          {!loading && routes.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Car className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No se encontraron rutas de shuttle
              </h3>
              <p className="text-gray-500 mb-4">
                Intenta ajustar tus filtros de búsqueda
              </p>
              <Button onClick={clearFilters}>
                Limpiar filtros
              </Button>
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  )
}
