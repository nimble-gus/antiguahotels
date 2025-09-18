'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Package,
  MapPin,
  Clock,
  Users,
  DollarSign,
  Calendar,
  Hotel,
  Search,
  Filter,
  Eye,
  Star,
  X,
  Image as ImageIcon
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { PackageForm } from '@/components/forms/package-form'

interface PackageItem {
  id: string
  name: string
  description: string
  shortDescription?: string
  durationDays: number
  durationNights: number
  minParticipants: number
  maxParticipants?: number
  basePrice: string
  currency: string
  capacity?: number
  active: boolean
  createdAt: string
  packageHotels: PackageHotel[]
  packageActivities: PackageActivity[]
  primaryImage?: {
    id: string
    imageUrl: string
    altText?: string
  } | null
  _count: {
    packageBookings: number
    packageSessions: number
  }
}

interface PackageHotel {
  id: string
  hotelId: string
  roomTypeId: string
  nights: number
  checkInDay: number
  hotel: {
    name: string
    city?: string
  }
  roomType: {
    name: string
  }
}

interface PackageActivity {
  id: string
  activityId: string
  dayNumber: number
  participantsIncluded?: number
  activity: {
    name: string
    durationHours: number
  }
}

export default function PackagesPage() {
  const [packages, setPackages] = useState<PackageItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingPackage, setEditingPackage] = useState<PackageItem | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState<any>(null)

  useEffect(() => {
    fetchPackages()
  }, [currentPage, searchTerm, activeFilter])

  const fetchPackages = async () => {
    try {
      console.log('📦 Fetching packages...')
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
      })

      if (searchTerm) params.append('search', searchTerm)
      if (activeFilter !== 'all') params.append('active', activeFilter)

      const response = await fetch(`/api/packages?${params}`)
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Packages data:', data)
        setPackages(data.packages || [])
        setPagination(data.pagination)
      } else {
        console.error('❌ Error fetching packages:', response.status)
      }
    } catch (error) {
      console.error('💥 Error fetching packages:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditPackage = (pkg: PackageItem) => {
    console.log('✏️ Editing package:', pkg.name)
    setEditingPackage(pkg)
    setShowCreateForm(true)
  }

  const handleDeletePackage = async (pkg: PackageItem) => {
    if (!confirm(`¿Estás seguro de eliminar el paquete "${pkg.name}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/packages/${pkg.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        console.log('✅ Package deleted successfully')
        fetchPackages()
      } else {
        const error = await response.json()
        alert(`Error eliminando paquete: ${error.error || 'Error desconocido'}`)
      }
    } catch (error) {
      console.error('Error deleting package:', error)
      alert('Error de conexión al eliminar paquete')
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
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Paquetes</h1>
          <p className="text-gray-600">Administra paquetes turísticos que combinan hoteles y actividades</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Paquete
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  placeholder="Nombre del paquete, descripción..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
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

      {/* Lista de Paquetes */}
      <div className="grid gap-6">
        {packages.map((pkg) => (
          <Card key={pkg.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Header del paquete con imagen */}
                  <div className="flex items-start space-x-4 mb-3">
                    {/* Imagen principal */}
                    <div className="flex-shrink-0">
                      {pkg.primaryImage ? (
                        <img 
                          src={pkg.primaryImage.imageUrl} 
                          alt={pkg.primaryImage.altText || pkg.name}
                          className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
                          <Package className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    {/* Información del paquete */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Package className="h-5 w-5 text-blue-600" />
                        <h3 className="text-xl font-semibold text-gray-900">{pkg.name}</h3>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {pkg.durationDays} días, {pkg.durationNights} noches
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          Para {pkg.capacity || pkg.maxParticipants || '∞'} personas exactas
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          pkg.active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {pkg.active ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Descripción */}
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {pkg.shortDescription || pkg.description}
                  </p>

                  {/* Precios */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-blue-600 font-medium">💰 Precio Total del Paquete</p>
                      <p className="text-lg font-bold text-blue-900">
                        {formatCurrency(parseFloat(pkg.basePrice))}
                      </p>
                      <p className="text-xs text-blue-600">
                        Para {pkg.capacity || pkg.maxParticipants} personas completas
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600 font-medium">Reservaciones</p>
                      <p className="text-lg font-bold text-gray-900">
                        {pkg._count.packageBookings}
                      </p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <p className="text-sm text-purple-600 font-medium">Sesiones</p>
                      <p className="text-lg font-bold text-purple-900">
                        {pkg._count.packageSessions}
                      </p>
                    </div>
                  </div>

                  {/* Hoteles incluidos */}
                  {pkg.packageHotels.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">🏨 Hoteles Incluidos:</p>
                      <div className="flex flex-wrap gap-2">
                        {pkg.packageHotels.map((ph) => (
                          <span key={ph.id} className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            <Hotel className="h-3 w-3 mr-1" />
                            {ph.hotel.name} ({ph.roomType.name}) - {ph.nights}n
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actividades incluidas */}
                  {pkg.packageActivities.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">🎯 Actividades Incluidas:</p>
                      <div className="flex flex-wrap gap-2">
                        {pkg.packageActivities.map((pa) => (
                          <span key={pa.id} className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            <MapPin className="h-3 w-3 mr-1" />
                            {pa.activity.name} (Día {pa.dayNumber})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Acciones */}
                <div className="flex flex-col space-y-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => window.open(`/dashboard/packages/${pkg.id}/images`, '_blank')}
                    title="Gestionar imágenes"
                    className="text-purple-600 hover:text-purple-700"
                  >
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => alert(`Vista detallada de ${pkg.name} - Por implementar`)}
                    title="Ver detalles"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleEditPackage(pkg)}
                    title="Editar paquete"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDeletePackage(pkg)}
                    title="Eliminar paquete"
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
            Mostrando {((currentPage - 1) * pagination.limit) + 1} a {Math.min(currentPage * pagination.limit, pagination.total)} de {pagination.total} paquetes
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage >= pagination.pages}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}

      {packages.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay paquetes</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || activeFilter !== 'all' 
                ? 'No se encontraron paquetes con los filtros aplicados.' 
                : 'Comienza creando tu primer paquete turístico.'}
            </p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Primer Paquete
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Modal de crear/editar paquete */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingPackage ? 'Editar Paquete' : 'Crear Nuevo Paquete'}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowCreateForm(false)
                    setEditingPackage(null)
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="p-6">
              <PackageForm
                package={editingPackage}
                onClose={() => {
                  setShowCreateForm(false)
                  setEditingPackage(null)
                }}
                onSave={() => {
                  fetchPackages()
                  setShowCreateForm(false)
                  setEditingPackage(null)
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
