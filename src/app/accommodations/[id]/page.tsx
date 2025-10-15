'use client'

import PublicLayout from '@/components/layout/public-layout'
import { Button } from '@/components/ui/button'
import { 
  MapPin, 
  Star, 
  Users, 
  Wifi, 
  Car, 
  Coffee, 
  Dumbbell, 
  Waves,
  ArrowLeft,
  Bed,
  DollarSign,
  Calendar,
  User,
  Phone,
  Mail,
  Globe,
  Heart,
  Share2,
  CheckCircle,
  Clock,
  Shield,
  CreditCard
} from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { PublicBookingForm } from '@/components/forms/public-booking-form'

// Interface para la habitación
interface Room {
  id: string
  hotelId: string
  roomTypeId: string
  code: string
  floorNumber?: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  amenities?: Array<{
    id: string
    name: string
    icon: string
    category: string
  }>
  roomType: {
    id: string
    name: string
    baseRate: string
    occupancy: number
    maxAdults: number
    maxChildren: number
    bedConfiguration?: string
    description?: string
    imageUrl?: string
  }
  hotel: {
    id: string
    name: string
    city: string
    address: string
    phone?: string
    email?: string
    logoUrl?: string
    checkInTime?: string
    checkOutTime?: string
  }
}

export default function RoomDetailsPage() {
  const { t } = useLanguage()
  const params = useParams()
  const roomId = params.id as string

  const [room, setRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDates, setSelectedDates] = useState({
    checkIn: '',
    checkOut: ''
  })
  const [guests, setGuests] = useState({
    adults: 1,
    children: 0
  })
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [bookingData, setBookingData] = useState<any>(null)
  const [availabilityStatus, setAvailabilityStatus] = useState<'checking' | 'available' | 'unavailable' | 'not-selected'>('not-selected')
  const [availabilityMessage, setAvailabilityMessage] = useState('')
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false)

  // Validar capacidad de huéspedes
  const validateGuestCapacity = () => {
    if (!room) return true
    const totalGuests = guests.adults + guests.children
    const maxCapacity = room.roomType.maxAdults + room.roomType.maxChildren
    return totalGuests <= maxCapacity
  }

  // Validar si se puede reservar
  const canReserve = () => {
    return validateGuestCapacity() && 
           availabilityStatus === 'available' && 
           selectedDates.checkIn && 
           selectedDates.checkOut
  }

  // Obtener mensaje de error de capacidad
  const getCapacityErrorMessage = () => {
    if (!room) return ''
    const totalGuests = guests.adults + guests.children
    const maxCapacity = room.roomType.maxAdults + room.roomType.maxChildren
    if (totalGuests > maxCapacity) {
      return `La habitación tiene capacidad máxima de ${maxCapacity} huéspedes (${room.roomType.maxAdults} adultos + ${room.roomType.maxChildren} niños)`
    }
    return ''
  }

  // Validar fechas básicas
  const validateDates = () => {
    if (!selectedDates.checkIn || !selectedDates.checkOut) {
      return { valid: false, message: 'Selecciona fechas de entrada y salida' }
    }

    const checkIn = new Date(selectedDates.checkIn)
    const checkOut = new Date(selectedDates.checkOut)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (checkIn < today) {
      return { valid: false, message: 'La fecha de entrada no puede ser en el pasado' }
    }

    if (checkIn >= checkOut) {
      return { valid: false, message: 'La fecha de salida debe ser posterior a la de entrada' }
    }

    return { valid: true, message: '' }
  }

  // Verificar disponibilidad de fechas
  const checkAvailability = async () => {
    if (!room || !selectedDates.checkIn || !selectedDates.checkOut) {
      setAvailabilityStatus('not-selected')
      setAvailabilityMessage('')
      return
    }

    // Validar fechas básicas primero
    const dateValidation = validateDates()
    if (!dateValidation.valid) {
      setAvailabilityStatus('unavailable')
      setAvailabilityMessage(dateValidation.message)
      return
    }

    setIsCheckingAvailability(true)
    setAvailabilityStatus('checking')
    setAvailabilityMessage('Verificando disponibilidad...')

    try {
      const response = await fetch('/api/check-availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomTypeId: room.roomTypeId,
          checkInDate: selectedDates.checkIn,
          checkOutDate: selectedDates.checkOut,
          adults: guests.adults,
          children: guests.children
        })
      })

      const data = await response.json()

      if (data.available) {
        setAvailabilityStatus('available')
        setAvailabilityMessage('¡Fechas disponibles!')
      } else {
        setAvailabilityStatus('unavailable')
        setAvailabilityMessage(data.message || 'No hay disponibilidad para estas fechas')
      }
    } catch (error) {
      console.error('Error checking availability:', error)
      setAvailabilityStatus('unavailable')
      setAvailabilityMessage('Error verificando disponibilidad')
    } finally {
      setIsCheckingAvailability(false)
    }
  }

  // Cargar datos de la habitación usando la API del admin
  useEffect(() => {
    const loadRoomData = async () => {
      try {
        console.log('🔍 Loading room data for ID:', roomId)
        // Usar la API del admin para obtener la habitación específica con toda la información
        const roomResponse = await fetch(`/api/rooms/${roomId}`)
        console.log('📡 Room API response status:', roomResponse.status)
        
        if (roomResponse.ok) {
          const roomData = await roomResponse.json()
          console.log('✅ Room data loaded:', roomData)
          setRoom(roomData)
        } else {
          const errorData = await roomResponse.json()
          console.error('❌ Error loading room:', errorData)
        }
      } catch (error) {
        console.error('❌ Error loading room data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (roomId) {
      loadRoomData()
    }
  }, [roomId])

  // Verificar disponibilidad cuando cambien las fechas o huéspedes
  useEffect(() => {
    if (room && selectedDates.checkIn && selectedDates.checkOut) {
      const timeoutId = setTimeout(() => {
        checkAvailability()
      }, 500) // Debounce de 500ms

      return () => clearTimeout(timeoutId)
    }
  }, [selectedDates.checkIn, selectedDates.checkOut, guests.adults, guests.children, room])

  // Obtener icono de amenidad
  const getAmenityIcon = (iconName: string) => {
    const icons: { [key: string]: any } = {
      'wifi': Wifi,
      'ac': Star,
      'tv': Star,
      'minibar': Coffee,
      'safe': Star,
      'balcony': Star,
      'ocean-view': Waves,
      'city-view': Star,
      'bathtub': Star,
      'kitchenette': Star,
      'pool': Waves,
      'gym': Dumbbell,
      'parking': Car
    }
    return icons[iconName] || Star
  }

  // Formatear tiempo
  const formatTime = (timeString?: string) => {
    if (!timeString) return 'N/A'
    try {
      const date = new Date(timeString)
      return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    } catch {
      return timeString
    }
  }

  const handleReserve = () => {
    if (!room) return
    
    // Calcular precio total (por noche, no por huésped)
    const baseRate = parseFloat(room.roomType.baseRate)
    const nights = calculateNights(selectedDates.checkIn, selectedDates.checkOut)
    const totalAmount = baseRate * nights
    
    setBookingData({
      serviceType: 'ACCOMMODATION',
      serviceId: room.hotel.id,
      roomTypeId: room.roomType.id, // Agregar el ID del tipo de habitación
      serviceName: `${room.hotel.name} - ${room.roomType.name}`,
      checkIn: selectedDates.checkIn,
      checkOut: selectedDates.checkOut,
      participants: guests.adults + guests.children,
      rooms: 1,
      totalAmount: totalAmount,
      currency: 'USD',
      description: `Habitación ${room.roomType.name} en ${room.hotel.name}`,
      image: room.images?.[0]?.imageUrl
    })
    
    setShowBookingForm(true)
  }

  const calculateNights = (checkIn: string, checkOut: string) => {
    if (!checkIn || !checkOut) return 0
    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)
    const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  // Calcular precio total para mostrar en el widget
  const calculateTotalPrice = () => {
    if (!room || !selectedDates.checkIn || !selectedDates.checkOut) return 0
    const baseRate = parseFloat(room.roomType.baseRate)
    const nights = calculateNights(selectedDates.checkIn, selectedDates.checkOut)
    return baseRate * nights
  }

  const handleBookingSuccess = (reservationId: string) => {
    setShowBookingForm(false)
    // Aquí podrías mostrar una notificación de éxito o redirigir
    alert(`¡Reservación confirmada! Número: ${reservationId}`)
  }

  if (loading) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-antigua-purple mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando información de la habitación...</p>
          </div>
        </div>
      </PublicLayout>
    )
  }

  if (!room) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Habitación no encontrada</h1>
            <Link href="/accommodations">
              <Button>Volver a Habitaciones</Button>
            </Link>
          </div>
        </div>
      </PublicLayout>
    )
  }

  return (
    <PublicLayout>
      {/* Breadcrumb Navigation */}
      <div className="container mx-auto px-4 pt-8">
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
          <Link href="/" className="hover:text-antigua-purple">Inicio</Link>
          <span>/</span>
          <Link href="/hotels" className="hover:text-antigua-purple">Hoteles</Link>
          <span>/</span>
          <Link href={`/hotels/${room.hotel.id}`} className="hover:text-antigua-purple">{room.hotel.name}</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{room.roomType.name}</span>
        </nav>
        
        <Link href={`/hotels/${room.hotel.id}`} className="inline-flex items-center gap-2 text-antigua-purple hover:text-antigua-purple-dark transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Volver a {room.hotel.name}
        </Link>
      </div>

      {/* Room Hero Section */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Room Images */}
            <div className="lg:col-span-2">
              <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src={room.roomType.imageUrl || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=600&fit=crop'}
                  alt={room.roomType.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button size="sm" variant="secondary" className="p-2 bg-white/90 hover:bg-white">
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="secondary" className="p-2 bg-white/90 hover:bg-white">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Booking Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-8">
                <div className="text-right mb-4">
                  {selectedDates.checkIn && selectedDates.checkOut ? (
                    <>
                      <div className="text-3xl font-bold text-antigua-purple">
                        ${calculateTotalPrice().toFixed(2)}
                      </div>
                      <div className="text-gray-600">
                        {calculateNights(selectedDates.checkIn, selectedDates.checkOut)} noche{calculateNights(selectedDates.checkIn, selectedDates.checkOut) !== 1 ? 's' : ''} 
                        × ${parseFloat(room.roomType.baseRate)}/noche
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-3xl font-bold text-antigua-purple">
                        ${parseFloat(room.roomType.baseRate)}
                      </div>
                      <div className="text-gray-600">por noche</div>
                    </>
                  )}
                </div>

                <div className="space-y-4 mb-6">
                  {/* Check-in/Check-out */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Check-in
                      </label>
                      <input
                        type="date"
                        value={selectedDates.checkIn}
                        onChange={(e) => setSelectedDates(prev => ({ ...prev, checkIn: e.target.value }))}
                        min={new Date().toISOString().split('T')[0]}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-antigua-purple focus:border-transparent ${
                          availabilityStatus === 'unavailable' ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Check-out
                      </label>
                      <input
                        type="date"
                        value={selectedDates.checkOut}
                        onChange={(e) => setSelectedDates(prev => ({ ...prev, checkOut: e.target.value }))}
                        min={selectedDates.checkIn || new Date().toISOString().split('T')[0]}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-antigua-purple focus:border-transparent ${
                          availabilityStatus === 'unavailable' ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Availability Status */}
                  {availabilityMessage && (
                    <div className={`p-3 rounded-lg text-sm ${
                      availabilityStatus === 'available' 
                        ? 'bg-green-50 text-green-700 border border-green-200' 
                        : availabilityStatus === 'unavailable'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : availabilityStatus === 'checking'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-gray-50 text-gray-700 border border-gray-200'
                    }`}>
                      <div className="flex items-center gap-2">
                        {availabilityStatus === 'checking' && (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700"></div>
                        )}
                        {availabilityStatus === 'available' && (
                          <CheckCircle className="h-4 w-4" />
                        )}
                        {availabilityStatus === 'unavailable' && (
                          <Clock className="h-4 w-4" />
                        )}
                        <span>{availabilityMessage}</span>
                      </div>
                    </div>
                  )}

                  {/* Guests */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Huéspedes
                    </label>
                    <div className="space-y-3">
                      {/* Adults */}
                      <div className="flex items-center justify-between p-3 border border-gray-300 rounded-lg">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span className="text-sm font-medium">Adultos</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setGuests(prev => ({ 
                              ...prev, 
                              adults: Math.max(1, prev.adults - 1) 
                            }))}
                            disabled={guests.adults <= 1}
                            className="h-8 w-8 p-0"
                          >
                            -
                          </Button>
                          <span className="px-3 py-1 bg-gray-100 rounded-md min-w-[2rem] text-center text-sm">
                            {guests.adults}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setGuests(prev => ({ 
                              ...prev, 
                              adults: Math.min(room?.roomType.maxAdults || 4, prev.adults + 1) 
                            }))}
                            disabled={guests.adults >= (room?.roomType.maxAdults || 4)}
                            className="h-8 w-8 p-0"
                          >
                            +
                          </Button>
                        </div>
                      </div>

                      {/* Children */}
                      <div className="flex items-center justify-between p-3 border border-gray-300 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span className="text-sm font-medium">Niños</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setGuests(prev => ({ 
                              ...prev, 
                              children: Math.max(0, prev.children - 1) 
                            }))}
                            disabled={guests.children <= 0}
                            className="h-8 w-8 p-0"
                          >
                            -
                          </Button>
                          <span className="px-3 py-1 bg-gray-100 rounded-md min-w-[2rem] text-center text-sm">
                            {guests.children}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setGuests(prev => ({ 
                              ...prev, 
                              children: Math.min(room?.roomType.maxChildren || 2, prev.children + 1) 
                            }))}
                            disabled={guests.children >= (room?.roomType.maxChildren || 2)}
                            className="h-8 w-8 p-0"
                          >
                            +
                          </Button>
                        </div>
                      </div>

                      {/* Capacity Info */}
                      {room && (
                        <div className="text-xs text-gray-500 text-center">
                          Capacidad máxima: {room.roomType.maxAdults} adultos, {room.roomType.maxChildren} niños
                        </div>
                      )}

                      {/* Capacity Error Message */}
                      {!validateGuestCapacity() && (
                        <div className="text-xs text-red-500 text-center bg-red-50 p-2 rounded-md">
                          {getCapacityErrorMessage()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handleReserve}
                  disabled={!canReserve()}
                  className={`w-full py-3 text-lg font-semibold mb-4 ${
                    canReserve() 
                      ? 'bg-antigua-purple hover:bg-antigua-purple-dark text-white' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Calendar className="mr-2 h-5 w-5" />
                  {!selectedDates.checkIn || !selectedDates.checkOut 
                    ? 'Selecciona Fechas' 
                    : availabilityStatus === 'checking'
                    ? 'Verificando...'
                    : availabilityStatus === 'unavailable'
                    ? 'No Disponible'
                    : !validateGuestCapacity()
                    ? 'Excede Capacidad'
                    : 'Reservar Ahora'
                  }
                </Button>

                <div className="text-center text-sm text-gray-600">
                  <p className="flex items-center justify-center gap-2 mb-1">
                    <Shield className="h-4 w-4" />
                    Reserva segura
                  </p>
                  <p className="flex items-center justify-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Pago al llegar
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Room Details */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Room Info */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {room.roomType.name}
                    </h1>
                    <div className="flex items-center gap-4 text-gray-600 mb-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-antigua-purple" />
                        <span>{room.hotel.name} - {room.hotel.city}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Bed className="h-4 w-4 text-antigua-purple" />
                        <span>Habitación {room.code}</span>
                      </div>
                      {room.floorNumber && (
                        <div className="flex items-center gap-2">
                          <span>Piso {room.floorNumber}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Room Description */}
                {room.roomType.description && (
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Descripción</h3>
                    <p className="text-gray-600 leading-relaxed">
                      {room.roomType.description}
                    </p>
                  </div>
                )}

                {/* Room Features */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Características</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-antigua-purple" />
                      <span className="text-gray-700">Máx. {room.roomType.occupancy} personas</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Bed className="h-5 w-5 text-antigua-purple" />
                      <span className="text-gray-700">{room.roomType.bedConfiguration || 'Cama doble'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-5 w-5 text-antigua-purple" />
                      <span className="text-gray-700">Desde ${parseFloat(room.roomType.baseRate)}/noche</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-gray-700">Disponible</span>
                    </div>
                  </div>
                </div>

                {/* Amenities */}
                {room.amenities && room.amenities.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Amenidades</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {room.amenities.map((amenity) => {
                        const IconComponent = getAmenityIcon(amenity.icon)
                        return (
                          <div key={amenity.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <IconComponent className="h-5 w-5 text-antigua-purple" />
                            <span className="text-gray-700">{amenity.name}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Hotel Info Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Información del Hotel</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">{room.hotel.name}</h4>
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <MapPin className="h-4 w-4 text-antigua-purple" />
                      <span className="text-sm">{room.hotel.city}</span>
                    </div>
                    <p className="text-sm text-gray-600">{room.hotel.address}</p>
                  </div>

                  {/* Hotel Contact */}
                  <div className="space-y-2">
                    {room.hotel.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4 text-antigua-purple" />
                        <span>{room.hotel.phone}</span>
                      </div>
                    )}
                    {room.hotel.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="h-4 w-4 text-antigua-purple" />
                        <span>{room.hotel.email}</span>
                      </div>
                    )}
                    {room.hotel.logoUrl && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Globe className="h-4 w-4 text-antigua-purple" />
                        <span>Sitio Web</span>
                      </div>
                    )}
                  </div>

                  {/* Check-in/Check-out Times */}
                  <div className="pt-4 border-t">
                    <h5 className="font-medium text-gray-900 mb-2">Horarios</h5>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-antigua-purple" />
                        <span>Check-in: {formatTime(room.hotel.checkInTime)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-antigua-purple" />
                        <span>Check-out: {formatTime(room.hotel.checkOutTime)}</span>
                      </div>
                    </div>
                  </div>

                  {/* View Hotel Button */}
                  <Link href={`/hotels/${room.hotel.id}`} className="block mt-6">
                    <Button variant="outline" className="w-full">
                      Ver Hotel Completo
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Modal */}
      {showBookingForm && bookingData && (
        <PublicBookingForm
          bookingData={bookingData}
          onClose={() => setShowBookingForm(false)}
          onSuccess={handleBookingSuccess}
        />
      )}
    </PublicLayout>
  )
}