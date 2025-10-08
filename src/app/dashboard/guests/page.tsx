'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Plus, 
  Edit, 
  Trash2, 
  User, 
  Mail,
  Phone,
  MapPin,
  Calendar,
  Search,
  Filter,
  Eye,
  Users as UsersIcon
} from 'lucide-react'

interface Guest {
  id: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  country?: string
  dateOfBirth?: string
  passportNumber?: string
  nationality?: string
  createdAt: string
  _count: {
    reservations: number
  }
}

export default function GuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState<any>(null)

  useEffect(() => {
    fetchGuests()
  }, [currentPage, searchTerm])

  const fetchGuests = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '15',
      })

      if (searchTerm) params.append('search', searchTerm)

      const response = await fetch(`/api/guests?${params}`)
      if (response.ok) {
        const data = await response.json()
        setGuests(data.guests)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching guests:', error)
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Huéspedes</h1>
          <p className="text-gray-600">Administra la información de todos los huéspedes</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Huésped
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Buscar Huésped
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nombre, email, teléfono..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('')
                  setCurrentPage(1)
                }}
                className="w-full"
              >
                <Filter className="h-4 w-4 mr-2" />
                Limpiar Búsqueda
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de huéspedes */}
      <div className="grid gap-4">
        {guests.map((guest) => (
          <Card key={guest.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {guest.firstName} {guest.lastName}
                    </h3>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                      {guest.email && (
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-1" />
                          {guest.email}
                        </div>
                      )}
                      {guest.phone && (
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-1" />
                          {guest.phone}
                        </div>
                      )}
                      {guest.country && (
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {guest.country}
                        </div>
                      )}
                    </div>

                    {guest.dateOfBirth && (
                      <p className="text-sm text-gray-500 mt-1">
                        <Calendar className="h-4 w-4 inline mr-1" />
                        Nacimiento: {new Date(guest.dateOfBirth).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Reservaciones</p>
                    <p className="text-lg font-semibold text-blue-600">
                      {guest._count.reservations}
                    </p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setEditingGuest(guest)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Paginación */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-700">
            Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
            {pagination.total} huéspedes
          </p>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              Anterior
            </Button>
            
            <span className="px-3 py-2 text-sm">
              Página {pagination.page} de {pagination.pages}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}

      {guests.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay huéspedes</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm 
                ? 'No se encontraron huéspedes con el término de búsqueda.' 
                : 'Los huéspedes se crearán automáticamente al hacer reservaciones.'}
            </p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Primer Huésped
            </Button>
          </CardContent>
        </Card>
      )}

      {/* TODO: Formulario de huésped */}
      {(showCreateForm || editingGuest) && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingGuest ? 'Editar Huésped' : 'Crear Nuevo Huésped'}
            </CardTitle>
            <CardDescription>
              Formulario de huésped próximamente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              El formulario de huésped estará disponible en la siguiente implementación.
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowCreateForm(false)
                setEditingGuest(null)
              }}
              className="mt-4"
            >
              Cerrar
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}





