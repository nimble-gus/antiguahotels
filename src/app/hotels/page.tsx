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
  Search,
  Filter,
  ArrowRight,
  ChevronDown,
  Phone,
  Mail,
  Globe
} from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import { useState, useEffect } from 'react'
import Image from 'next/image'

// Interface para los hoteles basada en la API del admin
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
  images?: Array<{
    id: string
    imageUrl: string
    cloudinaryPublicId?: string
    altText?: string
    isPrimary: boolean
    displayOrder: number
  }>
}

// Interface para las amenidades con iconos
interface Amenity {
  name: string
  icon: any
  label: string
}

export default function HotelsPage() {
  const { t } = useLanguage()
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 })
  const [showFilters, setShowFilters] = useState(false)

  // Amenidades disponibles con iconos
  const availableAmenities: Amenity[] = [
    { name: 'wifi', icon: Wifi, label: 'WiFi Gratis' },
    { name: 'parking', icon: Car, label: 'Estacionamiento' },
    { name: 'breakfast', icon: Coffee, label: 'Desayuno' },
    { name: 'gym', icon: Dumbbell, label: 'Gimnasio' },
    { name: 'pool', icon: Waves, label: 'Piscina' },
    { name: 'spa', icon: Star, label: 'Spa' },
    { name: 'restaurant', icon: Coffee, label: 'Restaurante' },
    { name: 'bar', icon: Coffee, label: 'Bar' }
  ]

  // Cargar hoteles usando la API del admin
  useEffect(() => {
    const loadHotels = async () => {
      try {
        const response = await fetch('/api/hotels?active=true&limit=50')
        if (response.ok) {
          const data = await response.json()
          setHotels(data.hotels || [])
        }
      } catch (error) {
        console.error('Error loading hotels:', error)
      } finally {
        setLoading(false)
      }
    }
    loadHotels()
  }, [])

  // Filtrar hoteles
  const filteredHotels = hotels.filter(hotel => {
    const matchesSearch = hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hotel.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (hotel.description && hotel.description.toLowerCase().includes(searchTerm.toLowerCase()))
    
    // Calcular rango de precios del hotel
    const prices = hotel.roomTypes.map(rt => parseFloat(rt.baseRate))
    const hotelMinPrice = prices.length > 0 ? Math.min(...prices) : 0
    const hotelMaxPrice = prices.length > 0 ? Math.max(...prices) : 0
    
    const matchesPrice = hotelMinPrice >= priceRange.min && hotelMaxPrice <= priceRange.max
    
    const matchesAmenities = selectedAmenities.length === 0 || 
                            (hotel.amenities && selectedAmenities.every(amenity => hotel.amenities!.includes(amenity)))
    
    return matchesSearch && matchesPrice && matchesAmenities && hotel.isActive
  })

  // Obtener amenidad por nombre
  const getAmenityIcon = (amenityName: string) => {
    const amenity = availableAmenities.find(a => a.name === amenityName)
    return amenity?.icon || Star
  }

  // Obtener label de amenidad
  const getAmenityLabel = (amenityName: string) => {
    const amenity = availableAmenities.find(a => a.name === amenityName)
    return amenity?.label || amenityName
  }

  // Formatear tiempo de check-in/check-out
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
            <p className="text-gray-600">Cargando hoteles...</p>
          </div>
        </div>
      </PublicLayout>
    )
  }

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-antigua-purple via-purple-600 to-antigua-pink">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            {t('hotels.title')}
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            {t('hotels.subtitle')}
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder={t('hotels.search_placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-4 text-lg bg-white/90 backdrop-blur-sm border-0 rounded-2xl shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                {t('hotels.filters')}
                <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </Button>
              
              <span className="text-gray-600">
                {filteredHotels.length} {filteredHotels.length === 1 ? t('hotels.found_results') : t('hotels.found_results_plural')}
              </span>
            </div>

            {/* Price Range */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{t('hotels.price_range')}</span>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder={t('hotels.min_price')}
                  value={priceRange.min}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                  className="w-20"
                />
                <span className="text-gray-400">-</span>
                <Input
                  type="number"
                  placeholder={t('hotels.max_price')}
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                  className="w-20"
                />
                <span className="text-sm text-gray-600">USD</span>
              </div>
            </div>
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {availableAmenities.map((amenity) => (
                  <button
                    key={amenity.name}
                    onClick={() => {
                      if (selectedAmenities.includes(amenity.name)) {
                        setSelectedAmenities(prev => prev.filter(a => a !== amenity.name))
                      } else {
                        setSelectedAmenities(prev => [...prev, amenity.name])
                      }
                    }}
                    className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all duration-200 ${
                      selectedAmenities.includes(amenity.name)
                        ? 'border-antigua-purple bg-purple-50 text-antigua-purple'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    <amenity.icon className="h-6 w-6 mb-2" />
                    <span className="text-xs text-center">{amenity.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Hotels Grid */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          {filteredHotels.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-gray-400 mb-4">
                <Search className="h-16 w-16 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">{t('hotels.no_results')}</h3>
                <p className="text-gray-600">{t('hotels.no_results_desc')}</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredHotels.map((hotel) => {
                // Calcular rango de precios
                const prices = hotel.roomTypes.map(rt => parseFloat(rt.baseRate))
                const minPrice = prices.length > 0 ? Math.min(...prices) : 0
                const maxPrice = prices.length > 0 ? Math.max(...prices) : 0

                return (
                  <Link key={hotel.id} href={`/hotels/${hotel.id}`}>
                    <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:scale-105">
                      {/* Hotel Image */}
                      <div className="relative h-64 overflow-hidden">
                        <Image
                          src={
                            hotel.images && hotel.images.length > 0 
                              ? hotel.images.find(img => img.isPrimary)?.imageUrl || hotel.images[0].imageUrl
                              : hotel.logoUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&h=300&fit=crop'
                          }
                          alt={hotel.images && hotel.images.length > 0 
                            ? hotel.images.find(img => img.isPrimary)?.altText || hotel.name
                            : hotel.name
                          }
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-gray-900">
                          ${minPrice} - ${maxPrice}
                        </div>
                        {hotel.rating && (
                          <div className="absolute bottom-4 left-4 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-sm">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="font-semibold text-gray-900">{hotel.rating}</span>
                          </div>
                        )}
                      </div>

                      {/* Hotel Info */}
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-antigua-purple transition-colors">
                              {hotel.name}
                            </h3>
                            {hotel.brand && (
                              <p className="text-sm text-gray-500">{hotel.brand}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-gray-600 mb-3">
                          <MapPin className="h-4 w-4 text-antigua-purple" />
                          <span className="text-sm">{hotel.city}</span>
                        </div>

                        {hotel.description && (
                          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                            {hotel.description}
                          </p>
                        )}

                        {/* Contact Info */}
                        <div className="space-y-2 mb-4">
                          {hotel.phone && (
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Phone className="h-3 w-3" />
                              <span>{hotel.phone}</span>
                            </div>
                          )}
                          {hotel.email && (
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Mail className="h-3 w-3" />
                              <span>{hotel.email}</span>
                            </div>
                          )}
                          {hotel.website && (
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Globe className="h-3 w-3" />
                              <span>Sitio Web</span>
                            </div>
                          )}
                        </div>

                        {/* Room Count & Check Times */}
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{hotel._count.rooms} {t('hotels.rooms_count')}</span>
                          </div>
                          <div className="text-xs">
                            {t('hotels.check_in')}: {formatTime(hotel.checkInTime)} | {t('hotels.check_out')}: {formatTime(hotel.checkOutTime)}
                          </div>
                        </div>

                        {/* Amenities */}
                        {hotel.amenities && hotel.amenities.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {hotel.amenities.slice(0, 4).map((amenity) => {
                              const IconComponent = getAmenityIcon(amenity)
                              return (
                                <div key={amenity} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-lg text-xs text-gray-600">
                                  <IconComponent className="h-3 w-3" />
                                  <span>{getAmenityLabel(amenity)}</span>
                                </div>
                              )
                            })}
                            {hotel.amenities.length > 4 && (
                              <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-lg text-xs text-gray-600">
                                <span>+{hotel.amenities.length - 4} más</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* View Rooms Button */}
                        <Link href="/accommodations" className="block">
                          <Button className="w-full bg-antigua-purple hover:bg-antigua-purple-dark text-white group-hover:bg-antigua-purple-dark transition-all duration-300">
                            {t('hotels.view_rooms')}
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  )
}