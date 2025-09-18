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
  MapPin,
  Calendar,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  ArrowRight
} from 'lucide-react'

// Interfaces
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

interface UnifiedReservationFormProps {
  onClose: () => void
  onSave: () => void
  reservation?: any // Para edición de reservaciones existentes
}

export function UnifiedReservationForm({ onClose, onSave, reservation }: UnifiedReservationFormProps) {
  const [step, setStep] = useState(1) // 1: Tipo, 2: Huésped, 3: Servicio, 4: Confirmación
  const [loading, setLoading] = useState(false)
  const [reservationType, setReservationType] = useState<'ACCOMMODATION' | 'ACTIVITY'>('ACCOMMODATION')

  // Estados comunes
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null)
  const [guests, setGuests] = useState<Guest[]>([])
  const [guestSearch, setGuestSearch] = useState('')
  const [showCreateGuest, setShowCreateGuest] = useState(false)
  const [newGuestData, setNewGuestData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '',
    documentType: '',
    documentNumber: '',
  })

  // Estados para alojamiento
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null)
  const [selectedRoomType, setSelectedRoomType] = useState<RoomType | null>(null)
  const [accommodationData, setAccommodationData] = useState({
    checkInDate: '',
    checkOutDate: '',
    adults: 1,
    children: 0,
    specialRequests: '',
    guestName: '',
  })

  // Estados para actividades
  const [activities, setActivities] = useState<Activity[]>([])
  const [activitySchedules, setActivitySchedules] = useState<ActivitySchedule[]>([])
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
  const [selectedSchedule, setSelectedSchedule] = useState<ActivitySchedule | null>(null)
  const [activityData, setActivityData] = useState({
    participants: 1,
    participantNames: '',
    emergencyContact: '',
    emergencyPhone: '',
  })

  // Estados de disponibilidad
  const [availabilityStatus, setAvailabilityStatus] = useState<{
    available: boolean
    message: string
    availableRooms?: number
  } | null>(null)
  const [checkingAvailability, setCheckingAvailability] = useState(false)

  // Fetch data functions
  useEffect(() => {
    fetchGuests()
    if (reservationType === 'ACCOMMODATION') {
      fetchHotels()
    } else {
      fetchActivities()
    }
  }, [reservationType])

  // Cargar tipos de habitación cuando se selecciona un hotel
  useEffect(() => {
    console.log('🔄 Hotel selection changed:', selectedHotel)
    if (selectedHotel) {
      console.log('🏨 Selected hotel ID:', selectedHotel.id)
      fetchRoomTypes(selectedHotel.id)
      // Limpiar selecciones anteriores
      setSelectedRoomType(null)
      setAccommodationData({
        ...accommodationData,
        checkInDate: '',
        checkOutDate: ''
      })
    } else {
      console.log('🏨 No hotel selected, clearing room types')
      setRoomTypes([])
      setSelectedRoomType(null)
    }
  }, [selectedHotel])

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
      console.log('🏨 Fetching room types for hotel:', hotelId)
      const response = await fetch(`/api/hotels/${hotelId}/room-types?active=true`)
      console.log('📊 Room types response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('🏠 Room types data:', data)
        setRoomTypes(data.roomTypes || [])
        console.log('✅ Room types set:', data.roomTypes?.length || 0, 'types')
      } else {
        console.error('❌ Failed to fetch room types:', response.status)
        setRoomTypes([])
      }
    } catch (error) {
      console.error('💥 Error fetching room types:', error)
      setRoomTypes([])
    }
  }

  const fetchActivities = async () => {
    try {
      const response = await fetch('/api/activities?limit=100&active=true')
      if (response.ok) {
        const data = await response.json()
        setActivities(data.activities)
      }
    } catch (error) {
      console.error('Error fetching activities:', error)
    }
  }

  const fetchActivitySchedules = async (activityId: string) => {
    try {
      const response = await fetch(`/api/activities/${activityId}/schedules`)
      if (response.ok) {
        const data = await response.json()
        // Filtrar solo horarios futuros con cupos disponibles
        const availableSchedules = data.filter((schedule: ActivitySchedule) => {
          const scheduleDate = new Date(schedule.date)
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          
          return scheduleDate >= today && 
                 schedule.isActive && 
                 schedule.availableSpots > schedule._count.activityBookings
        })
        setActivitySchedules(availableSchedules)
      }
    } catch (error) {
      console.error('Error fetching activity schedules:', error)
    }
  }

  const createGuest = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/guests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGuestData)
      })

      if (response.ok) {
        const newGuest = await response.json()
        setSelectedGuest(newGuest)
        setShowCreateGuest(false)
        setNewGuestData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          country: '',
          documentType: '',
          documentNumber: '',
        })
        fetchGuests() // Refresh the list
      } else {
        const error = await response.json()
        alert(`Error creando huésped: ${error.error || 'Error desconocido'}`)
      }
    } catch (error) {
      console.error('Error creating guest:', error)
      alert('Error creando huésped')
    } finally {
      setLoading(false)
    }
  }

  const checkAccommodationAvailability = async (checkIn: string, checkOut: string, roomTypeId: string) => {
    try {
      setCheckingAvailability(true)
      const response = await fetch('/api/check-availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomTypeId,
          checkInDate: checkIn,
          checkOutDate: checkOut,
          adults: accommodationData.adults,
          children: accommodationData.children
        })
      })

      if (response.ok) {
        const data = await response.json()
        setAvailabilityStatus({
          available: data.available,
          message: data.message,
          availableRooms: data.availableRooms
        })
      } else {
        setAvailabilityStatus({
          available: false,
          message: 'Error verificando disponibilidad'
        })
      }
    } catch (error) {
      console.error('Error checking availability:', error)
      setAvailabilityStatus({
        available: false,
        message: 'Error de conexión'
      })
    } finally {
      setCheckingAvailability(false)
    }
  }

  // Navigation functions
  const nextStep = () => {
    if (step < 4) setStep(step + 1)
  }

  const prevStep = () => {
    if (step > 1) setStep(step - 1)
  }

  const getStepTitle = () => {
    switch (step) {
      case 1: return 'Tipo de Reservación'
      case 2: return 'Seleccionar Huésped'
      case 3: return reservationType === 'ACCOMMODATION' ? 'Hotel y Habitación' : 'Actividad y Horario'
      case 4: return 'Confirmación'
      default: return 'Reservación'
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Nueva Reservación Manual</CardTitle>
            <CardDescription>
              Paso {step} de 4: {getStepTitle()}
            </CardDescription>
          </div>
          <Button variant="ghost" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          {/* Paso 1: Tipo de Reservación */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">¿Qué deseas reservar?</h3>
                <p className="text-gray-600">Selecciona el tipo de servicio</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card 
                  className={`cursor-pointer transition-all ${
                    reservationType === 'ACCOMMODATION' 
                      ? 'ring-2 ring-blue-500 bg-blue-50' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setReservationType('ACCOMMODATION')}
                >
                  <CardContent className="p-6 text-center">
                    <Hotel className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">🏨 Alojamiento</h4>
                    <p className="text-gray-600">
                      Reservar habitaciones de hotel con fechas de estadía
                    </p>
                    <div className="mt-4 text-sm text-blue-600">
                      • Check-in y Check-out
                      • Selección de habitación
                      • Múltiples noches
                    </div>
                  </CardContent>
                </Card>

                <Card 
                  className={`cursor-pointer transition-all ${
                    reservationType === 'ACTIVITY' 
                      ? 'ring-2 ring-green-500 bg-green-50' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setReservationType('ACTIVITY')}
                >
                  <CardContent className="p-6 text-center">
                    <MapPin className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">🎯 Actividad</h4>
                    <p className="text-gray-600">
                      Reservar experiencias turísticas en horarios específicos
                    </p>
                    <div className="mt-4 text-sm text-green-600">
                      • Horarios específicos
                      • Control de cupos
                      • Experiencias únicas
                    </div>
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
                <div className="text-sm text-gray-600">
                  Tipo: {reservationType === 'ACCOMMODATION' ? '🏨 Alojamiento' : '🎯 Actividad'}
                </div>
              </div>

              {/* Búsqueda de huéspedes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar Huésped Existente
                </label>
                <input
                  type="text"
                  value={guestSearch}
                  onChange={(e) => {
                    setGuestSearch(e.target.value)
                    fetchGuests()
                  }}
                  placeholder="Buscar por nombre, email o teléfono..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Lista de huéspedes */}
              <div className="max-h-60 overflow-y-auto space-y-2">
                {guests.map((guest) => (
                  <div
                    key={guest.id}
                    onClick={() => setSelectedGuest(guest)}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedGuest?.id === guest.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{guest.firstName} {guest.lastName}</p>
                        <p className="text-sm text-gray-600">{guest.email}</p>
                      </div>
                      <div className="text-sm text-gray-500">
                        {guest.phone} • {guest.country}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {guests.length === 0 && !showCreateGuest && (
                <div className="text-center py-6 text-gray-500">
                  No se encontraron huéspedes. Puedes crear uno nuevo.
                </div>
              )}

              {/* Botón para crear huésped */}
              {!showCreateGuest && (
                <div className="text-center">
                  <Button 
                    onClick={() => setShowCreateGuest(true)}
                    variant="outline"
                    className="w-full"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Crear Nuevo Huésped
                  </Button>
                </div>
              )}

              {/* Formulario para crear huésped */}
              {showCreateGuest && (
                <div className="space-y-4 border-t pt-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-md font-semibold">Crear Nuevo Huésped</h4>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setShowCreateGuest(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre *
                      </label>
                      <input
                        type="text"
                        value={newGuestData.firstName}
                        onChange={(e) => setNewGuestData({...newGuestData, firstName: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Apellido *
                      </label>
                      <input
                        type="text"
                        value={newGuestData.lastName}
                        onChange={(e) => setNewGuestData({...newGuestData, lastName: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={newGuestData.email}
                        onChange={(e) => setNewGuestData({...newGuestData, email: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        value={newGuestData.phone}
                        onChange={(e) => setNewGuestData({...newGuestData, phone: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        País
                      </label>
                      <input
                        type="text"
                        value={newGuestData.country}
                        onChange={(e) => setNewGuestData({...newGuestData, country: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo de Documento
                      </label>
                      <select
                        value={newGuestData.documentType}
                        onChange={(e) => setNewGuestData({...newGuestData, documentType: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Seleccionar...</option>
                        <option value="PASSPORT">Pasaporte</option>
                        <option value="ID_CARD">Cédula</option>
                        <option value="DRIVER_LICENSE">Licencia</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Número de Documento
                      </label>
                      <input
                        type="text"
                        value={newGuestData.documentNumber}
                        onChange={(e) => setNewGuestData({...newGuestData, documentNumber: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={createGuest} 
                      disabled={loading || !newGuestData.firstName || !newGuestData.lastName || !newGuestData.email}
                      className="flex-1"
                    >
                      {loading ? 'Creando...' : 'Crear Huésped'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowCreateGuest(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Paso 3A: Seleccionar Hotel y Habitación (Alojamiento) */}
          {step === 3 && reservationType === 'ACCOMMODATION' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">🏨 Seleccionar Hotel y Habitación</h3>
                <div className="text-sm text-gray-600">
                  Huésped: {selectedGuest?.firstName} {selectedGuest?.lastName}
                </div>
              </div>

              {/* Selección de hotel */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hotel</label>
                <div className="grid gap-3 max-h-40 overflow-y-auto">
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
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{hotel.name}</p>
                          <p className="text-sm text-gray-600">{hotel.city}</p>
                        </div>
                        <Hotel className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selección de tipo de habitación */}
              {selectedHotel && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Habitación</label>
                  <div className="grid gap-3 max-h-60 overflow-y-auto">
                    {roomTypes.map((roomType) => (
                      <div
                        key={roomType.id}
                        onClick={() => setSelectedRoomType(roomType)}
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
                              Desde ${roomType.baseRate} • Máx. {roomType.maxAdults} adultos, {roomType.maxChildren} niños
                            </p>
                            {roomType.bedConfiguration && (
                              <p className="text-xs text-gray-500">{roomType.bedConfiguration}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-green-600">${roomType.baseRate}</div>
                            <div className="text-xs text-gray-500">por noche</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {roomTypes.length === 0 && (
                    <div className="text-center py-6 text-gray-500">
                      No hay tipos de habitación disponibles para este hotel.
                    </div>
                  )}
                </div>
              )}

              {/* Calendario de disponibilidad para habitaciones */}
              {selectedHotel && selectedRoomType && (
                <div className="space-y-4">
                  <AvailabilityCalendar
                    roomTypeId={selectedRoomType.id}
                    onDateRangeSelect={(checkIn: string, checkOut: string) => {
                      setAccommodationData({
                        ...accommodationData,
                        checkInDate: checkIn,
                        checkOutDate: checkOut
                      })
                      // Verificar disponibilidad inmediatamente
                      if (checkIn && checkOut && selectedRoomType) {
                        checkAccommodationAvailability(checkIn, checkOut, selectedRoomType.id)
                      }
                    }}
                    selectedCheckIn={accommodationData.checkInDate}
                    selectedCheckOut={accommodationData.checkOutDate}
                  />
                  
                  {/* Estado de disponibilidad */}
                  {(checkingAvailability || availabilityStatus) && (
                    <div className="mt-4">
                      {checkingAvailability ? (
                        <div className="flex items-center justify-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                          <span className="text-blue-800">Verificando disponibilidad...</span>
                        </div>
                      ) : availabilityStatus && (
                        <div className={`p-3 rounded-lg border ${
                          availabilityStatus.available
                            ? 'bg-green-50 border-green-200'
                            : 'bg-red-50 border-red-200'
                        }`}>
                          <div className="flex items-center">
                            {availabilityStatus.available ? (
                              <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                            )}
                            <span className={availabilityStatus.available ? 'text-green-800' : 'text-red-800'}>
                              {availabilityStatus.message}
                            </span>
                            {availabilityStatus.available && availabilityStatus.availableRooms && (
                              <span className="ml-2 text-sm text-green-600">
                                ({availabilityStatus.availableRooms} habitaciones disponibles)
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Campos adicionales para alojamiento */}
              {selectedHotel && selectedRoomType && accommodationData.checkInDate && accommodationData.checkOutDate && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Adultos
                      </label>
                      <input
                        type="number"
                        min="1"
                        max={selectedRoomType.maxAdults}
                        value={accommodationData.adults}
                        onChange={(e) => setAccommodationData({
                          ...accommodationData,
                          adults: parseInt(e.target.value) || 1
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Niños
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={selectedRoomType.maxChildren}
                        value={accommodationData.children}
                        onChange={(e) => setAccommodationData({
                          ...accommodationData,
                          children: parseInt(e.target.value) || 0
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Solicitudes Especiales
                    </label>
                    <textarea
                      value={accommodationData.specialRequests}
                      onChange={(e) => setAccommodationData({
                        ...accommodationData,
                        specialRequests: e.target.value
                      })}
                      placeholder="Cama extra, vista al mar, etc..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Paso 3B: Seleccionar Actividad y Horario */}
          {step === 3 && reservationType === 'ACTIVITY' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">🎯 Seleccionar Actividad y Horario</h3>
                <div className="text-sm text-gray-600">
                  Huésped: {selectedGuest?.firstName} {selectedGuest?.lastName}
                </div>
              </div>

              {/* Selección de actividad */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Actividad</label>
                <div className="grid gap-3 max-h-60 overflow-y-auto">
                  {activities.map((activity) => (
                    <div
                      key={activity.id}
                      onClick={() => {
                        setSelectedActivity(activity)
                        fetchActivitySchedules(activity.id)
                      }}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedActivity?.id === activity.id
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium">{activity.name}</p>
                          <p className="text-sm text-gray-600">{activity.location}</p>
                          <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                            <span>${activity.basePrice} {activity.currency}</span>
                            <span>{activity.durationHours}h</span>
                            <span>{activity.minParticipants}-{activity.maxParticipants || '∞'} pax</span>
                          </div>
                        </div>
                        <MapPin className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selección de horario */}
              {selectedActivity && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Horarios Disponibles
                  </label>
                  
                  {activitySchedules.length > 0 ? (
                    <div className="grid gap-3 max-h-60 overflow-y-auto">
                      {activitySchedules.map((schedule) => {
                        const availableSpots = schedule.availableSpots - schedule._count.activityBookings
                        const isAvailable = availableSpots >= activityData.participants
                        
                        return (
                          <div
                            key={schedule.id}
                            onClick={() => isAvailable ? setSelectedSchedule(schedule) : null}
                            className={`p-4 border rounded-lg transition-colors ${
                              selectedSchedule?.id === schedule.id
                                ? 'border-green-500 bg-green-50'
                                : isAvailable
                                  ? 'border-gray-300 hover:border-gray-400 cursor-pointer'
                                  : 'border-red-300 bg-red-50 cursor-not-allowed opacity-60'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-4 mb-1">
                                  <p className="font-medium">
                                    {formatDateForDisplay(schedule.date)}
                                  </p>
                                  <span className="text-sm text-gray-600">
                                    {schedule.startTime.substring(0, 5)} - {schedule.endTime.substring(0, 5)}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-4 text-sm">
                                  <span className={`${isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                                    {availableSpots} cupos disponibles
                                  </span>
                                  <span className="text-gray-600">
                                    ${schedule.priceOverride || selectedActivity.basePrice} {selectedActivity.currency}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                {isAvailable ? (
                                  <CheckCircle className="h-5 w-5 text-green-500" />
                                ) : (
                                  <AlertCircle className="h-5 w-5 text-red-500" />
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p>No hay horarios disponibles para esta actividad</p>
                    </div>
                  )}
                </div>
              )}

              {/* Detalles de participantes para actividades */}
              {selectedSchedule && (
                <div className="space-y-4 p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900">Detalles de Participantes</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-green-700 mb-1">
                        Número de Participantes *
                      </label>
                      <input
                        type="number"
                        value={activityData.participants}
                        onChange={(e) => {
                          const participants = parseInt(e.target.value) || 1
                          setActivityData({ ...activityData, participants })
                        }}
                        min={selectedActivity.minParticipants}
                        max={Math.min(
                          selectedActivity.maxParticipants || 100,
                          selectedSchedule.availableSpots - selectedSchedule._count.activityBookings
                        )}
                        className="w-full px-3 py-2 border border-green-300 rounded-md focus:ring-2 focus:ring-green-500"
                      />
                      <p className="text-xs text-green-600 mt-1">
                        Mín: {selectedActivity.minParticipants}, 
                        Máx disponible: {selectedSchedule.availableSpots - selectedSchedule._count.activityBookings}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-green-700 mb-1">
                        Contacto de Emergencia
                      </label>
                      <input
                        type="text"
                        value={activityData.emergencyContact}
                        onChange={(e) => setActivityData({ ...activityData, emergencyContact: e.target.value })}
                        placeholder="Nombre del contacto"
                        className="w-full px-3 py-2 border border-green-300 rounded-md focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-green-700 mb-1">
                      Nombres de Participantes
                    </label>
                    <textarea
                      value={activityData.participantNames}
                      onChange={(e) => setActivityData({ ...activityData, participantNames: e.target.value })}
                      placeholder="Lista de nombres de los participantes..."
                      rows={3}
                      className="w-full px-3 py-2 border border-green-300 rounded-md focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Paso 4: Confirmación */}
          {step === 4 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-center">Confirmar Reservación</h3>
              
              {/* Resumen de la reservación */}
              <div className="p-6 bg-gray-50 rounded-lg space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">👤 Huésped</h4>
                    <p>{selectedGuest?.firstName} {selectedGuest?.lastName}</p>
                    <p className="text-sm text-gray-600">{selectedGuest?.email}</p>
                    <p className="text-sm text-gray-600">{selectedGuest?.phone}</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      {reservationType === 'ACCOMMODATION' ? '🏨 Alojamiento' : '🎯 Actividad'}
                    </h4>
                    {reservationType === 'ACCOMMODATION' ? (
                      <div>
                        <p>{selectedHotel?.name}</p>
                        <p className="text-sm text-gray-600">{selectedRoomType?.name}</p>
                        <p className="text-sm text-gray-600">
                          {accommodationData.checkInDate} a {accommodationData.checkOutDate}
                        </p>
                        <p className="text-sm text-gray-600">
                          {accommodationData.adults} adultos, {accommodationData.children} niños
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p>{selectedActivity?.name}</p>
                        <p className="text-sm text-gray-600">{selectedActivity?.location}</p>
                        <p className="text-sm text-gray-600">
                          {selectedSchedule && formatDateForDisplay(selectedSchedule.date)} - 
                          {selectedSchedule?.startTime.substring(0, 5)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {activityData.participants} participantes
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Botones de navegación */}
          <div className="flex justify-between pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={step === 1 ? onClose : prevStep}
              disabled={loading}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {step === 1 ? 'Cancelar' : 'Anterior'}
            </Button>

            <Button
              onClick={step === 4 ? handleCreateReservation : nextStep}
              disabled={
                loading ||
                (step === 1 && !reservationType) ||
                (step === 2 && !selectedGuest) ||
                (step === 3 && reservationType === 'ACCOMMODATION' && (!accommodationData.checkInDate || !accommodationData.checkOutDate || !availabilityStatus?.available)) ||
                (step === 3 && reservationType === 'ACTIVITY' && (!selectedActivity || !selectedSchedule))
              }
            >
              {loading ? 'Procesando...' : step === 4 ? 'Crear Reservación' : 'Siguiente'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  // Función para crear la reservación
  async function handleCreateReservation() {
    setLoading(true)
    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          guestId: selectedGuest?.id,
          itemType: reservationType,
          // Datos específicos según el tipo
          ...(reservationType === 'ACCOMMODATION' ? {
            hotelId: selectedHotel?.id,
            roomTypeId: selectedRoomType?.id,
            checkInDate: accommodationData.checkInDate,
            checkOutDate: accommodationData.checkOutDate,
            adults: accommodationData.adults,
            children: accommodationData.children,
            specialRequests: accommodationData.specialRequests,
            guestName: accommodationData.guestName,
          } : {
            activityId: selectedActivity?.id,
            scheduleId: selectedSchedule?.id,
            participants: activityData.participants,
            participantNames: activityData.participantNames,
            emergencyContact: activityData.emergencyContact,
            emergencyPhone: activityData.emergencyPhone,
          })
        }),
      })

      if (response.ok) {
        onSave()
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
}
