'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Calendar, 
  Users, 
  Clock, 
  MapPin, 
  Star, 
  Package,
  Hotel,
  Plane,
  ArrowLeft,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { PackageBookingForm } from '@/components/forms/package-booking-form'
import Link from 'next/link'
import Image from 'next/image'

interface PackageImage {
  id: string
  imageUrl: string
  altText: string
  isPrimary: boolean
  displayOrder: number
}

interface PackageSession {
  id: string
  startTs: string
  endTs: string
  capacity: number
  priceOverride?: number
  isActive: boolean
}

interface PackageHotel {
  id: string
  hotel: {
    id: string
    name: string
    city: string
  }
  roomType: {
    id: string
    name: string
  }
  nights: number
  checkInDay: number
}

interface PackageActivity {
  id: string
  activity: {
    id: string
    name: string
    durationHours: number
  }
  dayNumber: number
  participantsIncluded: number
}

interface PackageData {
  id: string
  name: string
  description: string
  shortDescription: string
  durationDays: number
  durationNights: number
  minParticipants: number
  maxParticipants?: number
  basePrice: number
  pricePerCouple?: number
  currency: string
  capacity?: number
  whatIncludes: string[]
  whatExcludes: string[]
  itinerary: string
  cancellationPolicy: string
  isActive: boolean
  images: PackageImage[]
  sessions: PackageSession[]
  hotels: PackageHotel[]
  activities: PackageActivity[]
  totalDuration: string
  priceRange: string
  participants: string
}

export default function PackageDetailPage() {
  const params = useParams()
  const [packageData, setPackageData] = useState<PackageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
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
    if (!packageData) return
    setShowBookingForm(true)
  }

  const handleBookingSuccess = (reservationId: string) => {
    setShowBookingForm(false)
    alert(`¡Reservación confirmada! Número: ${reservationId}`)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const nextImage = () => {
    if (packageData && packageData.images.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === packageData.images.length - 1 ? 0 : prev + 1
      )
    }
  }

  const prevImage = () => {
    if (packageData && packageData.images.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? packageData.images.length - 1 : prev - 1
      )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-antigua-purple mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando paquete...</p>
        </div>
      </div>
    )
  }

  if (error || !packageData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600 mb-4">{error || 'Paquete no encontrado'}</p>
          <Link href="/packages">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a Paquetes
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con navegación */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
            <Link href="/" className="hover:text-antigua-purple">Inicio</Link>
            <span>/</span>
            <Link href="/packages" className="hover:text-antigua-purple">Paquetes</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{packageData.name}</span>
          </nav>
          
          <Link href="/packages" className="inline-flex items-center gap-2 text-antigua-purple hover:text-antigua-purple-dark transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Volver a Paquetes
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contenido principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Galería de imágenes */}
            <Card>
              <CardContent className="p-0">
                <div className="relative">
                  <div className="aspect-video relative overflow-hidden rounded-t-lg">
                    <Image
                      src={packageData.images[currentImageIndex]?.imageUrl || '/placeholder-package.jpg'}
                      alt={packageData.images[currentImageIndex]?.altText || packageData.name}
                      fill
                      className="object-cover"
                    />
                    {packageData.images.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                        >
                          <ArrowLeft className="h-4 w-4" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                        >
                          <ArrowLeft className="h-4 w-4 rotate-180" />
                        </button>
                      </>
                    )}
                  </div>
                  
                  {packageData.images.length > 1 && (
                    <div className="flex justify-center space-x-2 p-4">
                      {packageData.images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            index === currentImageIndex ? 'bg-antigua-purple' : 'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Información del paquete */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                      {packageData.name}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{packageData.totalDuration}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{packageData.participants}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Disponible
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {packageData.description}
                </p>
              </CardContent>
            </Card>

            {/* Tabs de información detallada */}
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Resumen</TabsTrigger>
                <TabsTrigger value="itinerary">Itinerario</TabsTrigger>
                <TabsTrigger value="hotels">Hoteles</TabsTrigger>
                <TabsTrigger value="activities">Actividades</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>¿Qué incluye?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {packageData.whatIncludes.map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>¿Qué no incluye?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {packageData.whatExcludes.map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Política de Cancelación</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{packageData.cancellationPolicy}</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="itinerary">
                <Card>
                  <CardHeader>
                    <CardTitle>Itinerario Detallado</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none">
                      <div dangerouslySetInnerHTML={{ __html: packageData.itinerary }} />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="hotels">
                <Card>
                  <CardHeader>
                    <CardTitle>Hoteles Incluidos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {packageData.hotels.map((hotel) => (
                        <div key={hotel.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold text-gray-900">{hotel.hotel.name}</h4>
                              <p className="text-sm text-gray-600 flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {hotel.hotel.city}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                {hotel.roomType.name} • {hotel.nights} noche{hotel.nights !== 1 ? 's' : ''}
                              </p>
                            </div>
                            <Badge variant="outline">
                              Día {hotel.checkInDay}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="activities">
                <Card>
                  <CardHeader>
                    <CardTitle>Actividades Incluidas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {packageData.activities.map((activity) => (
                        <div key={activity.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold text-gray-900">{activity.activity.name}</h4>
                              <p className="text-sm text-gray-600 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {activity.activity.durationHours}h
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                {activity.participantsIncluded} participante{activity.participantsIncluded !== 1 ? 's' : ''} incluido{activity.participantsIncluded !== 1 ? 's' : ''}
                              </p>
                            </div>
                            <Badge variant="outline">
                              Día {activity.dayNumber}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar de reservación */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <div className="text-center">
                  <div className="text-3xl font-bold text-antigua-purple mb-2">
                    {packageData.priceRange}
                  </div>
                  <p className="text-gray-600">por persona</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duración:</span>
                    <span className="font-medium">{packageData.totalDuration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Participantes:</span>
                    <span className="font-medium">{packageData.participants}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hoteles:</span>
                    <span className="font-medium">{packageData.hotels.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Actividades:</span>
                    <span className="font-medium">{packageData.activities.length}</span>
                  </div>
                </div>

                <Button 
                  onClick={handleReserve}
                  className="w-full bg-antigua-purple hover:bg-antigua-purple-dark text-white py-3 text-lg font-semibold"
                >
                  <Calendar className="mr-2 h-5 w-5" />
                  Reservar Paquete
                </Button>

                <div className="text-xs text-gray-500 text-center">
                  Reservación instantánea • Cancelación gratuita
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modal de reservación */}
      {showBookingForm && packageData && (
        <PackageBookingForm
          packageData={packageData}
          onClose={() => setShowBookingForm(false)}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  )
}

