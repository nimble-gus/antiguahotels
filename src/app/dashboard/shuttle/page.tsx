'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Plus, 
  Edit, 
  Trash2, 
  MapPin,
  Plane,
  Clock,
  Users,
  DollarSign,
  Car,
  Search,
  Filter,
  Eye,
  X
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { ShuttleRouteForm } from '@/components/forms/shuttle-route-form'

interface ShuttleRoute {
  id: string
  name: string
  description?: string
  fromAirportId: string
  toHotelId: string
  direction: 'ARRIVAL' | 'DEPARTURE' | 'ROUNDTRIP'
  distanceKm?: string
  estimatedDurationMinutes?: number
  basePrice: string
  currency: string
  isShared: boolean
  maxPassengers: number
  vehicleType?: string
  isActive: boolean
  createdAt: string
  fromAirport: {
    id: string
    iata?: string
    name: string
    city?: string
    country?: string
  }
  toHotel: {
    id: string
    name: string
    city?: string
    code?: string
  }
  _count?: {
    shuttleTransfers: number
    shuttleAvailability: number
  }
}

export default function ShuttlePage() {
  const [routes, setRoutes] = useState<ShuttleRoute[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingRoute, setEditingRoute] = useState<ShuttleRoute | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [directionFilter, setDirectionFilter] = useState('')
  const [activeFilter, setActiveFilter] = useState('true')
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState<any>(null)

  useEffect(() => {
    fetchRoutes()
  }, [currentPage, searchTerm, directionFilter, activeFilter])

  const fetchRoutes = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm }),
        ...(directionFilter && { direction: directionFilter }),
        ...(activeFilter && { active: activeFilter }),
      })

      console.log('🚐 Fetching shuttle routes...')
      const response = await fetch(`/api/shuttle/routes?${params}`)
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Routes loaded:', data.routes?.length || 0)
        setRoutes(data.routes || [])
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching shuttle routes:', error)
      alert('Error cargando rutas de shuttle')
    } finally {
      setLoading(false)
    }
  }

  const handleEditRoute = (route: ShuttleRoute) => {
    setEditingRoute(route)
    setShowCreateForm(true)
  }

  const handleDeleteRoute = async (route: ShuttleRoute) => {
    if (!confirm(`¿Estás seguro de eliminar la ruta "${route.name}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/shuttle/routes/${route.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        alert('Ruta eliminada exitosamente')
        fetchRoutes()
      } else {
        const error = await response.json()
        alert(error.error || 'Error eliminando ruta')
      }
    } catch (error) {
      console.error('Error deleting route:', error)
      alert('Error de conexión al eliminar ruta')
    }
  }

  const getDirectionLabel = (direction: string) => {
    switch (direction) {
      case 'ARRIVAL': return 'Llegada'
      case 'DEPARTURE': return 'Salida'
      case 'ROUNDTRIP': return 'Ida y Vuelta'
      default: return direction
    }
  }

  const getDirectionColor = (direction: string) => {
    switch (direction) {
      case 'ARRIVAL': return 'bg-green-100 text-green-800'
      case 'DEPARTURE': return 'bg-blue-100 text-blue-800'
      case 'ROUNDTRIP': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Shuttle Service</h1>
          <p className="text-gray-600">Gestión de rutas y traslados aeropuerto-hotel</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Ruta
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filtros</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Buscar
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nombre, aeropuerto, hotel..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección
              </label>
              <select
                value={directionFilter}
                onChange={(e) => setDirectionFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todas</option>
                <option value="ARRIVAL">Llegada</option>
                <option value="DEPARTURE">Salida</option>
                <option value="ROUNDTRIP">Ida y Vuelta</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos</option>
                <option value="true">Activos</option>
                <option value="false">Inactivos</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('')
                  setDirectionFilter('')
                  setActiveFilter('true')
                  setCurrentPage(1)
                }}
                className="w-full"
              >
                Limpiar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Car className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Rutas</p>
                <p className="text-2xl font-bold text-gray-900">{routes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Plane className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Llegadas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {routes.filter(r => r.direction === 'ARRIVAL').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <MapPin className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Salidas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {routes.filter(r => r.direction === 'DEPARTURE').length}
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
                <p className="text-sm font-medium text-gray-600">Ida y Vuelta</p>
                <p className="text-2xl font-bold text-gray-900">
                  {routes.filter(r => r.direction === 'ROUNDTRIP').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Rutas */}
      <div className="grid gap-6">
        {routes.map((route) => (
          <Card key={route.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Header de la ruta */}
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 rounded-lg bg-blue-100 flex items-center justify-center border border-blue-200">
                        <Car className="h-8 w-8 text-blue-600" />
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">{route.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDirectionColor(route.direction)}`}>
                          {getDirectionLabel(route.direction)}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          route.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {route.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Plane className="h-4 w-4 mr-1" />
                          {route.fromAirport.iata ? `${route.fromAirport.iata} - ` : ''}{route.fromAirport.name}
                        </div>
                        <span>→</span>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {route.toHotel.name}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Descripción */}
                  {route.description && (
                    <p className="text-gray-600 mb-4">{route.description}</p>
                  )}

                  {/* Detalles del servicio */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-blue-600 font-medium">💰 Precio</p>
                      <p className="text-lg font-bold text-blue-900">
                        {formatCurrency(parseFloat(route.basePrice))}
                      </p>
                      <p className="text-xs text-blue-600">
                        {route.currency}
                      </p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-sm text-green-600 font-medium">👥 Capacidad</p>
                      <p className="text-lg font-bold text-green-900">
                        {route.maxPassengers}
                      </p>
                      <p className="text-xs text-green-600">
                        {route.isShared ? 'Compartido' : 'Privado'}
                      </p>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <p className="text-sm text-yellow-600 font-medium">⏱️ Duración</p>
                      <p className="text-lg font-bold text-yellow-900">
                        {route.estimatedDurationMinutes ? `${route.estimatedDurationMinutes}min` : 'N/A'}
                      </p>
                      <p className="text-xs text-yellow-600">
                        {route.distanceKm ? `${route.distanceKm} km` : 'Estimado'}
                      </p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <p className="text-sm text-purple-600 font-medium">🚐 Vehículo</p>
                      <p className="text-lg font-bold text-purple-900">
                        {route.vehicleType || 'Van'}
                      </p>
                      <p className="text-xs text-purple-600">
                        Tipo de vehículo
                      </p>
                    </div>
                  </div>

                  {/* Estadísticas de uso */}
                  {route._count && (
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {route._count.shuttleTransfers} traslados realizados
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {route._count.shuttleAvailability} horarios disponibles
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Acciones */}
                <div className="flex flex-col space-y-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => alert(`Gestión de horarios para ${route.name} - Por implementar`)}
                    title="Gestionar horarios"
                    className="text-yellow-600 hover:text-yellow-700"
                  >
                    <Clock className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => alert(`Vista detallada de ${route.name} - Por implementar`)}
                    title="Ver detalles"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleEditRoute(route)}
                    title="Editar ruta"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDeleteRoute(route)}
                    title="Eliminar ruta"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Paginación */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Mostrando {((currentPage - 1) * pagination.limit) + 1} a {Math.min(currentPage * pagination.limit, pagination.total)} de {pagination.total} rutas
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            <span className="flex items-center px-3 py-1 text-sm">
              Página {currentPage} de {pagination.pages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === pagination.pages}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}

      {/* Mensaje cuando no hay rutas */}
      {!loading && routes.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Car className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay rutas de shuttle</h3>
            <p className="text-gray-500 mb-6">
              Comienza creando rutas entre aeropuertos y hoteles
            </p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Primera Ruta
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Formulario de crear/editar ruta */}
      {(showCreateForm || editingRoute) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingRoute ? 'Editar Ruta de Shuttle' : 'Nueva Ruta de Shuttle'}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowCreateForm(false)
                    setEditingRoute(null)
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="p-6">
              <ShuttleRouteForm
                route={editingRoute}
                onClose={() => {
                  setShowCreateForm(false)
                  setEditingRoute(null)
                }}
                onSave={() => {
                  fetchRoutes()
                  setShowCreateForm(false)
                  setEditingRoute(null)
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}



