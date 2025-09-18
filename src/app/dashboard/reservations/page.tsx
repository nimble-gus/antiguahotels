'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UnifiedReservationForm } from '@/components/forms/unified-reservation-form'
import { EditReservationForm } from '@/components/forms/edit-reservation-form'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Calendar, 
  User,
  Hotel,
  DollarSign,
  Search,
  Filter,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  X
} from 'lucide-react'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'

interface Reservation {
  id: string
  confirmationNumber: string
  status: string
  checkin?: string
  checkout?: string
  totalAmount: string
  paymentStatus: string
  specialRequests?: string
  notes?: string
  source: string
  createdAt: string
  guest: {
    firstName: string
    lastName: string
    email?: string
    phone?: string
    country?: string
  }
  reservationItems: ReservationItem[]
  payments: Payment[]
}

interface ReservationItem {
  id: string
  itemType: string
  title: string
  quantity: number
  unitPrice: string
  amount: string
  accommodationStay?: {
    nights: number
    adults: number
    children: number
    checkInDate: string
    checkOutDate: string
    guestName?: string
    hotel: {
      name: string
      code?: string
    }
    roomType: {
      name: string
    }
    assignedRoom?: {
      code: string
    }
  }
}

interface Payment {
  amount: string
  status: string
  paymentMethod: string
  processedAt?: string
}

export default function ReservationsPage() {
  const { data: session, status } = useSession()
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState<any>(null)

  useEffect(() => {
    // Solo hacer la petición cuando la sesión esté cargada
    if (status === 'authenticated') {
      fetchReservations()
    }
  }, [currentPage, searchTerm, statusFilter, status])

  const fetchReservations = async () => {
    try {
      console.log('🔍 Fetching reservations...')
      console.log('👤 Session status:', status)
      console.log('👤 Session data:', session)
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
      })

      if (searchTerm) params.append('search', searchTerm)
      if (statusFilter !== 'all') params.append('status', statusFilter)

      const url = `/api/reservations?${params}`
      console.log('📡 Request URL:', url)

      const response = await fetch(url, {
        credentials: 'include' // Asegurar que las cookies se envíen
      })
      console.log('📊 Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Reservations data:', data)
        setReservations(data.reservations || [])
        setPagination(data.pagination)
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('❌ API Error:', response.status, errorData)
      }
    } catch (error) {
      console.error('💥 Error fetching reservations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditReservation = (reservation: Reservation) => {
    console.log('✏️ Editing reservation:', reservation.confirmationNumber)
    setEditingReservation(reservation)
    setShowEditForm(true)
  }

  const handleDeleteReservation = async (reservation: Reservation) => {
    if (!confirm(`¿Estás seguro de eliminar la reservación ${reservation.confirmationNumber}?`)) {
      return
    }

    try {
      const response = await fetch(`/api/reservations/${reservation.id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        console.log('✅ Reservation deleted successfully')
        fetchReservations() // Refresh the list
      } else {
        const error = await response.json()
        alert(`Error eliminando reservación: ${error.error || 'Error desconocido'}`)
      }
    } catch (error) {
      console.error('Error deleting reservation:', error)
      alert('Error de conexión al eliminar reservación')
    }
  }

  const handleViewReservation = (reservation: Reservation) => {
    // TODO: Implementar modal de vista detallada
    console.log('👁️ Viewing reservation:', reservation.confirmationNumber)
    alert(`Vista detallada de ${reservation.confirmationNumber} - Por implementar`)
  }

  // Mostrar loading mientras se autentica
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Cargando sesión...</span>
      </div>
    )
  }

  // Redirigir si no está autenticado (aunque esto debería manejarse por el middleware)
  if (status === 'unauthenticated') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600">No autorizado. Redirigiendo...</p>
        </div>
      </div>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case 'CONFIRMED':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'CANCELLED':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'NO_SHOW':
        return <AlertCircle className="h-4 w-4 text-gray-600" />
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-blue-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PAID':
        return 'text-green-600 bg-green-50'
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-50'
      case 'PARTIAL':
        return 'text-orange-600 bg-orange-50'
      case 'REFUNDED':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
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
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Reservaciones</h1>
          <p className="text-gray-600">Administra todas las reservaciones del sistema</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Reservación
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
                  placeholder="Número de confirmación, nombre del huésped..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos los estados</option>
                <option value="PENDING">Pendientes</option>
                <option value="CONFIRMED">Confirmadas</option>
                <option value="CANCELLED">Canceladas</option>
                <option value="NO_SHOW">No Show</option>
                <option value="COMPLETED">Completadas</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('')
                  setStatusFilter('all')
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

      {/* Lista de reservaciones */}
      <div className="grid gap-4">
        {reservations.map((reservation) => (
          <Card key={reservation.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Header de reservación */}
                  <div className="flex items-center space-x-4 mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {reservation.confirmationNumber}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {reservation.guest.firstName} {reservation.guest.lastName}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(reservation.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(reservation.status)}`}>
                        {reservation.status}
                      </span>
                    </div>
                  </div>

                  {/* Detalles de la reservación */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Fechas</p>
                      <p className="font-medium">
                        {reservation.checkin && formatDate(reservation.checkin)} - {reservation.checkout && formatDate(reservation.checkout)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total</p>
                      <p className="font-medium">{formatCurrency(parseFloat(reservation.totalAmount))}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Pago</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(reservation.paymentStatus)}`}>
                        {reservation.paymentStatus}
                      </span>
                    </div>
                  </div>

                  {/* Items de reservación */}
                  <div className="space-y-2">
                    {reservation.reservationItems.map((item) => (
                      <div key={item.id} className="bg-gray-50 p-3 rounded-md">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{item.title}</p>
                            {item.accommodationStay && (
                              <div className="text-sm text-gray-600 mt-1">
                                <p>
                                  {item.accommodationStay.adults} adultos
                                  {item.accommodationStay.children > 0 && `, ${item.accommodationStay.children} niños`}
                                  • {item.accommodationStay.nights} noches
                                </p>
                                {item.accommodationStay.assignedRoom && (
                                  <p>Habitación: {item.accommodationStay.assignedRoom.code}</p>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatCurrency(parseFloat(item.amount))}</p>
                            <p className="text-sm text-gray-500">
                              {formatCurrency(parseFloat(item.unitPrice))} x {item.quantity}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Información del huésped */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {reservation.guest.email || 'Sin email'}
                      </div>
                      {reservation.guest.phone && (
                        <div className="flex items-center">
                          📞 {reservation.guest.phone}
                        </div>
                      )}
                      {reservation.guest.country && (
                        <div className="flex items-center">
                          🌍 {reservation.guest.country}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Acciones */}
                <div className="flex flex-col space-y-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleViewReservation(reservation)}
                    title="Ver detalles"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleEditReservation(reservation)}
                    title="Editar reservación"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDeleteReservation(reservation)}
                    title="Eliminar reservación"
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
          <p className="text-sm text-gray-700">
            Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
            {pagination.total} reservaciones
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

      {reservations.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay reservaciones</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'No se encontraron reservaciones con los filtros aplicados.' 
                : 'Comienza creando tu primera reservación.'}
            </p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Primera Reservación
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Formulario de crear reservación */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto w-full">
            <UnifiedReservationForm
              onClose={() => setShowCreateForm(false)}
              onSave={() => {
                fetchReservations()
                setShowCreateForm(false)
              }}
            />
          </div>
        </div>
      )}

      {/* Formulario de editar reservación */}
      {showEditForm && editingReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto w-full">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Editar Reservación {editingReservation.confirmationNumber}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowEditForm(false)
                    setEditingReservation(null)
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="p-6">
              <EditReservationForm
                reservation={editingReservation}
                onClose={() => {
                  setShowEditForm(false)
                  setEditingReservation(null)
                }}
                onSave={() => {
                  fetchReservations()
                  setShowEditForm(false)
                  setEditingReservation(null)
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
