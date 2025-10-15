'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  CheckCircle, 
  AlertCircle, 
  Calendar, 
  Users, 
  Car,
  Clock,
  MapPin,
  ArrowLeft,
  ArrowRight,
  Plane,
  Navigation
} from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { formatCurrency } from '@/lib/utils'

interface GuestInfo {
  firstName: string
  lastName: string
  email: string
  phone: string
  nationality: string
  specialRequests?: string
  emergencyContact?: string
  emergencyPhone?: string
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
  fromAirport: {
    id: string
    name: string
    iata: string
    city: string
    country: string
  }
  toHotel: {
    id: string
    name: string
    city: string
    address: string
    rating: number | null
  }
  direction: string
  distanceKm: number | null
  estimatedDurationMinutes: number | null
  basePrice: number
  currency: string
  isShared: boolean
  maxPassengers: number
  vehicleType: string | null
  isActive: boolean
  specificAvailability: ShuttleAvailability[]
  duration: string
  pricePerPerson: number
  totalPrice: number
  availableToday: boolean
  nextDeparture: string | null
}

interface PublicShuttleBookingFormProps {
  shuttleRoute: ShuttleRoute
  onClose: () => void
  onSuccess: (reservationId: string) => void
}

export function PublicShuttleBookingForm({ shuttleRoute, onClose, onSuccess }: PublicShuttleBookingFormProps) {
  const { t } = useLanguage()
  const [step, setStep] = useState(1) // 1: Datos del huésped, 2: Fecha y pasajeros, 3: Confirmación
  const [loading, setLoading] = useState(false)
  
  // Estados para datos del huésped
  const [guestInfo, setGuestInfo] = useState<GuestInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    nationality: 'Guatemala',
    specialRequests: '',
    emergencyContact: '',
    emergencyPhone: ''
  })
  
  // Estados para selección de fecha y pasajeros
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [passengers, setPassengers] = useState(1)
  const [availabilityStatus, setAvailabilityStatus] = useState<{
    available: boolean
    message: string
    availableSeats?: number
  } | null>(null)
  const [checkingAvailability, setCheckingAvailability] = useState(false)
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [reservationId, setReservationId] = useState<string | null>(null)

  // Cargar disponibilidad al montar el componente
  useEffect(() => {
    if (shuttleRoute.specificAvailability && shuttleRoute.specificAvailability.length > 0) {
      // Seleccionar la primera fecha disponible por defecto
      const firstAvailability = shuttleRoute.specificAvailability[0]
      setSelectedDate(firstAvailability.date)
      setSelectedTime(firstAvailability.departureTime)
    }
  }, [shuttleRoute])

  // Verificar disponibilidad cuando cambien los pasajeros o la fecha/hora
  useEffect(() => {
    if (selectedDate && selectedTime && passengers) {
      checkShuttleAvailability()
    }
  }, [selectedDate, selectedTime, passengers])

  const checkShuttleAvailability = async () => {
    if (!shuttleRoute || !selectedDate || !selectedTime || !passengers) return

    setCheckingAvailability(true)
    try {
      const response = await fetch('/api/check-shuttle-availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          routeId: shuttleRoute.id,
          date: selectedDate,
          departureTime: selectedTime,
          passengers: passengers
        })
      })

      const data = await response.json()

      setAvailabilityStatus({
        available: data.available,
        message: data.message || (data.available ? 'Shuttle disponible' : 'No hay disponibilidad'),
        availableSeats: data.availableSeats
      })
    } catch (error) {
      console.error('Error checking availability:', error)
      setAvailabilityStatus({
        available: false,
        message: 'Error verificando disponibilidad'
      })
    } finally {
      setCheckingAvailability(false)
    }
  }

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {}
    
    if (!guestInfo.firstName.trim()) newErrors.firstName = 'Nombre es requerido'
    if (!guestInfo.lastName.trim()) newErrors.lastName = 'Apellido es requerido'
    if (!guestInfo.email.trim()) newErrors.email = 'Email es requerido'
    if (!guestInfo.phone.trim()) newErrors.phone = 'Teléfono es requerido'
    
    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (guestInfo.email && !emailRegex.test(guestInfo.email)) {
      newErrors.email = 'Email inválido'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    if (!selectedDate) {
      setErrors({ general: 'Selecciona una fecha' })
      return false
    }
    if (!selectedTime) {
      setErrors({ general: 'Selecciona una hora' })
      return false
    }
    if (passengers < 1) {
      setErrors({ general: 'Mínimo 1 pasajero requerido' })
      return false
    }
    if (passengers > shuttleRoute.maxPassengers) {
      setErrors({ general: `Máximo ${shuttleRoute.maxPassengers} pasajeros permitidos` })
      return false
    }
    if (!availabilityStatus?.available) {
      setErrors({ general: 'El shuttle no está disponible para esta fecha y hora' })
      return false
    }
    setErrors({})
    return true
  }

  const handleCreateReservation = async () => {
    if (!validateStep2()) return

    setLoading(true)
    try {
      const response = await fetch('/api/public/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemType: 'SHUTTLE',
          guestInfo: {
            firstName: guestInfo.firstName,
            lastName: guestInfo.lastName,
            email: guestInfo.email,
            phone: guestInfo.phone,
            nationality: guestInfo.nationality,
            specialRequests: guestInfo.specialRequests,
            emergencyContact: guestInfo.emergencyContact,
            emergencyPhone: guestInfo.emergencyPhone
          },
          shuttleRouteId: shuttleRoute.id,
          date: selectedDate,
          departureTime: selectedTime,
          passengers: passengers,
          passengerNames: `${guestInfo.firstName} ${guestInfo.lastName}`,
          specialRequests: guestInfo.specialRequests,
        })
      })

      const result = await response.json()

      if (response.ok) {
        setReservationId(result.reservationId)
        setStep(3) // Ir a confirmación
      } else {
        setErrors({ general: result.error || 'Error creando reservación' })
      }
    } catch (error) {
      console.error('Error creating reservation:', error)
      setErrors({ general: 'Error de conexión' })
    } finally {
      setLoading(false)
    }
  }

  const calculateTotalPrice = () => {
    const basePrice = shuttleRoute.pricePerPerson
    return basePrice * passengers
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (time: string) => {
    return time.substring(0, 5)
  }

  const getDirectionLabel = (direction: string) => {
    switch (direction) {
      case 'ARRIVAL': return 'Llegada (Aeropuerto → Hotel)'
      case 'DEPARTURE': return 'Salida (Hotel → Aeropuerto)'
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

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Información del Pasajero
        </h3>
        <p className="text-gray-600">
          Proporciona tus datos de contacto para la reservación
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">Nombre *</Label>
          <Input
            id="firstName"
            value={guestInfo.firstName}
            onChange={(e) => setGuestInfo(prev => ({ ...prev, firstName: e.target.value }))}
            className={errors.firstName ? 'border-red-500' : ''}
          />
          {errors.firstName && (
            <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
          )}
        </div>

        <div>
          <Label htmlFor="lastName">Apellido *</Label>
          <Input
            id="lastName"
            value={guestInfo.lastName}
            onChange={(e) => setGuestInfo(prev => ({ ...prev, lastName: e.target.value }))}
            className={errors.lastName ? 'border-red-500' : ''}
          />
          {errors.lastName && (
            <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
          )}
        </div>

        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={guestInfo.email}
            onChange={(e) => setGuestInfo(prev => ({ ...prev, email: e.target.value }))}
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <Label htmlFor="phone">Teléfono *</Label>
          <Input
            id="phone"
            value={guestInfo.phone}
            onChange={(e) => setGuestInfo(prev => ({ ...prev, phone: e.target.value }))}
            className={errors.phone ? 'border-red-500' : ''}
          />
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
          )}
        </div>

        <div>
          <Label htmlFor="nationality">Nacionalidad</Label>
          <Input
            id="nationality"
            value={guestInfo.nationality}
            onChange={(e) => setGuestInfo(prev => ({ ...prev, nationality: e.target.value }))}
          />
        </div>

        <div>
          <Label htmlFor="emergencyContact">Contacto de emergencia</Label>
          <Input
            id="emergencyContact"
            value={guestInfo.emergencyContact}
            onChange={(e) => setGuestInfo(prev => ({ ...prev, emergencyContact: e.target.value }))}
          />
        </div>

        <div>
          <Label htmlFor="emergencyPhone">Teléfono de emergencia</Label>
          <Input
            id="emergencyPhone"
            value={guestInfo.emergencyPhone}
            onChange={(e) => setGuestInfo(prev => ({ ...prev, emergencyPhone: e.target.value }))}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="specialRequests">Solicitudes especiales</Label>
        <Textarea
          id="specialRequests"
          value={guestInfo.specialRequests}
          onChange={(e) => setGuestInfo(prev => ({ ...prev, specialRequests: e.target.value }))}
          rows={3}
          placeholder="Equipaje especial, necesidades de accesibilidad, etc."
        />
      </div>

      {/* Botones de navegación */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button 
          onClick={() => {
            if (validateStep1()) {
              setStep(2)
            }
          }}
          className="bg-antigua-purple hover:bg-antigua-purple-dark"
        >
          Continuar
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Fecha y Pasajeros
        </h3>
        <p className="text-gray-600">
          Selecciona la fecha, hora y número de pasajeros
        </p>
      </div>

      {/* Información de la ruta */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getDirectionIcon(shuttleRoute.direction)}
            {shuttleRoute.name}
          </CardTitle>
          <CardDescription>
            {getDirectionLabel(shuttleRoute.direction)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center">
              <Plane className="h-4 w-4 mr-2 text-gray-400" />
              <span className="font-medium">{shuttleRoute.fromAirport.name}</span>
              {shuttleRoute.fromAirport.iata && (
                <span className="ml-2 text-gray-500">({shuttleRoute.fromAirport.iata})</span>
              )}
            </div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-gray-400" />
              <span className="font-medium">{shuttleRoute.toHotel.name}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-gray-400" />
              <span>{shuttleRoute.duration}</span>
            </div>
            <div className="flex items-center">
              <Car className="h-4 w-4 mr-2 text-gray-400" />
              <span>{shuttleRoute.isShared ? 'Compartido' : 'Privado'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selección de fecha */}
      <div>
        <Label className="text-sm font-medium text-gray-700 mb-3 block">
          Fecha de viaje
        </Label>
        <Input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          min={new Date().toISOString().split('T')[0]}
          className="w-full"
        />
      </div>

      {/* Selección de hora */}
      <div>
        <Label className="text-sm font-medium text-gray-700 mb-3 block">
          Hora de salida
        </Label>
        {shuttleRoute.specificAvailability && shuttleRoute.specificAvailability.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
            {shuttleRoute.specificAvailability
              .filter(av => av.date === selectedDate)
              .map((availability) => (
                <div
                  key={availability.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedTime === availability.departureTime
                      ? 'border-antigua-purple bg-antigua-purple/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedTime(availability.departureTime)}
                >
                  <div className="text-center">
                    <p className="font-medium text-gray-900">
                      {formatTime(availability.departureTime)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {availability.availableSeats} asientos
                    </p>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
            <p className="text-yellow-800 font-medium">No hay horarios disponibles</p>
            <p className="text-yellow-600 text-sm mt-1">
              Por favor, contacta con nosotros para más información sobre disponibilidad.
            </p>
          </div>
        )}
      </div>

      {/* Selección de pasajeros */}
      <div>
        <Label className="text-sm font-medium text-gray-700 mb-3 block">
          Número de pasajeros
        </Label>
        <div className="flex items-center justify-between p-3 border border-gray-300 rounded-lg">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="text-sm font-medium">Pasajeros</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPassengers(prev => Math.max(1, prev - 1))}
              disabled={passengers <= 1}
              className="h-8 w-8 p-0"
            >
              -
            </Button>
            <span className="px-3 py-1 bg-gray-100 rounded-md min-w-[2rem] text-center text-sm">
              {passengers}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPassengers(prev => Math.min(shuttleRoute.maxPassengers, prev + 1))}
              disabled={passengers >= shuttleRoute.maxPassengers}
              className="h-8 w-8 p-0"
            >
              +
            </Button>
          </div>
        </div>
        
        <div className="text-xs text-gray-500 text-center mt-2">
          Máximo: {shuttleRoute.maxPassengers} pasajeros
        </div>
      </div>

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
                {availabilityStatus.available && availabilityStatus.availableSeats && (
                  <span className="ml-2 text-sm text-green-600">
                    ({availabilityStatus.availableSeats} asientos disponibles)
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Resumen de precio */}
      {selectedDate && selectedTime && (
        <Card className="bg-gray-50">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-900">{shuttleRoute.name}</p>
                <p className="text-sm text-gray-600">
                  {passengers} pasajero{passengers !== 1 ? 's' : ''} • {formatDate(selectedDate)} • {formatTime(selectedTime)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-antigua-purple">
                  {formatCurrency(calculateTotalPrice())}
                </p>
                <p className="text-sm text-gray-600">{shuttleRoute.currency}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Botones de navegación */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep(1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Anterior
        </Button>
        <Button 
          onClick={() => {
            if (validateStep2()) {
              setStep(3)
            }
          }}
          disabled={!selectedDate || !selectedTime || !availabilityStatus?.available}
          className="bg-antigua-purple hover:bg-antigua-purple-dark"
        >
          Continuar
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Confirmación de Reservación
        </h3>
        <p className="text-gray-600">
          Revisa los detalles de tu reservación antes de confirmar
        </p>
      </div>

      {/* Resumen de la reservación */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            {shuttleRoute.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-gray-700">Pasajero:</p>
              <p className="text-gray-600">
                {guestInfo.firstName} {guestInfo.lastName}
              </p>
              <p className="text-gray-600 text-xs">{guestInfo.email}</p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Fecha:</p>
              <p className="text-gray-600">{formatDate(selectedDate)}</p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Hora:</p>
              <p className="text-gray-600">{formatTime(selectedTime)}</p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Pasajeros:</p>
              <p className="text-gray-600">{passengers} persona{passengers !== 1 ? 's' : ''}</p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Ruta:</p>
              <p className="text-gray-600">{shuttleRoute.fromAirport.name} → {shuttleRoute.toHotel.name}</p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Duración:</p>
              <p className="text-gray-600">{shuttleRoute.duration}</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total:</span>
              <span className="text-2xl font-bold text-antigua-purple">
                {formatCurrency(calculateTotalPrice())} {shuttleRoute.currency}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botones de navegación */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep(2)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Anterior
        </Button>
        <Button 
          onClick={handleCreateReservation}
          disabled={loading}
          className="bg-antigua-purple hover:bg-antigua-purple-dark"
        >
          {loading ? 'Procesando...' : 'Confirmar Reservación'}
          <CheckCircle className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )

  const renderStep4 = () => (
    <div className="text-center space-y-6">
      <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
        <CheckCircle className="h-8 w-8 text-green-600" />
      </div>
      
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          ¡Reservación Confirmada!
        </h3>
        <p className="text-gray-600 mb-4">
          Tu reservación de shuttle ha sido procesada exitosamente
        </p>
        <p className="text-sm text-gray-500">
          Número de confirmación: <span className="font-mono font-semibold">{reservationId}</span>
        </p>
      </div>

      <div className="space-y-2">
        <Button 
          onClick={() => onSuccess(reservationId!)}
          className="w-full bg-antigua-purple hover:bg-antigua-purple-dark"
        >
          Ver Detalles
        </Button>
        <Button 
          variant="outline" 
          onClick={onClose}
          className="w-full"
        >
          Cerrar
        </Button>
      </div>
    </div>
  )

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Reservar Shuttle
          </DialogTitle>
          <DialogDescription>
            {shuttleRoute.name} - {getDirectionLabel(shuttleRoute.direction)}
          </DialogDescription>
        </DialogHeader>

        {/* Indicador de pasos */}
        <div className="flex items-center justify-center space-x-4 mb-6">
          {[1, 2, 3].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= stepNumber 
                  ? 'bg-antigua-purple text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {stepNumber}
              </div>
              {stepNumber < 3 && (
                <div className={`w-8 h-0.5 mx-2 ${
                  step > stepNumber ? 'bg-antigua-purple' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Contenido del paso actual */}
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}

        {/* Mensaje de error general */}
        {errors.general && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>{errors.general}</span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

