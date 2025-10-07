'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import PublicLayout from '@/components/layout/public-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Calendar, 
  Users, 
  CreditCard, 
  MapPin, 
  Clock, 
  Shield, 
  CheckCircle,
  AlertCircle,
  Building,
  Plane,
  Car,
  Package,
  Hotel,
  Bed
} from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { CyberSourcePaymentForm } from '@/components/payment/cybersource-payment-form'
import { formatCurrency } from '@/lib/utils'

interface BookingData {
  serviceType: 'hotel' | 'activity' | 'package' | 'shuttle'
  serviceId: string
  serviceName: string
  checkIn?: string
  checkOut?: string
  participants: number
  rooms?: number
  totalAmount: number
  currency: 'USD' | 'GTQ'
  description: string
  image?: string
}

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

export default function BookingPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [bookingData, setBookingData] = useState<BookingData | null>(null)
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
  const [paymentMethod, setPaymentMethod] = useState<'cybersource' | 'manual'>('cybersource')
  const [reservationId, setReservationId] = useState<string | null>(null)

  // Cargar datos de la URL
  useEffect(() => {
    const serviceType = searchParams.get('type') as BookingData['serviceType']
    const serviceId = searchParams.get('id')
    const checkIn = searchParams.get('checkin')
    const checkOut = searchParams.get('checkout')
    const participants = parseInt(searchParams.get('participants') || '1')
    const rooms = parseInt(searchParams.get('rooms') || '1')

    if (serviceType && serviceId) {
      // Simular datos del servicio (en producción vendría de la API)
      const mockData: BookingData = {
        serviceType,
        serviceId,
        serviceName: getServiceName(serviceType, serviceId),
        checkIn: checkIn || undefined,
        checkOut: checkOut || undefined,
        participants,
        rooms: serviceType === 'hotel' ? rooms : undefined,
        totalAmount: calculateAmount(serviceType, participants, rooms),
        currency: 'USD',
        description: getServiceDescription(serviceType, serviceId),
        image: getServiceImage(serviceType, serviceId)
      }
      setBookingData(mockData)
    }
  }, [searchParams])

  const getServiceName = (type: string, id: string) => {
    const names = {
      hotel: 'Hotel Casa Antigua',
      activity: 'Tour Volcán Pacaya',
      package: 'Paquete Aventura Completa',
      shuttle: 'Shuttle Aeropuerto - Hotel'
    }
    return names[type as keyof typeof names] || 'Servicio'
  }

  const getServiceDescription = (type: string, id: string) => {
    const descriptions = {
      hotel: 'Hotel boutique en el corazón de Antigua con vistas espectaculares al volcán',
      activity: 'Aventura única al volcán activo con guía experto y equipamiento incluido',
      package: '3 días de experiencias únicas incluyendo alojamiento, tours y transporte',
      shuttle: 'Transporte cómodo y seguro entre el aeropuerto y tu hotel'
    }
    return descriptions[type as keyof typeof descriptions] || 'Descripción del servicio'
  }

  const getServiceImage = (type: string, id: string) => {
    const images = {
      hotel: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&h=300&fit=crop',
      activity: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop',
      package: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=500&h=300&fit=crop',
      shuttle: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&h=300&fit=crop'
    }
    return images[type as keyof typeof images]
  }

  const calculateAmount = (type: string, participants: number, rooms?: number) => {
    const basePrices = {
      hotel: 85,
      activity: 45,
      package: 299,
      shuttle: 25
    }
    const basePrice = basePrices[type as keyof typeof basePrices] || 50
    return basePrice * (type === 'hotel' ? (rooms || 1) : participants)
  }

  const getServiceIcon = (type: string) => {
    const icons = {
      hotel: Hotel,
      activity: Plane,
      package: Package,
      shuttle: Car
    }
    return icons[type as keyof typeof icons] || Building
  }

  const handleGuestInfoChange = (field: keyof GuestInfo, value: string) => {
    setGuestInfo(prev => ({ ...prev, [field]: value }))
  }

  const handleCreateReservation = async () => {
    if (!bookingData) return

    setLoading(true)
    try {
      // Crear reservación en la base de datos
      const response = await fetch('/api/booking/create-reservation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceType: bookingData.serviceType,
          serviceId: bookingData.serviceId,
          guestInfo,
          bookingData: {
            checkIn: bookingData.checkIn,
            checkOut: bookingData.checkOut,
            participants: bookingData.participants,
            rooms: bookingData.rooms,
            totalAmount: bookingData.totalAmount,
            currency: bookingData.currency
          }
        })
      })

      const result = await response.json()
      
      if (result.success) {
        setReservationId(result.reservationId)
        setStep(3) // Ir a paso de pago
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

  const handlePaymentSuccess = () => {
    setStep(4) // Ir a confirmación
  }

  const handlePaymentCancel = () => {
    setStep(2) // Volver a información del huésped
  }

  if (!bookingData) {
    return (
      <PublicLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No se encontraron datos de reserva
            </h2>
            <p className="text-gray-600 mb-4">
              Por favor, selecciona un servicio desde la página principal
            </p>
            <Button onClick={() => router.push('/')}>
              Volver al Inicio
            </Button>
          </div>
        </div>
      </PublicLayout>
    )
  }

  const ServiceIcon = getServiceIcon(bookingData.serviceType)

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Reserva tu Experiencia
              </h1>
              <p className="text-gray-600">
                Completa tu reserva de forma segura con CyberSource/NeoNet
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sidebar - Resumen de la Reserva */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <ServiceIcon className="h-5 w-5 text-antigua-purple" />
                    <span>Resumen de la Reserva</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Servicio */}
                  <div className="flex items-start space-x-3">
                    {bookingData.image && (
                      <img 
                        src={bookingData.image} 
                        alt={bookingData.serviceName}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {bookingData.serviceName}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {bookingData.description}
                      </p>
                    </div>
                  </div>

                  {/* Detalles */}
                  <div className="space-y-2 text-sm">
                    {bookingData.checkIn && (
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>Check-in: {bookingData.checkIn}</span>
                      </div>
                    )}
                    {bookingData.checkOut && (
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>Check-out: {bookingData.checkOut}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span>{bookingData.participants} {bookingData.participants === 1 ? 'persona' : 'personas'}</span>
                    </div>
                    {bookingData.rooms && (
                      <div className="flex items-center space-x-2">
                        <Bed className="h-4 w-4 text-gray-400" />
                        <span>{bookingData.rooms} {bookingData.rooms === 1 ? 'habitación' : 'habitaciones'}</span>
                      </div>
                    )}
                  </div>

                  {/* Total */}
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">Total:</span>
                      <span className="text-2xl font-bold text-antigua-purple">
                        {formatCurrency(bookingData.totalAmount)} {bookingData.currency}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Incluye impuestos y cargos
                    </p>
                  </div>

                  {/* Progreso */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progreso</span>
                      <span>{step}/4</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-antigua-purple h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(step / 4) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {step === 1 && 'Información del servicio'}
                      {step === 2 && 'Datos del huésped'}
                      {step === 3 && 'Pago seguro'}
                      {step === 4 && 'Confirmación'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contenido Principal */}
            <div className="lg:col-span-2">
              {/* Paso 1: Información del Servicio */}
              {step === 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Información del Servicio</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="font-semibold text-blue-900 mb-2">
                        {bookingData.serviceName}
                      </h3>
                      <p className="text-blue-800 text-sm mb-3">
                        {bookingData.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-blue-900">
                          {formatCurrency(bookingData.totalAmount)} {bookingData.currency}
                        </span>
                        <div className="flex items-center space-x-2 text-sm text-blue-600">
                          <Shield className="h-4 w-4" />
                          <span>Pago Seguro</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-center">
                      <Button 
                        onClick={() => setStep(2)}
                        size="lg"
                        className="bg-antigua-purple hover:bg-antigua-purple-dark"
                      >
                        Continuar con la Reserva
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Paso 2: Información del Huésped */}
              {step === 2 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Información del Huésped</CardTitle>
                    <p className="text-gray-600">
                      Por favor, completa tus datos para la reserva
                    </p>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nombre <span className="text-red-500">*</span>
                          </label>
                          <Input
                            type="text"
                            value={guestInfo.firstName}
                            onChange={(e) => handleGuestInfoChange('firstName', e.target.value)}
                            placeholder="Tu nombre"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Apellido <span className="text-red-500">*</span>
                          </label>
                          <Input
                            type="text"
                            value={guestInfo.lastName}
                            onChange={(e) => handleGuestInfoChange('lastName', e.target.value)}
                            placeholder="Tu apellido"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email <span className="text-red-500">*</span>
                          </label>
                          <Input
                            type="email"
                            value={guestInfo.email}
                            onChange={(e) => handleGuestInfoChange('email', e.target.value)}
                            placeholder="tu@email.com"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Teléfono <span className="text-red-500">*</span>
                          </label>
                          <Input
                            type="tel"
                            value={guestInfo.phone}
                            onChange={(e) => handleGuestInfoChange('phone', e.target.value)}
                            placeholder="+502 1234-5678"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nacionalidad
                        </label>
                        <Input
                          type="text"
                          value={guestInfo.nationality}
                          onChange={(e) => handleGuestInfoChange('nationality', e.target.value)}
                          placeholder="Guatemala"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Contacto de Emergencia
                          </label>
                          <Input
                            type="text"
                            value={guestInfo.emergencyContact}
                            onChange={(e) => handleGuestInfoChange('emergencyContact', e.target.value)}
                            placeholder="Nombre completo"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Teléfono de Emergencia
                          </label>
                          <Input
                            type="tel"
                            value={guestInfo.emergencyPhone}
                            onChange={(e) => handleGuestInfoChange('emergencyPhone', e.target.value)}
                            placeholder="+502 8765-4321"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Solicitudes Especiales
                        </label>
                        <Textarea
                          value={guestInfo.specialRequests}
                          onChange={(e) => handleGuestInfoChange('specialRequests', e.target.value)}
                          placeholder="Alergias, preferencias alimentarias, accesibilidad, etc."
                          rows={3}
                        />
                      </div>

                      <div className="flex justify-between">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setStep(1)}
                        >
                          Anterior
                        </Button>
                        <Button
                          type="button"
                          onClick={handleCreateReservation}
                          disabled={loading}
                          className="bg-antigua-purple hover:bg-antigua-purple-dark"
                        >
                          {loading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Creando Reserva...
                            </>
                          ) : (
                            'Continuar al Pago'
                          )}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* Paso 3: Pago */}
              {step === 3 && reservationId && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <CreditCard className="h-5 w-5" />
                      <span>Pago Seguro</span>
                    </CardTitle>
                    <p className="text-gray-600">
                      Completa tu pago de forma segura con CyberSource/NeoNet
                    </p>
                  </CardHeader>
                  <CardContent>
                    <CyberSourcePaymentForm
                      reservationId={reservationId}
                      amount={bookingData.totalAmount}
                      currency={bookingData.currency}
                      onSuccess={handlePaymentSuccess}
                      onCancel={handlePaymentCancel}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Paso 4: Confirmación */}
              {step === 4 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span>¡Reserva Confirmada!</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                      <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-green-900 mb-2">
                        ¡Tu reserva ha sido confirmada!
                      </h3>
                      <p className="text-green-800">
                        Te hemos enviado un email de confirmación con todos los detalles.
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Detalles de la Reserva:</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Número de Confirmación:</span>
                          <span className="font-mono font-semibold">#{reservationId?.slice(-8).toUpperCase()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Servicio:</span>
                          <span>{bookingData.serviceName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Pagado:</span>
                          <span className="font-semibold">
                            {formatCurrency(bookingData.totalAmount)} {bookingData.currency}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Método de Pago:</span>
                          <span>CyberSource/NeoNet</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button
                        onClick={() => router.push('/')}
                        className="flex-1"
                      >
                        Volver al Inicio
                      </Button>
                      <Button
                        onClick={() => router.push('/dashboard/reservations')}
                        variant="outline"
                        className="flex-1"
                      >
                        Ver Mis Reservas
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
