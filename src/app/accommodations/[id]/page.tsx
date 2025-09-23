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
  roomType: {
    id: string
    name: string
    baseRate: string
    occupancy: number
    bedConfiguration?: string
    description?: string
    amenities?: string[]
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
    adults: 2,
    children: 0
  })

  // Cargar datos de la habitación usando la API del admin
  useEffect(() => {
    const loadRoomData = async () => {
      try {
        // Usar la API del admin para obtener la habitación específica
        const roomResponse = await fetch(`/api/rooms/${roomId}`)
        if (roomResponse.ok) {
          const roomData = await roomResponse.json()
          
          // Obtener información completa del hotel
          const hotelResponse = await fetch(`/api/hotels/${roomData.hotelId}`)
          if (hotelResponse.ok) {
            const hotelData = await hotelResponse.json()
            
            setRoom({
              ...roomData,
              hotel: {
                id: hotelData.id,
                name: hotelData.name,
                city: hotelData.city,
                address: hotelData.address,
                phone: hotelData.phone,
                email: hotelData.email,
                logoUrl: hotelData.logoUrl,
                checkInTime: hotelData.checkInTime,
                checkOutTime: hotelData.checkOutTime
              }
            })
          }
        }
      } catch (error) {
        console.error('Error loading room data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (roomId) {
      loadRoomData()
    }
  }, [roomId])

  // Obtener icono de amenidad específica de habitación
  const getAmenityIcon = (amenity: string) => {
    const icons: { [key: string]: any } = {
      ac: Star,
      tv: Star,
      minibar: Star,
      safe: Star,
      balcony: Star,
      ocean_view: Star,
      city_view: Star,
      bathtub: Star,
      kitchenette: Star
    }
    return icons[amenity] || Star
  }

  // Obtener label de amenidad específica de habitación
  const getAmenityLabel = (amenity: string) => {
    const labels: { [key: string]: string } = {
      ac: 'Aire Acondicionado',
      tv: 'TV',
      minibar: 'Minibar',
      safe: 'Caja Fuerte',
      balcony: 'Balcón',
      ocean_view: 'Vista al Mar',
      city_view: 'Vista a la Ciudad',
      bathtub: 'Bañera',
      kitchenette: 'Kitchenette'
    }
    return labels[amenity] || amenity
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
      {/* Back Button */}
      <div className="container mx-auto px-4 pt-8">
        <Link href="/accommodations" className="inline-flex items-center gap-2 text-antigua-purple hover:text-antigua-purple-dark transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Volver a Habitaciones
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
                  <div className="text-3xl font-bold text-antigua-purple">
                    ${parseFloat(room.roomType.baseRate)}
                  </div>
                  <div className="text-gray-600">por noche</div>
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-antigua-purple focus:border-transparent"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-antigua-purple focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Guests */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Huéspedes
                    </label>
                    <div className="flex items-center justify-between p-3 border border-gray-300 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span className="text-sm">Adultos: {guests.adults}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span className="text-sm">Niños: {guests.children}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Button className="w-full bg-antigua-purple hover:bg-antigua-purple-dark text-white py-3 text-lg font-semibold mb-4">
                  <Calendar className="mr-2 h-5 w-5" />
                  Reservar Ahora
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
                {room.roomType.amenities && room.roomType.amenities.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Amenidades</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {room.roomType.amenities.map((amenity) => {
                        const IconComponent = getAmenityIcon(amenity)
                        return (
                          <div key={amenity} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <IconComponent className="h-5 w-5 text-antigua-purple" />
                            <span className="text-gray-700">{getAmenityLabel(amenity)}</span>
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
    </PublicLayout>
  )
}