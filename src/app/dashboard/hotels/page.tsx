'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { HotelForm } from '@/components/forms/hotel-form'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Hotel, 
  MapPin, 
  Star,
  Bed,
  Users,
  Search,
  Filter,
  Eye,
  ExternalLink,
  X
} from 'lucide-react'

interface Hotel {
  id: string
  name: string
  code?: string
  brand?: string
  description?: string
  logoUrl?: string
  address?: string
  city?: string
  country?: string
  postalCode?: string
  phone?: string
  email?: string
  website?: string
  rating?: number
  totalRooms: number
  isActive: boolean
  createdAt: string
  roomTypes: RoomType[]
  _count: {
    rooms: number
    roomTypes: number
  }
}

interface RoomType {
  id: string
  name: string
  baseRate: string
  occupancy: number
  isActive: boolean
}

export default function HotelsPage() {
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [cityFilter, setCityFilter] = useState('')
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState<any>(null)

  useEffect(() => {
    fetchHotels()
  }, [currentPage, searchTerm, cityFilter, activeFilter])

  const fetchHotels = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
      })

      if (searchTerm) params.append('search', searchTerm)
      if (cityFilter) params.append('city', cityFilter)
      if (activeFilter !== 'all') params.append('active', activeFilter)

      const response = await fetch(`/api/hotels?${params}`)
      if (response.ok) {
        const data = await response.json()
        setHotels(data.hotels)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching hotels:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (hotel: Hotel) => {
    if (!confirm(`¿Estás seguro de eliminar el hotel "${hotel.name}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/hotels?id=${hotel.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchHotels()
      } else {
        const error = await response.json()
        alert(error.error || 'Error eliminando hotel')
      }
    } catch (error) {
      console.error('Error deleting hotel:', error)
      alert('Error de conexión')
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
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Hoteles</h1>
          <p className="text-gray-600">Administra la información de hoteles y propiedades</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Hotel
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-6">
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
                  placeholder="Nombre, código o descripción..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ciudad
              </label>
              <input
                type="text"
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                placeholder="Filtrar por ciudad..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
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
                <option value="all">Todos</option>
                <option value="true">Activos</option>
                <option value="false">Inactivos</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('')
                  setCityFilter('')
                  setActiveFilter('all')
                  setCurrentPage(1)
                }}
                className="w-full"
              >
                <Filter className="h-4 w-4 mr-2" />
                Limpiar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Hoteles */}
      {hotels.length > 0 ? (
        <div className="grid gap-6">
          {hotels.map((hotel) => (
            <Card key={hotel.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-3">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{hotel.name}</h3>
                        <div className="flex items-center space-x-4 mt-1">
                          {hotel.code && (
                            <span className="text-sm text-gray-500">Código: {hotel.code}</span>
                          )}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            hotel.isActive 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {hotel.isActive ? 'Activo' : 'Inactivo'}
                          </span>
                          {hotel.rating && (
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-yellow-400 fill-current" />
                              <span className="text-sm text-gray-600 ml-1">{hotel.rating}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {hotel.description && (
                      <p className="text-gray-600 mb-4">{hotel.description}</p>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>{hotel.city}, {hotel.country}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Bed className="h-4 w-4 text-gray-400" />
                        <span>{hotel.totalRooms} habitaciones</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span>{hotel._count.roomTypes} tipos</span>
                      </div>
                      {hotel.phone && (
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-600">{hotel.phone}</span>
                        </div>
                      )}
                    </div>

                    {hotel.address && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-600">{hotel.address}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/dashboard/hotels/${hotel.id}`, '_blank')}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalles
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        console.log('🏨 Edit hotel clicked:', hotel)
                        // Preparar datos limpios para edición
                        const cleanHotel: Hotel = {
                          id: hotel.id,
                          name: hotel.name,
                          code: hotel.code,
                          brand: hotel.brand,
                          description: hotel.description,
                          logoUrl: hotel.logoUrl,
                          address: hotel.address,
                          city: hotel.city,
                          country: hotel.country,
                          postalCode: hotel.postalCode,
                          phone: hotel.phone,
                          email: hotel.email,
                          website: hotel.website,
                          rating: hotel.rating,
                          isActive: hotel.isActive,
                          totalRooms: hotel.totalRooms,
                          createdAt: hotel.createdAt,
                          roomTypes: hotel.roomTypes,
                          _count: hotel._count
                        }
                        console.log('🔧 Clean hotel data:', cleanHotel)
                        setEditingHotel(cleanHotel)
                        console.log('✅ editingHotel state set')
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(hotel)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Room Types Preview */}
                {hotel.roomTypes.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Tipos de Habitación:</h4>
                    <div className="flex flex-wrap gap-2">
                      {hotel.roomTypes.slice(0, 3).map((roomType) => (
                        <span 
                          key={roomType.id}
                          className="px-2 py-1 bg-gray-50 text-gray-700 text-xs rounded border"
                        >
                          {roomType.name} - ${roomType.baseRate}/noche ({roomType.occupancy} pax)
                        </span>
                      ))}
                      {hotel.roomTypes.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded">
                          +{hotel.roomTypes.length - 3} más
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <Hotel className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay hoteles</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || cityFilter ? 'No se encontraron hoteles con los filtros aplicados.' : 'Comienza agregando tu primer hotel.'}
            </p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Primer Hotel
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Paginación */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Página {pagination.currentPage} de {pagination.totalPages}
            {' '}({pagination.totalCount} hoteles total)
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === pagination.totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}

      {/* Modal de crear/editar hotel */}
      {(showCreateForm || editingHotel) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingHotel ? 'Editar Hotel' : 'Crear Nuevo Hotel'}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowCreateForm(false)
                    setEditingHotel(null)
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="p-6">
              <HotelForm
                hotel={editingHotel}
                onClose={() => {
                  setShowCreateForm(false)
                  setEditingHotel(null)
                }}
                onSave={() => {
                  fetchHotels()
                  setShowCreateForm(false)
                  setEditingHotel(null)
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
