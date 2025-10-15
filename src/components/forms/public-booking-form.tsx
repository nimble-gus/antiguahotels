'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Calendar, 
  Users, 
  User,
  Phone,
  Mail,
  MapPin,
  Clock,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Bed,
  Plane,
  Package,
  Building,
  Star,
  Shield,
  CreditCard
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { useLanguage } from '@/contexts/LanguageContext'

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

interface BookingData {
  serviceType: 'ACCOMMODATION' | 'ACTIVITY' | 'PACKAGE'
  serviceId: string
  roomTypeId?: string // Para habitaciones
  scheduleId?: string // Para actividades
  serviceName: string
  checkIn?: string
  checkOut?: string
  participants: number
  rooms?: number
  totalAmount: number
  currency: string
  description: string
  image?: string
}

interface PublicBookingFormProps {
  bookingData: BookingData
  onClose: () => void
  onSuccess: (reservationId: string) => void
}

export function PublicBookingForm({ bookingData, onClose, onSuccess }: PublicBookingFormProps) {
  const { t } = useLanguage()
  const [step, setStep] = useState(1) // 1: Información del huésped, 2: Confirmación, 3: Pago
  const [loading, setLoading] = useState(false)
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
  const [reservationId, setReservationId] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

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

  const handleGuestInfoChange = (field: keyof GuestInfo, value: string) => {
    setGuestInfo(prev => ({ ...prev, [field]: value }))
    // Limpiar error cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
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
          itemType: bookingData.serviceType,
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
          // Datos específicos según el tipo de servicio
          ...(bookingData.serviceType === 'ACCOMMODATION' ? {
            hotelId: bookingData.serviceId,
            roomTypeId: bookingData.roomTypeId,
            checkInDate: bookingData.checkIn,
            checkOutDate: bookingData.checkOut,
            adults: bookingData.participants,
            children: 0,
            specialRequests: guestInfo.specialRequests,
            guestName: `${guestInfo.firstName} ${guestInfo.lastName}`,
          } : bookingData.serviceType === 'ACTIVITY' ? {
            activityId: bookingData.serviceId,
            scheduleId: bookingData.scheduleId,
            participants: bookingData.participants,
            participantNames: `${guestInfo.firstName} ${guestInfo.lastName}`,
            emergencyContact: guestInfo.emergencyContact,
            emergencyPhone: guestInfo.emergencyPhone,
          } : {
            packageId: bookingData.serviceId,
            startDate: bookingData.checkIn,
            endDate: bookingData.checkOut,
            participants: bookingData.participants,
            participantNames: `${guestInfo.firstName} ${guestInfo.lastName}`,
            specialRequests: guestInfo.specialRequests,
          })
        }),
      })

      const result = await response.json()
      
      if (response.ok) {
        setReservationId(result.reservationId)
        setStep(3) // Ir a confirmación
        onSuccess(result.reservationId)
      } else {
        throw new Error(result.error || 'Error creando reservación')
      }
    } catch (error) {
      console.error('Error creating reservation:', error)
      alert('Error creando la reservación. Por favor, inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const getServiceIcon = () => {
    switch (bookingData.serviceType) {
      case 'ACCOMMODATION':
        return <Bed className="h-6 w-6 text-blue-500" />
      case 'ACTIVITY':
        return <Plane className="h-6 w-6 text-green-500" />
      case 'PACKAGE':
        return <Package className="h-6 w-6 text-purple-500" />
      default:
        return <Building className="h-6 w-6 text-gray-500" />
    }
  }

  const getServiceTypeLabel = () => {
    switch (bookingData.serviceType) {
      case 'ACCOMMODATION':
        return 'Alojamiento'
      case 'ACTIVITY':
        return 'Actividad'
      case 'PACKAGE':
        return 'Paquete'
      default:
        return 'Servicio'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-xl font-semibold">
              Reservar {getServiceTypeLabel()}
            </CardTitle>
            <CardDescription>
              {bookingData.serviceName}
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Resumen del servicio */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start space-x-4">
              {getServiceIcon()}
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{bookingData.serviceName}</h3>
                <p className="text-gray-600 text-sm mt-1">{bookingData.description}</p>
                
                <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
                  {bookingData.checkIn && (
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>Check-in: {bookingData.checkIn}</span>
                    </div>
                  )}
                  {bookingData.checkOut && (
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>Check-out: {bookingData.checkOut}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{bookingData.participants} {bookingData.participants === 1 ? 'persona' : 'personas'}</span>
                  </div>
                  {bookingData.rooms && (
                    <div className="flex items-center space-x-1">
                      <Bed className="h-4 w-4" />
                      <span>{bookingData.rooms} {bookingData.rooms === 1 ? 'habitación' : 'habitaciones'}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-antigua-purple">
                  {formatCurrency(bookingData.totalAmount, bookingData.currency)}
                </div>
              </div>
            </div>
          </div>

          {/* Paso 1: Información del huésped */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Información del Huésped</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Nombre *</Label>
                  <Input
                    id="firstName"
                    value={guestInfo.firstName}
                    onChange={(e) => handleGuestInfoChange('firstName', e.target.value)}
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
                    onChange={(e) => handleGuestInfoChange('lastName', e.target.value)}
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
                    onChange={(e) => handleGuestInfoChange('email', e.target.value)}
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
                    onChange={(e) => handleGuestInfoChange('phone', e.target.value)}
                    className={errors.phone ? 'border-red-500' : ''}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="nationality">Nacionalidad</Label>
                  <Select
                    value={guestInfo.nationality}
                    onValueChange={(value) => handleGuestInfoChange('nationality', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Guatemala">Guatemala</SelectItem>
                      <SelectItem value="Estados Unidos">Estados Unidos</SelectItem>
                      <SelectItem value="México">México</SelectItem>
                      <SelectItem value="El Salvador">El Salvador</SelectItem>
                      <SelectItem value="Honduras">Honduras</SelectItem>
                      <SelectItem value="Nicaragua">Nicaragua</SelectItem>
                      <SelectItem value="Costa Rica">Costa Rica</SelectItem>
                      <SelectItem value="Belice">Belice</SelectItem>
                      <SelectItem value="Otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {(bookingData.serviceType === 'ACTIVITY' || bookingData.serviceType === 'PACKAGE') && (
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Información de Emergencia</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="emergencyContact">Contacto de Emergencia</Label>
                      <Input
                        id="emergencyContact"
                        value={guestInfo.emergencyContact || ''}
                        onChange={(e) => handleGuestInfoChange('emergencyContact', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="emergencyPhone">Teléfono de Emergencia</Label>
                      <Input
                        id="emergencyPhone"
                        value={guestInfo.emergencyPhone || ''}
                        onChange={(e) => handleGuestInfoChange('emergencyPhone', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="specialRequests">Solicitudes Especiales</Label>
                <Textarea
                  id="specialRequests"
                  value={guestInfo.specialRequests || ''}
                  onChange={(e) => handleGuestInfoChange('specialRequests', e.target.value)}
                  placeholder="Menciona cualquier solicitud especial o comentario..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button onClick={() => setStep(2)}>
                  Continuar
                </Button>
              </div>
            </div>
          )}

          {/* Paso 2: Confirmación */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Confirmar Reservación</span>
              </h3>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Resumen de la Reservación</h4>
                <div className="space-y-2 text-sm text-blue-800">
                  <p><strong>Servicio:</strong> {bookingData.serviceName}</p>
                  <p><strong>Huésped:</strong> {guestInfo.firstName} {guestInfo.lastName}</p>
                  <p><strong>Email:</strong> {guestInfo.email}</p>
                  <p><strong>Teléfono:</strong> {guestInfo.phone}</p>
                  {bookingData.checkIn && <p><strong>Check-in:</strong> {bookingData.checkIn}</p>}
                  {bookingData.checkOut && <p><strong>Check-out:</strong> {bookingData.checkOut}</p>}
                  <p><strong>Participantes:</strong> {bookingData.participants}</p>
                  {bookingData.rooms && <p><strong>Habitaciones:</strong> {bookingData.rooms}</p>}
                  <p><strong>Total:</strong> {formatCurrency(bookingData.totalAmount, bookingData.currency)}</p>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Atrás
                </Button>
                <Button onClick={handleCreateReservation} disabled={loading}>
                  {loading ? 'Creando...' : 'Confirmar Reservación'}
                </Button>
              </div>
            </div>
          )}

          {/* Paso 3: Confirmación exitosa */}
          {step === 3 && reservationId && (
            <div className="space-y-4 text-center">
              <div className="flex justify-center">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              
              <h3 className="text-xl font-semibold text-green-700">
                ¡Reservación Confirmada!
              </h3>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800">
                  <strong>Número de Confirmación:</strong> {reservationId}
                </p>
                <p className="text-sm text-green-700 mt-2">
                  Te hemos enviado un email de confirmación a {guestInfo.email}
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium">Próximos pasos:</p>
                    <ul className="mt-1 space-y-1 text-left">
                      <li>• Revisa tu email para más detalles</li>
                      <li>• Contacta al hotel/servicio si tienes preguntas</li>
                      <li>• Llega puntual en la fecha acordada</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex justify-center space-x-3">
                <Button onClick={onClose}>
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
