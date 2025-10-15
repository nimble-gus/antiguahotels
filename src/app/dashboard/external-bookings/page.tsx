'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar,
  Building,
  Users,
  DollarSign,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Edit,
  Trash2,
  Download,
  RefreshCw
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface ExternalBooking {
  id: string
  externalId: string
  platform: string
  confirmationNumber: string
  hotelId: string
  roomTypeId: string | null
  guestName: string
  guestEmail: string | null
  guestPhone: string | null
  checkIn: string
  checkOut: string
  adults: number
  children: number
  rooms: number
  totalAmount: string
  currency: string
  status: string
  platformStatus: string | null
  specialRequests: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
  hotel: {
    id: string
    name: string
    code: string
  }
  roomType: {
    id: string
    name: string
  } | null
  externalBookingItems: Array<{
    id: string
    itemType: string
    title: string
    description: string | null
    quantity: number
    unitPrice: string
    totalPrice: string
    currency: string
    serviceDate: string | null
  }>
}

interface Hotel {
  id: string
  name: string
  code: string
}

export default function ExternalBookingsPage() {
  const [bookings, setBookings] = useState<ExternalBooking[]>([])
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  })
  const [filters, setFilters] = useState({
    platform: '',
    hotelId: '',
    status: '',
    checkInFrom: '',
    checkInTo: '',
    search: ''
  })
  const [showFilters, setShowFilters] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<ExternalBooking | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)

  // Cargar hoteles
  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const response = await fetch('/api/hotels')
        if (response.ok) {
          const data = await response.json()
          setHotels(data.hotels || [])
        }
      } catch (error) {
        console.error('Error fetching hotels:', error)
      }
    }
    fetchHotels()
  }, [])

  // Cargar reservaciones externas
  const fetchBookings = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== ''))
      })

      const response = await fetch(`/api/external-bookings?${params}`)
      if (response.ok) {
        const data = await response.json()
        setBookings(data.bookings || [])
        setPagination(data.pagination || pagination)
      }
    } catch (error) {
      console.error('Error fetching external bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [pagination.page, filters])

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      CONFIRMED: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      CANCELLED: { color: 'bg-red-100 text-red-800', icon: XCircle },
      NO_SHOW: { color: 'bg-gray-100 text-gray-800', icon: XCircle },
      COMPLETED: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      MODIFIED: { color: 'bg-orange-100 text-orange-800', icon: Edit }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING
    const IconComponent = config.icon

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <IconComponent className="h-3 w-3" />
        {status}
      </Badge>
    )
  }

  const getPlatformBadge = (platform: string) => {
    const platformColors = {
      BOOKING_COM: 'bg-blue-100 text-blue-800',
      EXPEDIA: 'bg-purple-100 text-purple-800',
      AIRBNB: 'bg-pink-100 text-pink-800',
      HOTELS_COM: 'bg-green-100 text-green-800',
      AGODA: 'bg-orange-100 text-orange-800',
      TRIVAGO: 'bg-red-100 text-red-800',
      DIRECT_BOOKING: 'bg-gray-100 text-gray-800',
      OTHER: 'bg-gray-100 text-gray-800'
    }

    return (
      <Badge className={platformColors[platform as keyof typeof platformColors] || platformColors.OTHER}>
        {platform.replace('_', ' ')}
      </Badge>
    )
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reservaciones Externas</h1>
          <p className="text-gray-600">Gestiona reservaciones de Booking.com y otras plataformas</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filtros
          </Button>
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nueva Reservación
          </Button>
        </div>
      </div>

      {/* Filtros */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="platform">Plataforma</Label>
                <Select value={filters.platform} onValueChange={(value) => handleFilterChange('platform', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las plataformas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas las plataformas</SelectItem>
                    <SelectItem value="BOOKING_COM">Booking.com</SelectItem>
                    <SelectItem value="EXPEDIA">Expedia</SelectItem>
                    <SelectItem value="AIRBNB">Airbnb</SelectItem>
                    <SelectItem value="HOTELS_COM">Hotels.com</SelectItem>
                    <SelectItem value="AGODA">Agoda</SelectItem>
                    <SelectItem value="TRIVAGO">Trivago</SelectItem>
                    <SelectItem value="DIRECT_BOOKING">Reserva Directa</SelectItem>
                    <SelectItem value="OTHER">Otra</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="hotelId">Hotel</Label>
                <Select value={filters.hotelId} onValueChange={(value) => handleFilterChange('hotelId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los hoteles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos los hoteles</SelectItem>
                    {hotels.map((hotel) => (
                      <SelectItem key={hotel.id} value={hotel.id}>
                        {hotel.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">Estado</Label>
                <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos los estados</SelectItem>
                    <SelectItem value="PENDING">Pendiente</SelectItem>
                    <SelectItem value="CONFIRMED">Confirmada</SelectItem>
                    <SelectItem value="CANCELLED">Cancelada</SelectItem>
                    <SelectItem value="NO_SHOW">No Show</SelectItem>
                    <SelectItem value="COMPLETED">Completada</SelectItem>
                    <SelectItem value="MODIFIED">Modificada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="search">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Nombre, email, confirmación..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="checkInFrom">Check-in desde</Label>
                <Input
                  id="checkInFrom"
                  type="date"
                  value={filters.checkInFrom}
                  onChange={(e) => handleFilterChange('checkInFrom', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="checkInTo">Check-in hasta</Label>
                <Input
                  id="checkInTo"
                  type="date"
                  value={filters.checkInTo}
                  onChange={(e) => handleFilterChange('checkInTo', e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setFilters({
                    platform: '',
                    hotelId: '',
                    status: '',
                    checkInFrom: '',
                    checkInTo: '',
                    search: ''
                  })
                }}
              >
                Limpiar
              </Button>
              <Button onClick={fetchBookings}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Aplicar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de reservaciones */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Reservaciones Externas</CardTitle>
              <CardDescription>
                {pagination.total} reservaciones encontradas
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-8">
              <Building className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No se encontraron reservaciones externas</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getPlatformBadge(booking.platform)}
                        {getStatusBadge(booking.status)}
                        <Badge variant="outline">
                          {booking.confirmationNumber}
                        </Badge>
                      </div>
                      
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {booking.guestName}
                      </h3>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Building className="h-4 w-4" />
                          {booking.hotel.name}
                        </div>
                        {booking.roomType && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {booking.roomType.name}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {booking.adults} adultos, {booking.children} niños
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          {booking.currency} {parseFloat(booking.totalAmount).toFixed(2)}
                        </div>
                      </div>

                      {booking.specialRequests && (
                        <div className="mt-2 p-2 bg-yellow-50 rounded text-sm">
                          <strong>Solicitudes especiales:</strong> {booking.specialRequests}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedBooking(booking)
                          setShowDetailsDialog(true)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Paginación */}
          {pagination.pages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                Anterior
              </Button>
              
              <span className="text-sm text-gray-600">
                Página {pagination.page} de {pagination.pages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
              >
                Siguiente
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de detalles */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles de la Reservación Externa</DialogTitle>
            <DialogDescription>
              Información completa de la reservación
            </DialogDescription>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="space-y-6">
              {/* Información básica */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Información de la Reservación</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>ID Externo:</strong> {selectedBooking.externalId}</div>
                    <div><strong>Plataforma:</strong> {selectedBooking.platform}</div>
                    <div><strong>Confirmación:</strong> {selectedBooking.confirmationNumber}</div>
                    <div><strong>Estado:</strong> {selectedBooking.status}</div>
                    <div><strong>Hotel:</strong> {selectedBooking.hotel.name}</div>
                    {selectedBooking.roomType && (
                      <div><strong>Tipo de Habitación:</strong> {selectedBooking.roomType.name}</div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Información del Huésped</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Nombre:</strong> {selectedBooking.guestName}</div>
                    {selectedBooking.guestEmail && (
                      <div><strong>Email:</strong> {selectedBooking.guestEmail}</div>
                    )}
                    {selectedBooking.guestPhone && (
                      <div><strong>Teléfono:</strong> {selectedBooking.guestPhone}</div>
                    )}
                    <div><strong>Adultos:</strong> {selectedBooking.adults}</div>
                    <div><strong>Niños:</strong> {selectedBooking.children}</div>
                    <div><strong>Habitaciones:</strong> {selectedBooking.rooms}</div>
                  </div>
                </div>
              </div>

              {/* Fechas y precios */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Fechas</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Check-in:</strong> {new Date(selectedBooking.checkIn).toLocaleDateString()}</div>
                    <div><strong>Check-out:</strong> {new Date(selectedBooking.checkOut).toLocaleDateString()}</div>
                    <div><strong>Noches:</strong> {
                      Math.ceil((new Date(selectedBooking.checkOut).getTime() - new Date(selectedBooking.checkIn).getTime()) / (1000 * 60 * 60 * 24))
                    }</div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Precios</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Total:</strong> {selectedBooking.currency} {parseFloat(selectedBooking.totalAmount).toFixed(2)}</div>
                    <div><strong>Por noche:</strong> {selectedBooking.currency} {
                      (parseFloat(selectedBooking.totalAmount) / Math.ceil((new Date(selectedBooking.checkOut).getTime() - new Date(selectedBooking.checkIn).getTime()) / (1000 * 60 * 60 * 24))).toFixed(2)
                    }</div>
                  </div>
                </div>
              </div>

              {/* Items de la reservación */}
              {selectedBooking.externalBookingItems.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Items de la Reservación</h3>
                  <div className="space-y-2">
                    {selectedBooking.externalBookingItems.map((item) => (
                      <div key={item.id} className="border rounded p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{item.title}</div>
                            {item.description && (
                              <div className="text-sm text-gray-600">{item.description}</div>
                            )}
                            <div className="text-sm text-gray-500">
                              Cantidad: {item.quantity} | 
                              Precio unitario: {item.currency} {parseFloat(item.unitPrice).toFixed(2)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">
                              {item.currency} {parseFloat(item.totalPrice).toFixed(2)}
                            </div>
                            {item.serviceDate && (
                              <div className="text-sm text-gray-500">
                                {new Date(item.serviceDate).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notas y solicitudes especiales */}
              {(selectedBooking.specialRequests || selectedBooking.notes) && (
                <div>
                  <h3 className="font-semibold mb-2">Notas y Solicitudes</h3>
                  <div className="space-y-2">
                    {selectedBooking.specialRequests && (
                      <div className="p-3 bg-yellow-50 rounded">
                        <div className="font-medium text-yellow-800">Solicitudes Especiales:</div>
                        <div className="text-yellow-700">{selectedBooking.specialRequests}</div>
                      </div>
                    )}
                    {selectedBooking.notes && (
                      <div className="p-3 bg-gray-50 rounded">
                        <div className="font-medium text-gray-800">Notas:</div>
                        <div className="text-gray-700">{selectedBooking.notes}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}






