'use client'

import PublicLayout from '@/components/layout/public-layout'
import { Button } from '@/components/ui/button'
import { 
  MapPin, 
  Clock, 
  Users, 
  Star,
  Calendar,
  ArrowLeft,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Share2,
  Heart
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { PublicBookingForm } from '@/components/forms/public-booking-form'

interface ActivityImage {
  id: string
  imageUrl: string
  altText: string
  isPrimary: boolean
  displayOrder: number
}

interface ActivitySchedule {
  id: string
  startTime: string
  endTime: string
  date: string
  availableSpots: number
  maxSpots: number
}

interface ActivityAmenity {
  name: string
  icon: string
  description: string
}

interface Activity {
  id: string
  name: string
  description: string
  shortDescription: string
  basePrice: number
  currency: string
  duration: number
  durationHours: number | null
  minParticipants: number
  maxParticipants: number | null
  ageRestriction: string | null
  difficulty: string
  location: string
  meetingPoint: string | null
  whatIncludes: string | null
  whatToBring: string | null
  cancellationPolicy: string | null
  isActive: boolean
  isFeatured: boolean
  images: ActivityImage[]
  schedules: ActivitySchedule[]
  amenities: ActivityAmenity[]
}

const difficultyLevels = {
  easy: { label: 'Fácil', color: 'bg-green-100 text-green-800' },
  moderate: { label: 'Moderado', color: 'bg-yellow-100 text-yellow-800' },
  challenging: { label: 'Difícil', color: 'bg-orange-100 text-orange-800' },
  extreme: { label: 'Extremo', color: 'bg-red-100 text-red-800' }
}

export default function ActivityDetailPage() {
  const { t } = useLanguage()
  const params = useParams()
  const [activity, setActivity] = useState<Activity | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [bookingData, setBookingData] = useState<any>(null)
  const [participants, setParticipants] = useState(1)
  const [availabilityStatus, setAvailabilityStatus] = useState<'checking' | 'available' | 'unavailable' | 'not-selected'>('not-selected')
  const [availabilityMessage, setAvailabilityMessage] = useState('')
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false)


  // Función para cargar la actividad
  const loadActivity = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/public/activities/${params.id}`)
      
      if (response.ok) {
        const data = await response.json()
        console.log('🔍 Activity loaded:', data)
        console.log('🔍 Schedules in data:', data.schedules)
        console.log('🔍 Schedules length:', data.schedules?.length || 0)
        setActivity(data)
        // Seleccionar la primera fecha disponible por defecto solo en la carga inicial
        if (!selectedDate && data.schedules && data.schedules.length > 0) {
          console.log('🔍 Setting default date:', data.schedules[0].date)
          setSelectedDate(data.schedules[0].date)
        } else if (selectedDate && data.schedules) {
          // Verificar si la fecha seleccionada aún existe
          const stillExists = data.schedules.some((s: any) => s.date === selectedDate)
          if (!stillExists) {
            setSelectedDate(null)
          }
        }
      } else if (response.status === 404) {
        setError('Actividad no encontrada')
      } else {
        setError('Error al cargar la actividad')
      }
    } catch (error) {
      console.error('Error loading activity:', error)
      setError('Error al cargar la actividad')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (params.id) {
      loadActivity()
    }
  }, [params.id])

  // Verificar disponibilidad cuando cambien los participantes o la fecha
  useEffect(() => {
    if (activity && selectedDate && participants) {
      const timeoutId = setTimeout(() => {
        checkAvailability()
      }, 500) // Debounce de 500ms

      return () => clearTimeout(timeoutId)
    }
  }, [selectedDate, participants, activity])

  const getDifficultyInfo = (difficulty: string) => {
    return difficultyLevels[difficulty as keyof typeof difficultyLevels] || difficultyLevels.moderate
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`
  }

  const formatParticipants = (min: number, max?: number) => {
    if (max) return `${min}-${max} personas`
    return `${min}+ personas`
  }

  const nextImage = () => {
    if (activity) {
      setCurrentImageIndex((prev) => 
        prev === activity.images.length - 1 ? 0 : prev + 1
      )
    }
  }

  const prevImage = () => {
    if (activity) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? activity.images.length - 1 : prev - 1
      )
    }
  }

  const handleReserve = () => {
    console.log('🔍 handleReserve called:', { activity: !!activity, selectedDate, participants })
    
    if (!activity) {
      console.log('❌ No activity')
      return
    }
    
    if (!selectedDate) {
      console.log('❌ No selectedDate')
      return
    }
    
    // Validar número de participantes
    if (participants < activity.minParticipants) {
      console.log('❌ Participants below minimum:', participants, activity.minParticipants)
      return
    }
    
    if (activity.maxParticipants && participants > activity.maxParticipants) {
      console.log('❌ Participants above maximum:', participants, activity.maxParticipants)
      return
    }
    
    const selectedSchedule = activity.schedules.find(s => s.date === selectedDate)
    console.log('🔍 selectedSchedule:', selectedSchedule)
    
    if (!selectedSchedule) {
      console.log('❌ No selectedSchedule found for date:', selectedDate)
      return
    }
    
    const totalAmount = parseFloat(activity.basePrice.toString()) * participants
    console.log('🔍 totalAmount:', totalAmount)
    
    setBookingData({
      serviceType: 'ACTIVITY',
      serviceId: activity.id,
      scheduleId: selectedSchedule.id, // Agregar scheduleId
      serviceName: activity.name,
      checkIn: selectedDate,
      participants: participants,
      totalAmount: totalAmount,
      currency: activity.currency,
      description: `${activity.name} - ${selectedSchedule.startTime} - ${selectedSchedule.endTime}`,
      image: activity.images?.[0]?.imageUrl
    })
    
    console.log('✅ Opening booking form')
    setShowBookingForm(true)
  }

  const handleReserveSchedule = (schedule: any) => {
    if (!activity) return
    
    // Validar disponibilidad usando la función canReserveSchedule
    if (!canReserveSchedule(schedule)) {
      console.log('❌ Cannot reserve schedule:', {
        participants,
        availableSpots: schedule.availableSpots,
        minParticipants: activity.minParticipants,
        maxParticipants: activity.maxParticipants
      })
      return
    }
    
    const totalAmount = parseFloat(activity.basePrice.toString()) * participants
    
    setBookingData({
      serviceType: 'ACTIVITY',
      serviceId: activity.id,
      scheduleId: schedule.id,
      serviceName: activity.name,
      checkIn: schedule.date,
      participants: participants,
      totalAmount: totalAmount,
      currency: activity.currency,
      description: `${activity.name} - ${schedule.startTime} - ${schedule.endTime}`,
      image: activity.images?.[0]?.imageUrl
    })
    
    setShowBookingForm(true)
  }

  const handleBookingSuccess = (reservationId: string) => {
    setShowBookingForm(false)
    alert(`¡Reservación confirmada! Número: ${reservationId}`)
    
    // Recargar la actividad para actualizar la disponibilidad
    if (params.id) {
      loadActivity()
    }
  }


  const getAvailableSchedules = () => {
    if (!activity) {
      console.log('🔍 getAvailableSchedules: No activity')
      return []
    }
    if (!activity.schedules) {
      console.log('🔍 getAvailableSchedules: No schedules in activity')
      return []
    }
    if (selectedDate) {
      const filtered = activity.schedules.filter(schedule => schedule.date === selectedDate)
      console.log('🔍 getAvailableSchedules: Filtered by date', selectedDate, filtered.length)
      return filtered
    }
    console.log('🔍 getAvailableSchedules: All schedules', activity.schedules.length)
    return activity.schedules
  }

  const getUniqueDates = () => {
    if (!activity) {
      console.log('🔍 getUniqueDates: No activity')
      return []
    }
    if (!activity.schedules) {
      console.log('🔍 getUniqueDates: No schedules in activity')
      return []
    }
    const dates = Array.from(new Set(activity.schedules.map(schedule => schedule.date)))
    console.log('🔍 getUniqueDates: Unique dates', dates)
    return dates.sort()
  }

  // Validar si se puede reservar
  const canReserve = () => {
    if (!activity || !selectedDate) return false
    if (participants < activity.minParticipants) return false
    if (activity.maxParticipants && participants > activity.maxParticipants) return false
    if (availabilityStatus !== 'available') return false
    return true
  }

  // Validar disponibilidad para horarios individuales
  const canReserveSchedule = (schedule: any) => {
    if (!activity) return false
    if (participants < activity.minParticipants) return false
    if (activity.maxParticipants && participants > activity.maxParticipants) return false
    if (schedule.availableSpots < participants) return false
    return true
  }

  // Obtener mensaje de error de participantes
  const getParticipantErrorMessage = () => {
    if (!activity) return ''
    if (participants < activity.minParticipants) {
      return `Mínimo ${activity.minParticipants} participantes requeridos`
    }
    if (activity.maxParticipants && participants > activity.maxParticipants) {
      return `Máximo ${activity.maxParticipants} participantes permitidos`
    }
    return ''
  }

  // Verificar disponibilidad en tiempo real
  const checkAvailability = async () => {
    if (!activity || !selectedDate || !participants) {
      setAvailabilityStatus('not-selected')
      setAvailabilityMessage('')
      return
    }

    const selectedSchedule = activity.schedules.find(s => s.date === selectedDate)
    if (!selectedSchedule) {
      setAvailabilityStatus('unavailable')
      setAvailabilityMessage('Horario no encontrado')
      return
    }

    setIsCheckingAvailability(true)
    setAvailabilityStatus('checking')
    setAvailabilityMessage('Verificando disponibilidad...')

    try {
      const response = await fetch('/api/check-activity-availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scheduleId: selectedSchedule.id,
          participants: participants
        })
      })

      const data = await response.json()

      if (data.available) {
        setAvailabilityStatus('available')
        setAvailabilityMessage('¡Disponible!')
      } else {
        setAvailabilityStatus('unavailable')
        setAvailabilityMessage(data.message || 'No hay disponibilidad')
      }
    } catch (error) {
      console.error('Error checking availability:', error)
      setAvailabilityStatus('unavailable')
      setAvailabilityMessage('Error verificando disponibilidad')
    } finally {
      setIsCheckingAvailability(false)
    }
  }

  if (loading) {
    return (
      <PublicLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </PublicLayout>
    )
  }

  if (error || !activity) {
    return (
      <PublicLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {error || 'Actividad no encontrada'}
            </h1>
            <Link href="/activities">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a actividades
              </Button>
            </Link>
          </div>
        </div>
      </PublicLayout>
    )
  }

  const difficultyInfo = getDifficultyInfo(activity.difficulty)
  const currentImage = activity.images[currentImageIndex]
  const availableSchedules = getAvailableSchedules()
  const uniqueDates = getUniqueDates()
  
  // Debug logs
  console.log('🔍 Render state:', { 
    activity: !!activity, 
    selectedDate, 
    participants, 
    availableSchedules: availableSchedules.length,
    uniqueDates: uniqueDates.length 
  })

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header con navegación */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <Link href="/activities">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver a actividades
                </Button>
              </Link>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartir
                </Button>
                <Button variant="outline" size="sm">
                  <Heart className="h-4 w-4 mr-2" />
                  Guardar
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Columna principal */}
            <div className="lg:col-span-2">
              {/* Galería de imágenes */}
              <div className="relative mb-8">
                <div className="relative h-96 lg:h-[500px] rounded-lg overflow-hidden">
                  <Image
                    src={currentImage.imageUrl}
                    alt={currentImage.altText}
                    fill
                    className="object-cover"
                  />
                  
                  {/* Navegación de imágenes */}
                  {activity.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-opacity"
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-opacity"
                      >
                        <ChevronRight className="h-6 w-6" />
                      </button>
                    </>
                  )}
                </div>

                {/* Indicadores de imágenes */}
                {activity.images.length > 1 && (
                  <div className="flex justify-center mt-4 space-x-2">
                    {activity.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-3 h-3 rounded-full transition-colors ${
                          index === currentImageIndex ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Información principal */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {activity.name}
                    </h1>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {activity.location}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {formatDuration(activity.duration)}
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {formatParticipants(activity.minParticipants || 1, activity.maxParticipants || 50)}
                      </div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${difficultyInfo.color}`}>
                    {difficultyInfo.label}
                  </span>
                </div>

                <p className="text-gray-700 text-lg leading-relaxed mb-6">
                  {activity.description}
                </p>

                {/* Información detallada */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {activity.meetingPoint && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Punto de encuentro</h3>
                      <p className="text-gray-600">{activity.meetingPoint}</p>
                    </div>
                  )}

                  {activity.ageRestriction && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Restricción de edad</h3>
                      <p className="text-gray-600">{activity.ageRestriction}</p>
                    </div>
                  )}

                  {activity.whatIncludes && (
                    <div className="md:col-span-2">
                      <h3 className="font-semibold text-gray-900 mb-2">¿Qué incluye?</h3>
                      <div className="text-gray-600 whitespace-pre-line">{activity.whatIncludes}</div>
                    </div>
                  )}

                  {activity.whatToBring && (
                    <div className="md:col-span-2">
                      <h3 className="font-semibold text-gray-900 mb-2">¿Qué traer?</h3>
                      <div className="text-gray-600 whitespace-pre-line">{activity.whatToBring}</div>
                    </div>
                  )}

                  {activity.cancellationPolicy && (
                    <div className="md:col-span-2">
                      <h3 className="font-semibold text-gray-900 mb-2">Política de cancelación</h3>
                      <div className="text-gray-600 whitespace-pre-line">{activity.cancellationPolicy}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Amenidades */}
              {activity.amenities.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Amenidades</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activity.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <Check className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{amenity.name}</p>
                          {amenity.description && (
                            <p className="text-sm text-gray-600">{amenity.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar de reserva */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    ${activity.basePrice}
                    <span className="text-lg font-normal text-gray-500 ml-1">
                      {activity.currency}
                    </span>
                  </div>
                  <p className="text-gray-600">por persona</p>
                </div>

                {/* Selección de fecha */}
                {uniqueDates.length > 0 ? (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Seleccionar fecha</h3>
                    <div className="grid grid-cols-1 gap-2">
                      {uniqueDates.map((date) => (
                        <button
                          key={date}
                          onClick={() => setSelectedDate(date)}
                          className={`p-3 text-left rounded-lg border transition-colors ${
                            selectedDate === date
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">
                              {new Date(date).toLocaleDateString('es-ES', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </span>
                            <span className="text-sm text-gray-500">
                              {activity.schedules.filter(s => s.date === date).length} horarios
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                {/* Horarios disponibles */}
                {availableSchedules.length > 0 ? (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Horarios disponibles
                      <span className="ml-2 text-sm text-gray-500">
                        ({availableSchedules.filter(s => canReserveSchedule(s)).length} disponibles para {participants} personas)
                      </span>
                    </h3>
                    <div className="space-y-2">
                      {availableSchedules.map((schedule) => (
                        <div
                          key={schedule.id}
                          className={`p-3 border rounded-lg transition-colors ${
                            canReserveSchedule(schedule)
                              ? 'border-gray-200 hover:border-blue-300 cursor-pointer'
                              : 'border-red-200 bg-red-50 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">
                                {schedule.startTime} - {schedule.endTime}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <p className={`text-sm ${
                                  schedule.availableSpots >= participants 
                                    ? 'text-green-600' 
                                    : 'text-red-600'
                                }`}>
                                  {schedule.availableSpots} lugares disponibles
                                </p>
                                {schedule.availableSpots < participants && (
                                  <span className="text-xs text-red-500 bg-red-100 px-2 py-1 rounded">
                                    Necesitas {participants}
                                  </span>
                                )}
                                {schedule.availableSpots === 0 && (
                                  <span className="text-xs text-red-500 bg-red-100 px-2 py-1 rounded">
                                    AGOTADO
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="ml-4">
                              <Button 
                                size="sm" 
                                onClick={() => handleReserveSchedule(schedule)}
                                disabled={!canReserveSchedule(schedule)}
                                variant={canReserveSchedule(schedule) ? "default" : "outline"}
                                className={!canReserveSchedule(schedule) ? "opacity-50" : ""}
                              >
                                {!canReserveSchedule(schedule) 
                                  ? schedule.availableSpots < participants 
                                    ? 'Sin cupo' 
                                    : 'Inválido'
                                  : 'Reservar'
                                }
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mb-6">
                    <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                      <p className="text-yellow-800 font-medium">No hay horarios disponibles</p>
                      <p className="text-yellow-600 text-sm mt-1">
                        Por favor, contacta con nosotros para más información sobre disponibilidad.
                      </p>
                    </div>
                  </div>
                )}

                {/* Selección de participantes */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Número de participantes</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border border-gray-300 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span className="text-sm font-medium">Participantes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setParticipants(prev => Math.max(activity.minParticipants, prev - 1))}
                          disabled={participants <= activity.minParticipants}
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
                          onClick={() => setParticipants(prev => Math.min(activity.maxParticipants || 20, prev + 1))}
                          disabled={participants >= (activity.maxParticipants || 20)}
                          className="h-8 w-8 p-0"
                        >
                          +
                        </Button>
                      </div>
                    </div>
                    
                    {/* Información de límites */}
                    <div className="text-xs text-gray-500 text-center">
                      Mínimo: {activity.minParticipants} personas
                      {activity.maxParticipants && ` • Máximo: ${activity.maxParticipants} personas`}
                    </div>
                  </div>
                </div>

                {/* Estado de disponibilidad */}
                {availabilityMessage && (
                  <div className={`p-3 rounded-lg text-sm mb-4 ${
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

                {/* Mensaje de error de participantes */}
                {!canReserve() && getParticipantErrorMessage() && (
                  <div className="text-xs text-red-500 text-center bg-red-50 p-2 rounded-md mb-4">
                    {getParticipantErrorMessage()}
                  </div>
                )}

                {/* Botón de reserva principal */}
                <Button 
                  className="w-full" 
                  size="lg" 
                  onClick={handleReserve}
                  disabled={!canReserve()}
                >
                  <Calendar className="h-5 w-5 mr-2" />
                  {!selectedDate 
                    ? 'Selecciona una fecha' 
                    : availabilityStatus === 'checking'
                    ? 'Verificando...'
                    : availabilityStatus === 'unavailable'
                    ? 'No disponible'
                    : !canReserve()
                    ? 'Participantes inválidos'
                    : 'Reservar ahora'
                  }
                </Button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  Reserva segura • Cancelación gratuita
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

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