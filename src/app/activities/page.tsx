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
  X
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import { useState, useEffect, useMemo } from 'react'

interface Activity {
  id: string
  name: string
  description: string
  basePrice: number
  currency: string
  duration: number
  minParticipants: number
  maxParticipants: number
  location: string
  difficulty: string
  category: string
  isActive: boolean
  isFeatured: boolean
  images: {
    id: string
    imageUrl: string
    altText: string
    isPrimary: boolean
  }[]
  schedules: {
    id: string
    startTime: string
    endTime: string
    availableSpots: number
    totalSpots: number
  }[]
}

interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

interface ActivitiesResponse {
  activities: Activity[]
  pagination: PaginationInfo
}

const difficultyLevels = [
  { value: '', label: 'Todas las dificultades' },
  { value: 'easy', label: 'Fácil' },
  { value: 'moderate', label: 'Moderado' },
  { value: 'challenging', label: 'Difícil' },
  { value: 'extreme', label: 'Extremo' }
]

const participantRanges = [
  { value: '', label: 'Cualquier grupo' },
  { value: '1-2', label: '1-2 personas' },
  { value: '3-5', label: '3-5 personas' },
  { value: '6-10', label: '6-10 personas' },
  { value: '10+', label: '10+ personas' }
]

export default function ActivitiesPage() {
  const { t } = useLanguage()
  const [activities, setActivities] = useState<Activity[]>([])
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState('')
  const [selectedParticipants, setSelectedParticipants] = useState('')
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 })
  const [showFilters, setShowFilters] = useState(false)

  const loadActivities = async (page = 1, search = '', difficulty = '', participants = '', minPrice = 0, maxPrice = 1000) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '9', // 9 actividades por página (3x3)
        ...(search && { search }),
        ...(difficulty && { difficulty }),
        ...(minPrice > 0 && { minPrice: minPrice.toString() }),
        ...(maxPrice < 1000 && { maxPrice: maxPrice.toString() })
      })

      const response = await fetch(`/api/public/activities?${params}`)
      if (response.ok) {
        const data: ActivitiesResponse = await response.json()
        setActivities(data.activities)
        setPagination(data.pagination)
        setCurrentPage(page)
      }
    } catch (error) {
      console.error('Error loading activities:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadActivities(1, searchTerm, selectedDifficulty, selectedParticipants, priceRange.min, priceRange.max)
  }, [])

  const handleSearch = () => {
    setCurrentPage(1)
    loadActivities(1, searchTerm, selectedDifficulty, selectedParticipants, priceRange.min, priceRange.max)
  }

  const handleFilterChange = () => {
    setCurrentPage(1)
    loadActivities(1, searchTerm, selectedDifficulty, selectedParticipants, priceRange.min, priceRange.max)
  }

  const handlePageChange = (page: number) => {
    loadActivities(page, searchTerm, selectedDifficulty, selectedParticipants, priceRange.min, priceRange.max)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedDifficulty('')
    setSelectedParticipants('')
    setPriceRange({ min: 0, max: 1000 })
    setCurrentPage(1)
    loadActivities(1, '', '', '', 0, 1000)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800'
      case 'moderate': return 'bg-yellow-100 text-yellow-800'
      case 'challenging': return 'bg-orange-100 text-orange-800'
      case 'extreme': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Fácil'
      case 'moderate': return 'Moderado'
      case 'challenging': return 'Difícil'
      case 'extreme': return 'Extremo'
      default: return 'Moderado'
    }
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

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {t('activities.title', 'Nuestras Actividades')}
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {t('activities.subtitle', 'Descubre las mejores experiencias en Antigua Guatemala')}
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
                    placeholder={t('activities.searchPlaceholder', 'Buscar actividades...')}
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
                  value={selectedDifficulty}
                  onChange={(e) => {
                    setSelectedDifficulty(e.target.value)
                    handleFilterChange()
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {difficultyLevels.map(level => (
                    <option key={level.value} value={level.value}>
                      {level.label}
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

                <Button onClick={handleSearch}>
                  <Search className="h-4 w-4 mr-2" />
                  Buscar
                </Button>
              </div>
            </div>

            {/* Filtros móviles */}
            {showFilters && (
              <div className="lg:hidden mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dificultad
                    </label>
                    <select
                      value={selectedDifficulty}
                      onChange={(e) => setSelectedDifficulty(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {difficultyLevels.map(level => (
                        <option key={level.value} value={level.value}>
                          {level.label}
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

          {/* Grid de actividades */}
          {!loading && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {activities.map((activity) => (
                  <div key={activity.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <div className="relative h-48">
                      <Image
                        src={activity.images[0]?.imageUrl || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop'}
                        alt={activity.images[0]?.altText || activity.name}
                        fill
                        className="object-cover"
                      />
                      {activity.isFeatured && (
                        <div className="absolute top-2 left-2">
                          <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                            Destacada
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                          {activity.name}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(activity.difficulty)}`}>
                          {getDifficultyLabel(activity.difficulty)}
                        </span>
                      </div>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {activity.description}
                      </p>

                      <div className="flex items-center text-sm text-gray-500 mb-4 space-x-4">
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
                          {formatParticipants(activity.minParticipants, activity.maxParticipants)}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold text-blue-600">
                          ${activity.basePrice}
                          <span className="text-sm font-normal text-gray-500 ml-1">
                            {activity.currency}
                          </span>
                        </div>
                        <Link href={`/activities/${activity.id}`}>
                          <Button size="sm">
                            Ver detalles
                            <ArrowRight className="h-4 w-4 ml-1" />
                          </Button>
                        </Link>
                      </div>
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
                  Mostrando {((currentPage - 1) * 9) + 1} - {Math.min(currentPage * 9, pagination.totalItems)} de {pagination.totalItems} actividades
                </div>
              )}
            </>
          )}

          {/* Sin resultados */}
          {!loading && activities.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No se encontraron actividades
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