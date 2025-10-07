'use client'

import PublicLayout from '@/components/layout/public-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  MapPin, 
  Star, 
  Users, 
  Wifi, 
  Car, 
  Coffee, 
  Dumbbell, 
  Waves,
  Phone,
  Mail,
  Globe,
  ArrowRight,
  ChevronDown,
  Bed,
  DollarSign,
  Calendar,
  User,
  UserPlus,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useParams } from 'next/navigation'

// Interface para las habitaciones basada en la API del admin
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
    bedConfiguration?: string
    description?: string
    imageUrl?: string
  }
}

// Interface para el hotel basada en la API del admin
interface Hotel {
  id: string
  name: string
  brand?: string
  description?: string
  city: string
  address: string
  phone?: string
  email?: string
  website?: string
  rating?: number
  logoUrl?: string
  checkInTime?: string
  checkOutTime?: string
  isActive: boolean
  roomTypes: Array<{
    id: string
    name: string
    baseRate: string
    occupancy: number
    isActive: boolean
  }>
  _count: {
    rooms: number
    roomTypes: number
  }
  amenities?: string[]
}

export default function HotelDetailsPage() {
  const { t } = useLanguage()
  const params = useParams()
  const hotelId = params.id as string

  const [hotel, setHotel] = useState<Hotel | null>(null)
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    guests: 1,
    minPrice: 0,
    maxPrice: 1000,
    amenities: [] as string[]
  })
  const [showFilters, setShowFilters] = useState(false)

  // Amenidades específicas de habitación - obtener dinámicamente
  const [availableAmenities, setAvailableAmenities] = useState<Array<{
    id: string
    name: string
    icon: string
    category: string
  }>>([])

  // Cargar amenidades disponibles
  useEffect(() => {
    const fetchAmenities = async () => {
      try {
        const response = await fetch('/api/amenities?category=ROOM')
        if (response.ok) {
          const data = await response.json()
          setAvailableAmenities(data.amenities || [])
        }
      } catch (error) {
        console.error('Error fetching amenities:', error)
      }
    }
    fetchAmenities()
  }, [])

  // Cargar datos del hotel y habitaciones
  useEffect(() => {
    const loadHotelData = async () => {
      try {
        // Cargar lista de hoteles para encontrar el hotel específico
        const hotelsResponse = await fetch('/api/hotels?active=true&limit=100')
        if (hotelsResponse.ok) {
          const hotelsData = await hotelsResponse.json()
          const hotels = hotelsData.hotels || []
          const foundHotel = hotels.find((h: any) => h.id === hotelId)
          
          if (foundHotel) {
            setHotel(foundHotel)
          }
        }

        // Cargar habitaciones desde la API del admin
        const roomsResponse = await fetch(`/api/hotels/${hotelId}/rooms`)
        if (roomsResponse.ok) {
          const roomsData = await roomsResponse.json()
          setRooms(roomsData)
        }
      } catch (error) {
        console.error('Error loading hotel data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (hotelId) {
      loadHotelData()
    }
  }, [hotelId])

  // Filtrar habitaciones
  const filteredRooms = rooms.filter(room => {
    const matchesGuests = room.roomType.occupancy >= filters.guests
    const roomPrice = parseFloat(room.roomType.baseRate)
    const matchesMinPrice = roomPrice >= filters.minPrice
    const matchesMaxPrice = roomPrice <= filters.maxPrice
    const matchesAmenities = filters.amenities.length === 0 || 
                            (room.amenities && filters.amenities.every(amenityId => 
                              room.amenities!.some(amenity => amenity.id === amenityId)
                            ))
    
    return matchesGuests && matchesMinPrice && matchesMaxPrice && matchesAmenities && room.isActive
  })

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

  if (loading) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-antigua-purple mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando información del hotel...</p>
          </div>
        </div>
      </PublicLayout>
    )
  }

  if (!hotel) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('hotels.hotel_not_found')}</h1>
            <Link href="/hotels">
              <Button>{t('hotels.back_to_hotels')}</Button>
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
        <Link href="/hotels" className="inline-flex items-center gap-2 text-antigua-purple hover:text-antigua-purple-dark transition-colors">
          <ArrowLeft className="h-4 w-4" />
          {t('hotels.back_to_hotels')}
        </Link>
      </div>

      {/* Hotel Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-antigua-purple via-purple-600 to-antigua-pink">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="relative z-10 container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Hotel Info */}
            <div className="text-white">
              <div className="flex items-center gap-2 mb-4">
                {hotel.rating && (
                  <>
                    <Star className="h-6 w-6 text-yellow-400 fill-current" />
                    <span className="text-xl font-semibold">{hotel.rating}</span>
                  </>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">{hotel.name}</h1>
              {hotel.brand && (
                <p className="text-lg text-gray-200 mb-2">{hotel.brand}</p>
              )}
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-5 w-5 text-antigua-yellow" />
                <span className="text-lg">{hotel.city}</span>
              </div>
              <p className="text-lg text-gray-200 mb-8 leading-relaxed">{hotel.description}</p>
              
              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {hotel.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-antigua-yellow" />
                    <span>{hotel.phone}</span>
                  </div>
                )}
                {hotel.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-antigua-yellow" />
                    <span>{hotel.email}</span>
                  </div>
                )}
                {hotel.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-antigua-yellow" />
                    <a href={hotel.website} className="hover:underline" target="_blank" rel="noopener noreferrer">
                      Sitio Web
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-antigua-yellow" />
                  <span>{t('hotels.check_in')}: {formatTime(hotel.checkInTime)} | {t('hotels.check_out')}: {formatTime(hotel.checkOutTime)}</span>
                </div>
              </div>
            </div>

            {/* Hotel Image */}
            <div className="relative h-96 lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src={hotel.logoUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=500&fit=crop'}
                alt={hotel.name}
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Hotel Amenities */}
      {hotel.amenities && hotel.amenities.length > 0 && (
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">{t('hotels.amenities_title')}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {hotel.amenities.map((amenity) => {
                const IconComponent = getAmenityIcon(amenity)
                return (
                  <div key={amenity} className="flex flex-col items-center p-4 bg-gray-50 rounded-xl hover:bg-purple-50 transition-colors">
                    <IconComponent className="h-8 w-8 text-antigua-purple mb-2" />
                    <span className="text-sm text-gray-700 text-center">{getAmenityLabel(amenity)}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Rooms Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <div className="lg:w-1/4">
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">{t('hotels.filter_rooms')}</h3>
                
                {/* Guests Filter */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('hotels.guests')}
                  </label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFilters(prev => ({ ...prev, guests: Math.max(1, prev.guests - 1) }))}
                    >
                      -
                    </Button>
                    <span className="px-3 py-1 bg-gray-100 rounded-md min-w-[3rem] text-center">
                      {filters.guests}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFilters(prev => ({ ...prev, guests: prev.guests + 1 }))}
                    >
                      +
                    </Button>
                  </div>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('hotels.price_range_usd')}
                  </label>
                  <div className="space-y-3">
                    <Input
                      type="number"
                      placeholder={t('hotels.min_price_label')}
                      value={filters.minPrice}
                      onChange={(e) => setFilters(prev => ({ ...prev, minPrice: Number(e.target.value) }))}
                    />
                    <Input
                      type="number"
                      placeholder={t('hotels.max_price_label')}
                      value={filters.maxPrice}
                      onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: Number(e.target.value) }))}
                    />
                  </div>
                </div>

                {/* Amenities */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('hotels.amenities')}
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {availableAmenities.map((amenity) => {
                      const IconComponent = getAmenityIcon(amenity.icon)
                      return (
                        <label key={amenity.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                          <input
                            type="checkbox"
                            checked={filters.amenities.includes(amenity.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFilters(prev => ({ ...prev, amenities: [...prev.amenities, amenity.id] }))
                              } else {
                                setFilters(prev => ({ ...prev, amenities: prev.amenities.filter(id => id !== amenity.id) }))
                              }
                            }}
                            className="rounded border-gray-300 text-antigua-purple focus:ring-antigua-purple"
                          />
                          <IconComponent className="h-4 w-4 text-antigua-purple" />
                          <span className="text-sm text-gray-700">{amenity.name}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>

                {/* Clear Filters */}
                <Button
                  variant="outline"
                  onClick={() => setFilters({ guests: 1, minPrice: 0, maxPrice: 1000, amenities: [] })}
                  className="w-full"
                >
                  {t('hotels.clear_filters')}
                </Button>
              </div>
            </div>

            {/* Rooms Grid */}
            <div className="lg:w-3/4">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900">
                  {t('hotels.rooms_title')}
                </h2>
                <span className="text-gray-600">
                  {filteredRooms.length} {filteredRooms.length === 1 ? t('hotels.room_found') : t('hotels.rooms_found')}
                </span>
              </div>

              {filteredRooms.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
                  <div className="text-gray-400 mb-4">
                    <Bed className="h-16 w-16 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">{t('hotels.no_rooms')}</h3>
                    <p className="text-gray-600">{t('hotels.no_rooms_desc')}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredRooms.map((room) => (
                    <div key={room.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
                        {/* Room Image */}
                        <div className="relative h-64 lg:h-full rounded-xl overflow-hidden">
                          <Image
                            src={room.roomType.imageUrl || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=300&fit=crop'}
                            alt={room.roomType.name}
                            fill
                            className="object-cover"
                          />
                        </div>

                        {/* Room Info */}
                        <div className="lg:col-span-2">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-xl font-bold text-gray-900 mb-2">
                                {room.roomType.name}
                              </h3>
                              <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                <div className="flex items-center gap-1">
                                  <User className="h-4 w-4" />
                                  <span>{t('hotels.room_number')} {room.code}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Users className="h-4 w-4" />
                                  <span>{t('hotels.max_occupancy')} {room.roomType.occupancy} {t('hotels.people')}</span>
                                </div>
                                {room.floorNumber && (
                                  <div className="flex items-center gap-1">
                                    <Bed className="h-4 w-4" />
                                    <span>{t('hotels.floor')} {room.floorNumber}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-antigua-purple">
                                ${parseFloat(room.roomType.baseRate)}
                              </div>
                              <div className="text-sm text-gray-600">
                                {t('hotels.per_night')}
                              </div>
                            </div>
                          </div>

                          {room.roomType.description && (
                            <p className="text-gray-600 mb-4 line-clamp-2">
                              {room.roomType.description}
                            </p>
                          )}

                          {/* Room Amenities */}
                          {room.amenities && room.amenities.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-6">
                              {room.amenities.slice(0, 6).map((amenity) => {
                                const IconComponent = getAmenityIcon(amenity.icon)
                                return (
                                  <div key={amenity.id} className="flex items-center gap-1 bg-purple-50 px-2 py-1 rounded-lg text-xs text-antigua-purple">
                                    <IconComponent className="h-3 w-3" />
                                    <span>{amenity.name}</span>
                                  </div>
                                )
                              })}
                              {room.amenities.length > 6 && (
                                <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-lg text-xs text-gray-600">
                                  <span>+{room.amenities.length - 6} más</span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex gap-3">
                            <Button className="flex-1 bg-antigua-purple hover:bg-antigua-purple-dark text-white">
                              <Calendar className="mr-2 h-4 w-4" />
                              {t('hotels.book_now')}
                            </Button>
                            <Button variant="outline" className="px-6">
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}