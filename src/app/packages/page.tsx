'use client'

import PublicLayout from '@/components/layout/public-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  Users, 
  Star,
  Calendar,
  ArrowRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  Bed,
  Plane
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import { useState, useEffect, useMemo } from 'react'

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
  images: {
    id: string
    imageUrl: string
    altText: string
    isPrimary: boolean
  }[]
  totalDuration: string
  priceRange: string
  participants: string
}

interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

interface PackagesResponse {
  packages: Package[]
  pagination: PaginationInfo
}

const durationRanges = [
  { value: '', label: 'Cualquier duración' },
  { value: '1-2', label: '1-2 días' },
  { value: '3-4', label: '3-4 días' },
  { value: '5-7', label: '5-7 días' },
  { value: '8+', label: '8+ días' }
]

const participantRanges = [
  { value: '', label: 'Cualquier grupo' },
  { value: '1-2', label: '1-2 personas' },
  { value: '3-5', label: '3-5 personas' },
  { value: '6-10', label: '6-10 personas' },
  { value: '10+', label: '10+ personas' }
]

const priceRanges = [
  { value: '', label: 'Cualquier precio' },
  { value: '0-500', label: 'Hasta $500' },
  { value: '500-1000', label: '$500 - $1,000' },
  { value: '1000-2000', label: '$1,000 - $2,000' },
  { value: '2000+', label: '$2,000+' }
]

export default function PackagesPage() {
  const { t } = useLanguage()
  const [packages, setPackages] = useState<Package[]>([])
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDuration, setSelectedDuration] = useState('')
  const [selectedParticipants, setSelectedParticipants] = useState('')
  const [selectedPrice, setSelectedPrice] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const loadPackages = async (page = 1, search = '', duration = '', participants = '', price = '') => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '9', // 9 paquetes por página (3x3)
        ...(search && { search }),
        ...(duration && { duration }),
        ...(participants && { participants }),
        ...(price && { price })
      })

      const response = await fetch(`/api/public/packages?${params}`)
      if (response.ok) {
        const data: PackagesResponse = await response.json()
        setPackages(data.packages)
        setPagination(data.pagination)
        setCurrentPage(page)
      }
    } catch (error) {
      console.error('Error loading packages:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPackages(1, searchTerm, selectedDuration, selectedParticipants, selectedPrice)
  }, [])

  const handleSearch = () => {
    setCurrentPage(1)
    loadPackages(1, searchTerm, selectedDuration, selectedParticipants, selectedPrice)
  }

  const handleFilterChange = () => {
    setCurrentPage(1)
    loadPackages(1, searchTerm, selectedDuration, selectedParticipants, selectedPrice)
  }

  const handlePageChange = (page: number) => {
    loadPackages(page, searchTerm, selectedDuration, selectedParticipants, selectedPrice)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedDuration('')
    setSelectedParticipants('')
    setSelectedPrice('')
    setCurrentPage(1)
    loadPackages(1, '', '', '', '')
  }

  const formatPrice = (basePrice: number, pricePerCouple: number | null, currency: string) => {
    if (pricePerCouple) {
      return `$${basePrice} - $${pricePerCouple} ${currency}`
    }
    return `$${basePrice} ${currency}`
  }

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {t('packages.title')}
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {t('packages.subtitle')}
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filtros */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Búsqueda */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder={t('packages.searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Botón de filtros móvil */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtros
                {showFilters ? <X className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
              </Button>

              {/* Filtros desktop */}
              <div className="hidden lg:flex gap-4">
                <select
                  value={selectedDuration}
                  onChange={(e) => {
                    setSelectedDuration(e.target.value)
                    handleFilterChange()
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {durationRanges.map(range => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedParticipants}
                  onChange={(e) => {
                    setSelectedParticipants(e.target.value)
                    handleFilterChange()
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {participantRanges.map(range => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedPrice}
                  onChange={(e) => {
                    setSelectedPrice(e.target.value)
                    handleFilterChange()
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {priceRanges.map(range => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>

                <Button onClick={handleSearch}>
                  <Search className="h-4 w-4 mr-2" />
                  Buscar
                </Button>
              </div>
            </div>

            {/* Filtros móviles */}
            {showFilters && (
              <div className="lg:hidden mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duración
                    </label>
                    <select
                      value={selectedDuration}
                      onChange={(e) => setSelectedDuration(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {durationRanges.map(range => (
                        <option key={range.value} value={range.value}>
                          {range.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Participantes
                    </label>
                    <select
                      value={selectedParticipants}
                      onChange={(e) => setSelectedParticipants(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {participantRanges.map(range => (
                        <option key={range.value} value={range.value}>
                          {range.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Precio
                    </label>
                    <select
                      value={selectedPrice}
                      onChange={(e) => setSelectedPrice(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {priceRanges.map(range => (
                        <option key={range.value} value={range.value}>
                          {range.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button onClick={handleFilterChange} className="flex-1">
                    Aplicar Filtros
                  </Button>
                  <Button variant="outline" onClick={clearFilters}>
                    Limpiar
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}

          {/* Grid de paquetes */}
          {!loading && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {packages.map((pkg) => (
                  <div key={pkg.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <div className="relative h-48">
                      <Image
                        src={pkg.images[0]?.imageUrl || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop'}
                        alt={pkg.images[0]?.altText || pkg.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-2 left-2">
                        <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                          Paquete
                        </span>
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-2">
                        {pkg.name}
                      </h3>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {pkg.description}
                      </p>

                      <div className="flex items-center text-sm text-gray-500 mb-4 space-x-4">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {pkg.totalDuration}
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {pkg.participants}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <div className="text-2xl font-bold text-blue-600">
                          {formatPrice(pkg.basePrice, pkg.pricePerCouple, pkg.currency)}
                        </div>
                        {pkg.capacity && (
                          <div className="text-sm text-gray-500">
                            <Bed className="h-4 w-4 inline mr-1" />
                            {pkg.capacity} habitaciones
                          </div>
                        )}
                      </div>

                      <Link href={`/packages/${pkg.id}`}>
                        <Button className="w-full">
                          Ver detalles
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Paginación */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!pagination.hasPrevPage}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </Button>

                  <div className="flex space-x-1">
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          onClick={() => handlePageChange(pageNum)}
                          className="w-10 h-10"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                  >
                    Siguiente
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Información de paginación */}
              {pagination && (
                <div className="text-center text-sm text-gray-500 mt-4">
                  Mostrando {((currentPage - 1) * 9) + 1} - {Math.min(currentPage * 9, pagination.totalItems)} de {pagination.totalItems} paquetes
                </div>
              )}
            </>
          )}

          {/* Sin resultados */}
          {!loading && packages.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No se encontraron paquetes
              </h3>
              <p className="text-gray-500 mb-4">
                Intenta ajustar tus filtros de búsqueda
              </p>
              <Button onClick={clearFilters}>
                Limpiar filtros
              </Button>
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  )
}





