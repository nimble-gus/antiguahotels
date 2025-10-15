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
  CreditCard, 
  Package,
  Hotel,
  Plane,
  Clock,
  MapPin,
  ArrowLeft,
  ArrowRight,
  Check,
  X
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

interface PackageSession {
  id: string
  startTs: string
  endTs: string
  capacity: number
  priceOverride?: number
  isActive: boolean
}

interface PackageData {
  id: string
  name: string
  description: string
  durationDays: number
  durationNights: number
  minParticipants: number
  maxParticipants?: number
  basePrice: number
  currency: string
  sessions: PackageSession[]
  hotels: any[]
  activities: any[]
  images: any[]
}

interface PackageBookingFormProps {
  packageData: PackageData
  onClose: () => void
  onSuccess: (reservationId: string) => void
}

export function PackageBookingForm({ packageData, onClose, onSuccess }: PackageBookingFormProps) {
  const { t } = useLanguage()
  const [step, setStep] = useState(1) // 1: Fecha y participantes, 2: Información del huésped, 3: Confirmación
  const [loading, setLoading] = useState(false)
  
  // Estados para selección de fecha y participantes
  const [selectedSession, setSelectedSession] = useState<PackageSession | null>(null)
  const [participants, setParticipants] = useState(packageData.minParticipants)
  const [availabilityStatus, setAvailabilityStatus] = useState<'checking' | 'available' | 'unavailable' | 'not-selected'>('not-selected')
  const [availabilityMessage, setAvailabilityMessage] = useState('')
  
  // Estados para información del huésped
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
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [reservationId, setReservationId] = useState<string | null>(null)

  // Cargar sesiones disponibles al montar el componente
  useEffect(() => {
    console.log('🔍 Package data loaded in form:', {
      id: packageData.id,
      name: packageData.name,
      sessions: packageData.sessions?.length || 0,
      sessionsData: packageData.sessions
    })
    
    if (packageData.sessions && packageData.sessions.length > 0) {
      // Seleccionar la primera sesión disponible por defecto
      console.log('🔍 Setting default session:', packageData.sessions[0])
      setSelectedSession(packageData.sessions[0])
    } else {
      console.log('❌ No sessions available')
    }
  }, [packageData])

  // Verificar disponibilidad cuando cambien los participantes o la sesión
  useEffect(() => {
    if (selectedSession && participants) {
      checkAvailability()
    }
  }, [selectedSession, participants])

  const checkAvailability = async () => {
    if (!selectedSession || !participants) {
      setAvailabilityStatus('not-selected')
      setAvailabilityMessage('')
      return
    }

    setAvailabilityStatus('checking')
    setAvailabilityMessage('Verificando disponibilidad...')

    try {
      const response = await fetch('/api/check-package-availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packageId: packageData.id,
          startDate: selectedSession.startTs.split('T')[0],
          endDate: selectedSession.endTs.split('T')[0],
          participants: participants
        })
      })

      const data = await response.json()

      if (data.available) {
        setAvailabilityStatus('available')
        setAvailabilityMessage('¡Paquete disponible!')
      } else {
        setAvailabilityStatus('unavailable')
        setAvailabilityMessage(data.message || 'No hay disponibilidad')
      }
    } catch (error) {
      console.error('Error checking availability:', error)
      setAvailabilityStatus('unavailable')
      setAvailabilityMessage('Error verificando disponibilidad')
    }
  }

  const validateStep1 = () => {
    if (!selectedSession) {
      setErrors({ general: 'Selecciona una fecha' })
      return false
    }
    if (participants < packageData.minParticipants) {
      setErrors({ general: `Mínimo ${packageData.minParticipants} participantes requeridos` })
      return false
    }
    if (packageData.maxParticipants && participants > packageData.maxParticipants) {
      setErrors({ general: `Máximo ${packageData.maxParticipants} participantes permitidos` })
      return false
    }
    setErrors({})
    return true
  }

  const validateGuestInfo = () => {
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

  const handleCreateReservation = async () => {
    if (!validateGuestInfo()) return

    setLoading(true)
    try {
      const response = await fetch('/api/public/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemType: 'PACKAGE',
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
          packageId: packageData.id,
          startDate: selectedSession?.startTs.split('T')[0],
          endDate: selectedSession?.endTs.split('T')[0],
          participants: participants,
          participantNames: `${guestInfo.firstName} ${guestInfo.lastName}`,
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
    if (!selectedSession) return 0
    const price = selectedSession.priceOverride || packageData.basePrice
    return price * participants
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Selecciona Fecha y Participantes
        </h3>
        <p className="text-gray-600">
          Elige la fecha de inicio y el número de participantes para tu paquete
        </p>
      </div>

      {/* Selección de fecha */}
      <div>
        <Label className="text-sm font-medium text-gray-700 mb-3 block">
          Fecha de inicio
        </Label>
        {console.log('🔍 Sessions data:', packageData.sessions)}
        {packageData.sessions && packageData.sessions.length > 0 ? (
          <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
            {packageData.sessions.map((session) => (
              <div
                key={session.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedSession?.id === session.id
                    ? 'border-antigua-purple bg-antigua-purple/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => {
                  console.log('🔍 Session selected:', session)
                  setSelectedSession(session)
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      {formatDate(session.startTs)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {packageData.durationDays} días / {packageData.durationNights} noches
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-antigua-purple">
                      {formatCurrency(session.priceOverride || packageData.basePrice)}
                    </p>
                    <p className="text-xs text-gray-500">por persona</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
            <p className="text-yellow-800 font-medium">No hay fechas disponibles</p>
            <p className="text-yellow-600 text-sm mt-1">
              Por favor, contacta con nosotros para más información sobre disponibilidad.
            </p>
          </div>
        )}
      </div>

      {/* Selección de participantes */}
      <div>
        <Label className="text-sm font-medium text-gray-700 mb-3 block">
          Número de participantes
        </Label>
        <div className="flex items-center justify-between p-3 border border-gray-300 rounded-lg">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="text-sm font-medium">Participantes</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setParticipants(prev => Math.max(packageData.minParticipants, prev - 1))}
              disabled={participants <= packageData.minParticipants}
              className="h-8 w-8 p-0"
            >
              -
            </Button>
            <span className="px-3 py-1 bg-gray-100 rounded-md min-w-[2rem] text-center text-sm">
              {participants}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setParticipants(prev => Math.min(packageData.maxParticipants || 20, prev + 1))}
              disabled={participants >= (packageData.maxParticipants || 20)}
              className="h-8 w-8 p-0"
            >
              +
            </Button>
          </div>
        </div>
        
        <div className="text-xs text-gray-500 text-center mt-2">
          Mínimo: {packageData.minParticipants} personas
          {packageData.maxParticipants && ` • Máximo: ${packageData.maxParticipants} personas`}
        </div>
      </div>

      {/* Estado de disponibilidad */}
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
              <Check className="h-4 w-4" />
            )}
            {availabilityStatus === 'unavailable' && (
              <X className="h-4 w-4" />
            )}
            <span>{availabilityMessage}</span>
          </div>
        </div>
      )}

      {/* Resumen de precio */}
      {selectedSession && (
        <Card className="bg-gray-50">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-900">{packageData.name}</p>
                <p className="text-sm text-gray-600">
                  {participants} persona{participants !== 1 ? 's' : ''} • {packageData.durationDays} días
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-antigua-purple">
                  {formatCurrency(calculateTotalPrice())}
                </p>
                <p className="text-sm text-gray-600">{packageData.currency}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
          disabled={!selectedSession}
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
          Información del Huésped
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
          placeholder="Alergias, preferencias alimentarias, etc."
        />
      </div>

      {/* Botones de navegación */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep(1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Anterior
        </Button>
        <Button 
          onClick={() => {
            if (validateGuestInfo()) {
              setStep(3)
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
            <Package className="h-5 w-5" />
            {packageData.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-gray-700">Fecha de inicio:</p>
              <p className="text-gray-600">{selectedSession && formatDate(selectedSession.startTs)}</p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Duración:</p>
              <p className="text-gray-600">{packageData.durationDays} días / {packageData.durationNights} noches</p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Participantes:</p>
              <p className="text-gray-600">{participants} persona{participants !== 1 ? 's' : ''}</p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Huésped:</p>
              <p className="text-gray-600">{guestInfo.firstName} {guestInfo.lastName}</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total:</span>
              <span className="text-2xl font-bold text-antigua-purple">
                {formatCurrency(calculateTotalPrice())} {packageData.currency}
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
          Tu reservación ha sido procesada exitosamente
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
            <Package className="h-5 w-5" />
            Reservar Paquete
          </DialogTitle>
          <DialogDescription>
            {packageData.name} - {packageData.durationDays} días
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
