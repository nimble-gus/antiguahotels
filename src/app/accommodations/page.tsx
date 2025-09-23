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
  Bed,
  DollarSign,
  Calendar,
  User,
  SlidersHorizontal,
  X,
  Grid3X3,
  List,
  Heart,
  Eye
} from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import { useState, useEffect } from 'react'
import Image from 'next/image'

// Interface para las habitaciones
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
  }
}

// Interface para los hoteles
interface Hotel {
  id: string
  name: string
  city: string
  logoUrl?: string
}

// Interface para las amenidades
interface Amenity {
  name: string
  icon: any
  label: string
}

export default function AccommodationsPage() {
  const { t } = useLanguage()
  const [rooms, setRooms] = useState<Room[]>([])
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  
  // Filtros
  const [filters, setFilters] = useState({
    search: '',
    selectedHotels: [] as string[],
    guests: 1,
    minPrice: 0,
    maxPrice: 1000,
    amenities: [] as string[],
    sortBy: 'price_asc' as 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc' | 'hotel_asc'
  })

  // Amenidades específicas de habitación (no del hotel)
  const availableAmenities: Amenity[] = [
    { name: 'ac', icon: Star, label: 'Aire Acondicionado' },
    { name: 'tv', icon: Star, label: 'TV' },
    { name: 'minibar', icon: Star, label: 'Minibar' },
    { name: 'safe', icon: Star, label: 'Caja Fuerte' },
    { name: 'balcony', icon: Star, label: 'Balcón' },
    { name: 'ocean_view', icon: Star, label: 'Vista al Mar' },
    { name: 'city_view', icon: Star, label: 'Vista a la Ciudad' },
    { name: 'bathtub', icon: Star, label: 'Bañera' },
    { name: 'kitchenette', icon: Star, label: 'Kitchenette' }
  ]

  // Cargar datos usando las APIs del admin
  useEffect(() => {
    const loadData = async () => {
      try {
        // Cargar hoteles usando la API del admin
        const hotelsResponse = await fetch('/api/hotels?active=true&limit=100')
        if (hotelsResponse.ok) {
          const hotelsData = await hotelsResponse.json()
          setHotels(hotelsData.hotels || [])
          
          // Cargar habitaciones de cada hotel usando la API del admin
          const allRooms: Room[] = []
          const hotels = hotelsData.hotels || []
          
          for (const hotel of hotels) {
            try {
              const roomsResponse = await fetch(`/api/hotels/${hotel.id}/rooms`)
              if (roomsResponse.ok) {
                const roomsData = await roomsResponse.json()
                // Agregar información del hotel a cada habitación
                const roomsWithHotel = roomsData.map((room: any) => ({
                  ...room,
                  hotel: {
                    id: hotel.id,
                    name: hotel.name,
                    city: hotel.city,
                    address: hotel.address,
                    phone: hotel.phone,
                    email: hotel.email,
                    logoUrl: hotel.logoUrl
                  }
                }))
                allRooms.push(...roomsWithHotel)
              }
            } catch (error) {
              console.error(`Error loading rooms for hotel ${hotel.id}:`, error)
            }
          }
          
          setRooms(allRooms)
        }
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Filtrar y ordenar habitaciones
  const filteredAndSortedRooms = rooms
    .filter(room => {
      // Filtro de búsqueda
      const matchesSearch = !filters.search || 
        room.roomType.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        room.hotel.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        room.hotel.city.toLowerCase().includes(filters.search.toLowerCase()) ||
        (room.roomType.description && room.roomType.description.toLowerCase().includes(filters.search.toLowerCase()))
      
      // Filtro de hoteles
      const matchesHotels = filters.selectedHotels.length === 0 || 
        filters.selectedHotels.includes(room.hotel.id)
      
      // Filtro de huéspedes
      const matchesGuests = room.roomType.occupancy >= filters.guests
      
      // Filtro de precio
      const roomPrice = parseFloat(room.roomType.baseRate)
      const matchesPrice = roomPrice >= filters.minPrice && roomPrice <= filters.maxPrice
      
      // Filtro de amenidades
      const matchesAmenities = filters.amenities.length === 0 || 
        (room.roomType.amenities && filters.amenities.every(amenity => room.roomType.amenities!.includes(amenity)))
      
      return matchesSearch && matchesHotels && matchesGuests && matchesPrice && matchesAmenities && room.isActive
    })
    .sort((a, b) => {
      switch (filters.sortBy) {
        case 'price_asc':
          return parseFloat(a.roomType.baseRate) - parseFloat(b.roomType.baseRate)
        case 'price_desc':
          return parseFloat(b.roomType.baseRate) - parseFloat(a.roomType.baseRate)
        case 'name_asc':
          return a.roomType.name.localeCompare(b.roomType.name)
        case 'name_desc':
          return b.roomType.name.localeCompare(a.roomType.name)
        case 'hotel_asc':
          return a.hotel.name.localeCompare(b.hotel.name)
        default:
          return 0
      }
    })

  // Obtener icono de amenidad
  const getAmenityIcon = (amenity: string) => {
    const amenityObj = availableAmenities.find(a => a.name === amenity)
    return amenityObj?.icon || Star
  }

  // Obtener label de amenidad
  const getAmenityLabel = (amenity: string) => {
    const amenityObj = availableAmenities.find(a => a.name === amenity)
    return amenityObj?.label || amenity
  }

  // Limpiar filtros
  const clearFilters = () => {
    setFilters({
      search: '',
      selectedHotels: [],
      guests: 1,
      minPrice: 0,
      maxPrice: 1000,
      amenities: [],
      sortBy: 'price_asc'
    })
  }

  // Contar filtros activos
  const activeFiltersCount = [
    filters.search,
    filters.selectedHotels.length,
    filters.guests > 1,
    filters.minPrice > 0 || filters.maxPrice < 1000,
    filters.amenities.length
  ].filter(Boolean).length

  if (loading) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-antigua-purple mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando habitaciones...</p>
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
            Habitaciones Disponibles
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Encuentra la habitación perfecta para tu estadía en Antigua Guatemala
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Buscar por habitación, hotel o ubicación..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-12 pr-4 py-4 text-lg bg-white/90 backdrop-blur-sm border-0 rounded-2xl shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Filters and Controls */}
      <section className="py-6 bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Left side - Filters */}
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filtros
                {activeFiltersCount > 0 && (
                  <span className="bg-antigua-purple text-white text-xs rounded-full px-2 py-0.5 ml-1">
                    {activeFiltersCount}
                  </span>
                )}
                <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </Button>
              
              <span className="text-gray-600 text-sm">
                {filteredAndSortedRooms.length} habitación{filteredAndSortedRooms.length !== 1 ? 'es' : ''} encontrada{filteredAndSortedRooms.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Right side - Sort and View */}
            <div className="flex items-center gap-4">
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-antigua-purple focus:border-transparent"
              >
                <option value="price_asc">Precio: Menor a Mayor</option>
                <option value="price_desc">Precio: Mayor a Menor</option>
                <option value="name_asc">Nombre: A-Z</option>
                <option value="name_desc">Nombre: Z-A</option>
                <option value="hotel_asc">Hotel: A-Z</option>
              </select>

              <div className="flex items-center gap-2 border border-gray-300 rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="p-2"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="p-2"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Hotels Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hoteles
                  </label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {hotels.map((hotel) => (
                      <label key={hotel.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={filters.selectedHotels.includes(hotel.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFilters(prev => ({ ...prev, selectedHotels: [...prev.selectedHotels, hotel.id] }))
                            } else {
                              setFilters(prev => ({ ...prev, selectedHotels: prev.selectedHotels.filter(id => id !== hotel.id) }))
                            }
                          }}
                          className="rounded border-gray-300 text-antigua-purple focus:ring-antigua-purple"
                        />
                        <span className="text-sm text-gray-700">{hotel.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Guests Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Huéspedes
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rango de Precio (USD)
                  </label>
                  <div className="space-y-2">
                    <Input
                      type="number"
                      placeholder="Mínimo"
                      value={filters.minPrice}
                      onChange={(e) => setFilters(prev => ({ ...prev, minPrice: Number(e.target.value) }))}
                    />
                    <Input
                      type="number"
                      placeholder="Máximo"
                      value={filters.maxPrice}
                      onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: Number(e.target.value) }))}
                    />
                  </div>
                </div>

                {/* Amenities */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amenidades
                  </label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {availableAmenities.map((amenity) => (
                      <label key={amenity.name} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={filters.amenities.includes(amenity.name)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFilters(prev => ({ ...prev, amenities: [...prev.amenities, amenity.name] }))
                            } else {
                              setFilters(prev => ({ ...prev, amenities: prev.amenities.filter(a => a !== amenity.name) }))
                            }
                          }}
                          className="rounded border-gray-300 text-antigua-purple focus:ring-antigua-purple"
                        />
                        <span className="text-sm text-gray-700">{amenity.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Clear Filters Button */}
              {activeFiltersCount > 0 && (
                <div className="mt-4 flex justify-end">
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Limpiar Filtros ({activeFiltersCount})
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Rooms Grid/List */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          {filteredAndSortedRooms.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-gray-400 mb-4">
                <Search className="h-16 w-16 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No se encontraron habitaciones</h3>
                <p className="text-gray-600">Intenta ajustar tus filtros de búsqueda</p>
              </div>
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
              : "space-y-4"
            }>
              {filteredAndSortedRooms.map((room) => (
                <div key={room.id} className={`bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 ${
                  viewMode === 'grid' ? 'transform hover:scale-105' : ''
                }`}>
                  {viewMode === 'grid' ? (
                    // Grid View
                    <>
                      {/* Room Image */}
                      <div className="relative h-48 overflow-hidden">
                        <Image
                          src={room.roomType.imageUrl || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=300&fit=crop'}
                          alt={room.roomType.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute top-3 right-3 flex gap-2">
                          <Button size="sm" variant="secondary" className="p-2 bg-white/90 hover:bg-white">
                            <Heart className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="secondary" className="p-2 bg-white/90 hover:bg-white">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-sm font-semibold">
                          ${parseFloat(room.roomType.baseRate)}
                        </div>
                      </div>

                      {/* Room Info */}
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg line-clamp-1">
                              {room.roomType.name}
                            </h3>
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {room.hotel.name}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{room.roomType.occupancy} personas</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Bed className="h-4 w-4" />
                            <span>Hab. {room.code}</span>
                          </div>
                        </div>

                        {/* Amenities */}
                        {room.roomType.amenities && room.roomType.amenities.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-4">
                            {room.roomType.amenities.slice(0, 3).map((amenity) => {
                              const IconComponent = getAmenityIcon(amenity)
                              return (
                                <div key={amenity} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-lg text-xs">
                                  <IconComponent className="h-3 w-3" />
                                </div>
                              )
                            })}
                            {room.roomType.amenities.length > 3 && (
                              <div className="bg-gray-100 px-2 py-1 rounded-lg text-xs text-gray-600">
                                +{room.roomType.amenities.length - 3}
                              </div>
                            )}
                          </div>
                        )}

                        <Link href={`/accommodations/${room.id}`} className="block">
                          <Button className="w-full bg-antigua-purple hover:bg-antigua-purple-dark text-white">
                            Ver Detalles
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </>
                  ) : (
                    // List View
                    <div className="flex">
                      <div className="relative w-64 h-48 overflow-hidden">
                        <Image
                          src={room.roomType.imageUrl || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=300&fit=crop'}
                          alt={room.roomType.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                              {room.roomType.name}
                            </h3>
                            <p className="text-gray-600 flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              {room.hotel.name} - {room.hotel.city}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-antigua-purple">
                              ${parseFloat(room.roomType.baseRate)}
                            </div>
                            <div className="text-sm text-gray-600">por noche</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>Máx. {room.roomType.occupancy} personas</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Bed className="h-4 w-4" />
                            <span>Habitación {room.code}</span>
                          </div>
                          {room.floorNumber && (
                            <div className="flex items-center gap-1">
                              <span>Piso {room.floorNumber}</span>
                            </div>
                          )}
                        </div>

                        {room.roomType.description && (
                          <p className="text-gray-600 mb-4 line-clamp-2">
                            {room.roomType.description}
                          </p>
                        )}

                        <div className="flex justify-between items-center">
                          <div className="flex flex-wrap gap-2">
                            {room.roomType.amenities && room.roomType.amenities.slice(0, 5).map((amenity) => {
                              const IconComponent = getAmenityIcon(amenity)
                              return (
                                <div key={amenity} className="flex items-center gap-1 bg-purple-50 px-2 py-1 rounded-lg text-xs text-antigua-purple">
                                  <IconComponent className="h-3 w-3" />
                                  <span>{getAmenityLabel(amenity)}</span>
                                </div>
                              )
                            })}
                            {room.roomType.amenities && room.roomType.amenities.length > 5 && (
                              <div className="bg-gray-100 px-2 py-1 rounded-lg text-xs text-gray-600">
                                +{room.roomType.amenities.length - 5} más
                              </div>
                            )}
                          </div>
                          <Link href={`/accommodations/${room.id}`}>
                            <Button className="bg-antigua-purple hover:bg-antigua-purple-dark text-white">
                              Ver Detalles
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  )
}