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
  Heart,
  Bed,
  Plane,
  Utensils,
  Camera,
  Wifi,
  Car,
  Shield
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { PublicPackageBookingForm } from '@/components/forms/public-package-booking-form'

interface PackageImage {
  id: string
  imageUrl: string
  altText: string
  isPrimary: boolean
  displayOrder: number
}

interface PackageHotel {
  id: string
  name: string
  city: string
  address: string
  rating: number | null
  roomType: {
    id: string
    name: string
    description: string
    maxOccupancy: number
    bedConfiguration: string
  }
  nights: number
  checkInDay: number
}

interface PackageActivity {
  id: string
  name: string
  description: string
  shortDescription: string
  durationHours: number | null
  difficultyLevel: string | null
  location: string
  basePrice: number
  currency: string
  dayNumber: number
  participantsIncluded: number | null
}

interface PackageSession {
  id: string
  startTs: string
  endTs: string
  capacity: number | null
  priceOverride: number | null
  isActive: boolean
}

interface Package {
  id: string
  name: string
  description: string
  shortDescription: string
  durationDays: number
  durationNights: number
  minParticipants: number
  maxParticipants: number | null
  basePrice: number
  pricePerCouple: number | null
  currency: string
  capacity: number | null
  whatIncludes: string | null
  whatExcludes: string | null
  itinerary: string | null
  cancellationPolicy: string | null
  isActive: boolean
  images: PackageImage[]
  hotels: PackageHotel[]
  activities: PackageActivity[]
  sessions: PackageSession[]
  totalDuration: string
  priceRange: string
  participants: string
}

const difficultyLevels = {
  easy: { label: 'Fácil', color: 'bg-green-100 text-green-800' },
  moderate: { label: 'Moderado', color: 'bg-yellow-100 text-yellow-800' },
  challenging: { label: 'Difícil', color: 'bg-orange-100 text-orange-800' },
  extreme: { label: 'Extremo', color: 'bg-red-100 text-red-800' }
}

export default function PackageDetailPage() {
  const { t } = useLanguage()
  const params = useParams()
  const [packageData, setPackageData] = useState<Package | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [selectedSession, setSelectedSession] = useState<PackageSession | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'itinerary' | 'hotels' | 'activities'>('overview')
  const [showBookingForm, setShowBookingForm] = useState(false)

  useEffect(() => {
    const loadPackage = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/public/packages/${params.id}`)
        
        if (response.ok) {
          const data = await response.json()
          setPackageData(data)
        } else if (response.status === 404) {
          setError('Paquete no encontrado')
        } else {
          setError('Error al cargar el paquete')
        }
      } catch (error) {
        console.error('Error loading package:', error)
        setError('Error al cargar el paquete')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      loadPackage()
    }
  }, [params.id])

  const handleReserve = () => {
    console.log('🔍 handleReserve called:', { packageData: !!packageData, showBookingForm })
    if (!packageData) {
      console.log('❌ No packageData')
      return
    }
    console.log('✅ Opening booking form')
    setShowBookingForm(true)
  }

  const handleBookingSuccess = (reservationId: string) => {
    setShowBookingForm(false)
    alert(`¡Reservación confirmada! Número: ${reservationId}`)
  }


  const getDifficultyInfo = (difficulty: string) => {
    return difficultyLevels[difficulty as keyof typeof difficultyLevels] || difficultyLevels.moderate
  }

  const formatDuration = (hours: number) => {
    if (hours < 1) return `${Math.round(hours * 60)} min`
    if (hours < 24) return `${Math.round(hours)}h`
    const days = Math.floor(hours / 24)
    const remainingHours = hours % 24
    return remainingHours > 0 ? `${days}d ${Math.round(remainingHours)}h` : `${days}d`
  }

  const formatPrice = (basePrice: number, pricePerCouple: number | null, currency: string) => {
    if (pricePerCouple) {
      return `$${basePrice} - $${pricePerCouple} ${currency}`
    }
    return `$${basePrice} ${currency}`
  }

  const nextImage = () => {
    if (packageData) {
      setCurrentImageIndex((prev) => 
        prev === packageData.images.length - 1 ? 0 : prev + 1
      )
    }
  }

  const prevImage = () => {
    if (packageData) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? packageData.images.length - 1 : prev - 1
      )
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

  if (error || !packageData) {
    return (
      <PublicLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {error || 'Paquete no encontrado'}
            </h1>
            <Link href="/packages">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a paquetes
              </Button>
            </Link>
          </div>
        </div>
      </PublicLayout>
    )
  }

  const currentImage = packageData.images[currentImageIndex]

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header con navegación */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <Link href="/packages">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver a paquetes
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
                  {packageData.images.length > 1 && (
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
                {packageData.images.length > 1 && (
                  <div className="flex justify-center mt-4 space-x-2">
                    {packageData.images.map((_, index) => (
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
                      {packageData.name}
                    </h1>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {packageData.totalDuration}
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {packageData.participants}
                      </div>
                      {packageData.capacity && (
                        <div className="flex items-center">
                          <Bed className="h-4 w-4 mr-1" />
                          {packageData.capacity} habitaciones
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Paquete
                  </span>
                </div>

                <p className="text-gray-700 text-lg leading-relaxed mb-6">
                  {packageData.description}
                </p>

                {/* Tabs de navegación */}
                <div className="border-b border-gray-200 mb-6">
                  <nav className="-mb-px flex space-x-8">
                    {[
                      { id: 'overview', label: 'Resumen', icon: Star },
                      { id: 'itinerary', label: 'Itinerario', icon: Calendar },
                      { id: 'hotels', label: 'Hoteles', icon: Bed },
                      { id: 'activities', label: 'Actividades', icon: Plane }
                    ].map((tab) => {
                      const Icon = tab.icon
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id as any)}
                          className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === tab.id
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <Icon className="h-4 w-4 mr-2" />
                          {tab.label}
                        </button>
                      )
                    })}
                  </nav>
                </div>

                {/* Contenido de tabs */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {packageData.whatIncludes && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                          <Check className="h-5 w-5 text-green-600 mr-2" />
                          ¿Qué incluye?
                        </h3>
                        <div className="text-gray-600 whitespace-pre-line">{packageData.whatIncludes}</div>
                      </div>
                    )}

                    {packageData.whatExcludes && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                          <X className="h-5 w-5 text-red-600 mr-2" />
                          ¿Qué no incluye?
                        </h3>
                        <div className="text-gray-600 whitespace-pre-line">{packageData.whatExcludes}</div>
                      </div>
                    )}

                    {packageData.cancellationPolicy && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                          <Shield className="h-5 w-5 text-blue-600 mr-2" />
                          Política de cancelación
                        </h3>
                        <div className="text-gray-600 whitespace-pre-line">{packageData.cancellationPolicy}</div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'itinerary' && packageData.itinerary && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Itinerario detallado</h3>
                    <div className="text-gray-600 whitespace-pre-line">{packageData.itinerary}</div>
                  </div>
                )}

                {activeTab === 'hotels' && (
                  <div className="space-y-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Hoteles incluidos</h3>
                    {packageData.hotels.map((hotel, index) => (
                      <div key={hotel.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{hotel.name}</h4>
                          {hotel.rating && (
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-yellow-400 fill-current" />
                              <span className="ml-1 text-sm text-gray-600">{hotel.rating}</span>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{hotel.city}</p>
                        <p className="text-sm text-gray-500 mb-2">{hotel.roomType.name}</p>
                        <p className="text-sm text-gray-500">
                          {hotel.nights} noche{hotel.nights > 1 ? 's' : ''} • Día {hotel.checkInDay}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'activities' && (
                  <div className="space-y-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Actividades incluidas</h3>
                    {packageData.activities.map((activity, index) => {
                      const difficultyInfo = getDifficultyInfo(activity.difficultyLevel || 'moderate')
                      return (
                        <div key={activity.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{activity.name}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyInfo.color}`}>
                              {difficultyInfo.label}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              Día {activity.dayNumber}
                            </div>
                            {activity.durationHours && (
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {formatDuration(activity.durationHours)}
                              </div>
                            )}
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {activity.location}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar de reserva */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {formatPrice(packageData.basePrice, packageData.pricePerCouple, packageData.currency)}
                  </div>
                  <p className="text-gray-600">por persona</p>
                </div>

                {/* Información del paquete */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Duración</span>
                    <span className="font-medium">{packageData.totalDuration}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Participantes</span>
                    <span className="font-medium">{packageData.participants}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Hoteles</span>
                    <span className="font-medium">{packageData.hotels.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Actividades</span>
                    <span className="font-medium">{packageData.activities.length}</span>
                  </div>
                </div>



                {/* Botón de reserva principal */}
                <Button 
                  className="w-full" 
                  size="lg" 
                  onClick={() => {
                    console.log('🔍 Button clicked')
                    handleReserve()
                  }}
                >
                  <Calendar className="h-5 w-5 mr-2" />
                  Reservar Paquete
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
      {showBookingForm && packageData && (
        <PublicPackageBookingForm
          packageData={packageData}
          onClose={() => setShowBookingForm(false)}
          onSuccess={handleBookingSuccess}
        />
      )}
    </PublicLayout>
  )
}





