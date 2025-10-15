'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AvailabilityCalendar } from '@/components/availability-calendar'
import { calculateNights, formatDateForDisplay } from '@/lib/date-utils'
import { 
  Save, 
  X, 
  User,
  Hotel,
  Calendar,
  Users,
  DollarSign,
  Plus,
  Search,
  CheckCircle
} from 'lucide-react'

interface Guest {
  id: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  country?: string
}

interface Hotel {
  id: string
  name: string
  code?: string
  city?: string
}

interface RoomType {
  id: string
  name: string
  baseRate: string
  occupancy: number
  maxAdults: number
  maxChildren: number
  bedConfiguration?: string
  isActive: boolean
}

interface Activity {
  id: string
  name: string
  description?: string
  shortDescription?: string
  durationHours?: string
  minParticipants: number
  maxParticipants?: number
  basePrice: string
  currency: string
  location?: string
  isActive: boolean
}

interface ActivitySchedule {
  id: string
  date: string
  startTime: string
  endTime: string
  availableSpots: number
  priceOverride?: string
  isActive: boolean
  _count: {
    activityBookings: number
  }
}

interface ReservationFormProps {
  onClose: () => void
  onSave: () => void
}

export function ReservationForm({ onClose, onSave }: ReservationFormProps) {
  const [step, setStep] = useState(1) // 1: Tipo, 2: Huésped, 3: Servicio, 4: Detalles, 5: Confirmación
  const [loading, setLoading] = useState(false)
  const [reservationType, setReservationType] = useState<'ACCOMMODATION' | 'ACTIVITY'>('ACCOMMODATION')

  // Estados del formulario
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null)
  const [newGuestData, setNewGuestData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: 'Guatemala',
  })
  const [showNewGuestForm, setShowNewGuestForm] = useState(false)

  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null)
  const [selectedRoomType, setSelectedRoomType] = useState<RoomType | null>(null)
  
  // Estados para actividades
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
  const [selectedSchedule, setSelectedSchedule] = useState<ActivitySchedule | null>(null)
  const [activityData, setActivityData] = useState({
    participants: 1,
    participantNames: '',
    emergencyContact: '',
    emergencyPhone: '',
  })
  const [reservationData, setReservationData] = useState({
    checkInDate: '',
    checkOutDate: '',
    adults: 1,
    children: 0,
    specialRequests: '',
    notes: '',
    guestName: '',
  })

  // Datos para selección
  const [guests, setGuests] = useState<Guest[]>([])
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])
  const [guestSearch, setGuestSearch] = useState('')
  const [availabilityStatus, setAvailabilityStatus] = useState<{
    available: boolean
    message: string
    availableRooms: number
  } | null>(null)
  const [checkingAvailability, setCheckingAvailability] = useState(false)

  useEffect(() => {
    fetchGuests()
    fetchHotels()
  }, [])

  useEffect(() => {
    if (selectedHotel) {
      fetchRoomTypes(selectedHotel.id)
    }
  }, [selectedHotel])

  // Verificar disponibilidad cuando cambien las fechas
  useEffect(() => {
    if (selectedRoomType && reservationData.checkInDate && reservationData.checkOutDate) {
      checkAvailability()
    }
  }, [selectedRoomType, reservationData.checkInDate, reservationData.checkOutDate])

  const checkAvailability = async () => {
    if (!selectedRoomType || !reservationData.checkInDate || !reservationData.checkOutDate) {
      return
    }

    setCheckingAvailability(true)
    try {
      const params = new URLSearchParams({
        roomTypeId: selectedRoomType.id.toString(),
        checkInDate: reservationData.checkInDate,
        checkOutDate: reservationData.checkOutDate,
      })

      const response = await fetch(`/api/check-availability?${params}`)

      if (response.ok) {
        const data = await response.json()
        setAvailabilityStatus({
          available: data.available,
          message: data.message,
          availableRooms: data.available ? 1 : 0
        })
        console.log('🔍 Availability check result:', data)
      } else {
        setAvailabilityStatus({
          available: false,
          message: 'Error verificando disponibilidad',
          availableRooms: 0
        })
      }
    } catch (error) {
      console.error('Error checking availability:', error)
    } finally {
      setCheckingAvailability(false)
    }
  }

  const fetchGuests = async () => {
    try {
      const params = new URLSearchParams({ limit: '50' })
      if (guestSearch) params.append('search', guestSearch)
      
      const response = await fetch(`/api/guests?${params}`)
      if (response.ok) {
        const data = await response.json()
        setGuests(data.guests)
      }
    } catch (error) {
      console.error('Error fetching guests:', error)
    }
  }

  const fetchHotels = async () => {
    try {
      const response = await fetch('/api/hotels?limit=100&active=true')
      if (response.ok) {
        const data = await response.json()
        setHotels(data.hotels)
      }
    } catch (error) {
      console.error('Error fetching hotels:', error)
    }
  }

  const fetchRoomTypes = async (hotelId: string) => {
    try {
      const response = await fetch(`/api/hotels/${hotelId}/room-types`)
      if (response.ok) {
        const data = await response.json()
        setRoomTypes(data.filter((rt: RoomType) => rt.isActive))
      }
    } catch (error) {
      console.error('Error fetching room types:', error)
    }
  }

  const createNewGuest = async () => {
    try {
      const response = await fetch('/api/guests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newGuestData),
      })

      if (response.ok) {
        const newGuest = await response.json()
        setSelectedGuest(newGuest)
        setShowNewGuestForm(false)
        setStep(2)
      } else {
        const error = await response.json()
        alert(error.error || 'Error creando huésped')
      }
    } catch (error) {
      console.error('Error creating guest:', error)
      alert('Error de conexión')
    }
  }

  const calculateTotal = () => {
    if (!selectedRoomType || !reservationData.checkInDate || !reservationData.checkOutDate) {
      return 0
    }

    const checkIn = new Date(reservationData.checkInDate)
    const checkOut = new Date(reservationData.checkOutDate)
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
    
    return parseFloat(selectedRoomType.baseRate) * nights
  }

  const handleSubmit = async () => {
    setLoading(true)

    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          guestId: selectedGuest?.id,
          hotelId: selectedHotel?.id,
          roomTypeId: selectedRoomType?.id,
          checkInDate: reservationData.checkInDate,
          checkOutDate: reservationData.checkOutDate,
          adults: reservationData.adults,
          children: reservationData.children,
          specialRequests: reservationData.specialRequests,
          notes: reservationData.notes,
          guestName: reservationData.guestName || `${selectedGuest?.firstName} ${selectedGuest?.lastName}`,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        alert(`Reservación creada exitosamente!\nNúmero de confirmación: ${result.confirmationNumber}`)
        onSave()
        onClose()
      } else {
        const error = await response.json()
        alert(error.error || 'Error creando reservación')
      }
    } catch (error) {
      console.error('Error creating reservation:', error)
      alert('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Crear Nueva Reservación</CardTitle>
        <CardDescription>
          Paso {step} de 4: {
            step === 1 ? 'Seleccionar o crear huésped' :
            step === 2 ? 'Seleccionar hotel y tipo de habitación' :
            step === 3 ? 'Detalles de la reservación' :
            'Confirmación'
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {/* Paso 1: Tipo de Reservación */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Tipo de Reservación</h3>
              <p className="text-gray-600">Selecciona qué tipo de servicio deseas reservar</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card 
                className={`cursor-pointer transition-all ${
                  reservationType === 'ACCOMMODATION' 
                    ? 'ring-2 ring-blue-500 bg-blue-50' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => setReservationType('ACCOMMODATION')}
              >
                <CardContent className="p-6 text-center">
                  <Hotel className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Alojamiento</h4>
                  <p className="text-gray-600 text-sm">
                    Reservar habitaciones de hotel con fechas de check-in y check-out
                  </p>
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer transition-all ${
                  reservationType === 'ACTIVITY' 
                    ? 'ring-2 ring-blue-500 bg-blue-50' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => setReservationType('ACTIVITY')}
              >
                <CardContent className="p-6 text-center">
                  <div className="h-12 w-12 text-green-500 mx-auto mb-4 flex items-center justify-center">
                    📍
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Actividad</h4>
                  <p className="text-gray-600 text-sm">
                    Reservar actividades turísticas en horarios específicos
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Paso 2: Seleccionar Huésped */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Seleccionar Huésped</h3>
              <Button 
                variant="outline" 
                onClick={() => setShowNewGuestForm(!showNewGuestForm)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Huésped
              </Button>
            </div>

            {/* Formulario de nuevo huésped */}
            {showNewGuestForm && (
              <Card>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Nombre *"
                      value={newGuestData.firstName}
                      onChange={(e) => setNewGuestData(prev => ({ ...prev, firstName: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Apellido *"
                      value={newGuestData.lastName}
                      onChange={(e) => setNewGuestData(prev => ({ ...prev, lastName: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={newGuestData.email}
                      onChange={(e) => setNewGuestData(prev => ({ ...prev, email: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="tel"
                      placeholder="Teléfono"
                      value={newGuestData.phone}
                      onChange={(e) => setNewGuestData(prev => ({ ...prev, phone: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <Button 
                    onClick={createNewGuest}
                    className="mt-4"
                    disabled={!newGuestData.firstName || !newGuestData.lastName}
                  >
                    Crear y Seleccionar
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Búsqueda de huéspedes */}
            <div>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={guestSearch}
                  onChange={(e) => setGuestSearch(e.target.value)}
                  placeholder="Buscar huésped por nombre, email..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <Button variant="outline" onClick={fetchGuests} className="mb-4">
                Buscar
              </Button>
            </div>

            {/* Lista de huéspedes */}
            <div className="grid gap-3 max-h-64 overflow-y-auto">
              {guests.map((guest) => (
                <div
                  key={guest.id}
                  onClick={() => {
                    setSelectedGuest(guest)
                    setStep(2)
                  }}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedGuest?.id === guest.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium">{guest.firstName} {guest.lastName}</p>
                      <p className="text-sm text-gray-600">
                        {guest.email || 'Sin email'} • {guest.phone || 'Sin teléfono'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Paso 3: Seleccionar Hotel y Habitación (Solo para Alojamiento) */}
        {step === 3 && reservationType === 'ACCOMMODATION' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Seleccionar Hotel y Habitación</h3>
              <p className="text-sm text-gray-600">
                Huésped: {selectedGuest?.firstName} {selectedGuest?.lastName}
              </p>
            </div>

            {/* Selección de hotel */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hotel</label>
              <div className="grid gap-3">
                {hotels.map((hotel) => (
                  <div
                    key={hotel.id}
                    onClick={() => setSelectedHotel(hotel)}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedHotel?.id === hotel.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Hotel className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium">{hotel.name}</p>
                        <p className="text-sm text-gray-600">
                          {hotel.code} • {hotel.city}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Selección de tipo de habitación */}
            {selectedHotel && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Habitación
                </label>
                <div className="grid gap-3">
                  {roomTypes.map((roomType) => (
                    <div
                      key={roomType.id}
                      onClick={() => {
                        setSelectedRoomType(roomType)
                        setStep(3)
                      }}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedRoomType?.id === roomType.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{roomType.name}</p>
                          <p className="text-sm text-gray-600">
                            {roomType.bedConfiguration} • Hasta {roomType.occupancy} huéspedes
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">
                            ${roomType.baseRate}/noche
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Paso 3: Detalles de la Reservación */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Detalles de la Reservación</h3>
              <div className="text-sm text-gray-600">
                {selectedGuest?.firstName} • {selectedHotel?.name} • {selectedRoomType?.name}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Calendario de Disponibilidad */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Seleccionar Fechas</h4>
                
                {selectedRoomType ? (
                  <AvailabilityCalendar
                    roomTypeId={selectedRoomType.id}
                    onDateRangeSelect={(checkIn, checkOut) => {
                      console.log('📝 Form receiving dates:', { checkIn, checkOut })
                      setReservationData(prev => ({
                        ...prev,
                        checkInDate: checkIn,
                        checkOutDate: checkOut || ''
                      }))
                    }}
                    selectedCheckIn={reservationData.checkInDate}
                    selectedCheckOut={reservationData.checkOutDate}
                    minNights={1}
                    maxNights={30}
                  />
                ) : (
                  <div className="p-6 bg-gray-50 rounded-lg text-center">
                    <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">
                      Selecciona un tipo de habitación para ver disponibilidad
                    </p>
                  </div>
                )}

                {/* Fechas seleccionadas */}
                {reservationData.checkInDate && reservationData.checkOutDate && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-900">Fechas Confirmadas</span>
                    </div>
                    <div className="text-sm text-green-800">
                      <p><strong>Check-in:</strong> {formatDateForDisplay(reservationData.checkInDate)}</p>
                      <p><strong>Check-out:</strong> {formatDateForDisplay(reservationData.checkOutDate)}</p>
                      <p><strong>Noches:</strong> {calculateNights(reservationData.checkInDate, reservationData.checkOutDate)}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Huéspedes */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Número de Huéspedes</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adultos *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={selectedRoomType?.maxAdults || 4}
                    value={reservationData.adults}
                    onChange={(e) => setReservationData(prev => ({ ...prev, adults: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Niños
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={selectedRoomType?.maxChildren || 2}
                    value={reservationData.children}
                    onChange={(e) => setReservationData(prev => ({ ...prev, children: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Solicitudes especiales */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Solicitudes Especiales
              </label>
              <textarea
                value={reservationData.specialRequests}
                onChange={(e) => setReservationData(prev => ({ ...prev, specialRequests: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Cama extra, vista específica, alergias alimentarias..."
              />
            </div>

            {/* Notas internas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas Internas (Solo Admin)
              </label>
              <textarea
                value={reservationData.notes}
                onChange={(e) => setReservationData(prev => ({ ...prev, notes: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Notas para el personal del hotel..."
              />
            </div>

            {/* Estado de disponibilidad */}
            {checkingAvailability && (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                  <span className="text-yellow-800">Verificando disponibilidad...</span>
                </div>
              </div>
            )}

            {availabilityStatus && !checkingAvailability && (
              <div className={`p-4 rounded-lg ${
                availabilityStatus.available 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center space-x-2 mb-2">
                  {availabilityStatus.available ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <X className="h-5 w-5 text-red-600" />
                  )}
                  <span className={`font-medium ${
                    availabilityStatus.available ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {availabilityStatus.available ? 'Disponible' : 'No Disponible'}
                  </span>
                </div>
                <p className={`text-sm ${
                  availabilityStatus.available ? 'text-green-800' : 'text-red-800'
                }`}>
                  {availabilityStatus.message}
                </p>
                {availabilityStatus.available && (
                  <p className="text-xs text-green-700 mt-1">
                    {availabilityStatus.availableRooms} habitaciones disponibles
                  </p>
                )}
              </div>
            )}

            {/* Resumen de precio */}
            {reservationData.checkInDate && reservationData.checkOutDate && availabilityStatus?.available && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Resumen de Precio</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Precio por noche:</span>
                    <span>${selectedRoomType?.baseRate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Noches:</span>
                    <span>
                      {Math.ceil((new Date(reservationData.checkOutDate).getTime() - new Date(reservationData.checkInDate).getTime()) / (1000 * 60 * 60 * 24))}
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold text-blue-900 border-t pt-1">
                    <span>Total:</span>
                    <span>${calculateTotal()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Paso 4: Confirmación */}
        {step === 4 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Confirmar Reservación</h3>
            
            <div className="bg-gray-50 p-6 rounded-lg space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Información del Huésped</h4>
                  <p>{selectedGuest?.firstName} {selectedGuest?.lastName}</p>
                  <p className="text-sm text-gray-600">{selectedGuest?.email}</p>
                  <p className="text-sm text-gray-600">{selectedGuest?.phone}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Detalles de la Reservación</h4>
                  <p>{selectedHotel?.name}</p>
                  <p className="text-sm text-gray-600">{selectedRoomType?.name}</p>
                  <p className="text-sm text-gray-600">
                    {reservationData.checkInDate} a {reservationData.checkOutDate}
                  </p>
                  <p className="text-sm text-gray-600">
                    {reservationData.adults} adultos{reservationData.children > 0 && `, ${reservationData.children} niños`}
                  </p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total a Pagar:</span>
                  <span className="text-2xl font-bold text-green-600">
                    ${calculateTotal()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navegación */}
        <div className="flex justify-between pt-6 border-t border-gray-200">
          <div>
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                Anterior
              </Button>
            )}
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            
            {step < 4 ? (
              <Button 
                onClick={() => setStep(step + 1)}
                disabled={
                  (step === 1 && !selectedGuest) ||
                  (step === 2 && (!selectedHotel || !selectedRoomType)) ||
                  (step === 3 && (
                    !reservationData.checkInDate || 
                    !reservationData.checkOutDate || 
                    !availabilityStatus?.available ||
                    checkingAvailability
                  ))
                }
              >
                {step === 3 && checkingAvailability ? 'Verificando...' : 'Siguiente'}
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {loading ? 'Creando...' : 'Crear Reservación'}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
