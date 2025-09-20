'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ActivityForm } from '@/components/forms/activity-form'
import { 
  Plus, 
  Edit, 
  Trash2, 
  MapPin, 
  Clock,
  Users,
  DollarSign,
  Search,
  Filter,
  Eye,
  Calendar,
  Star,
  X,
  ImageIcon
} from 'lucide-react'

interface Activity {
  id: string
  name: string
  description?: string
  shortDescription?: string
  durationHours?: string
  minParticipants: number
  maxParticipants?: number
  basePrice: string
  currency: string
  ageRestriction?: string
  difficultyLevel?: string
  location?: string
  meetingPoint?: string
  whatIncludes?: string
  whatToBring?: string
  cancellationPolicy?: string
  isActive: boolean
  isFeatured?: boolean
  featuredOrder?: number
  createdAt: string
  _count: {
    activitySchedules: number
    activityBookings: number
  }
}

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState('')
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState<any>(null)

  useEffect(() => {
    fetchActivities()
  }, [currentPage, searchTerm, difficultyFilter, activeFilter])

  const fetchActivities = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
      })

      if (searchTerm) params.append('search', searchTerm)
      if (difficultyFilter) params.append('difficulty', difficultyFilter)
      if (activeFilter !== 'all') params.append('active', activeFilter)

      const response = await fetch(`/api/activities?${params}`)
      if (response.ok) {
        const data = await response.json()
        setActivities(data.activities)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching activities:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (activity: Activity) => {
    if (!confirm(`¿Estás seguro de eliminar la actividad "${activity.name}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/activities?id=${activity.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchActivities()
      } else {
        const error = await response.json()
        alert(error.error || 'Error eliminando actividad')
      }
    } catch (error) {
      console.error('Error deleting activity:', error)
      alert('Error de conexión')
    }
  }

  const handleToggleFeatured = async (activity: Activity) => {
    try {
      console.log('🌟 Toggling featured status for:', activity.name)
      
      const response = await fetch(`/api/activities/featured?id=${activity.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          isFeatured: !activity.isFeatured,
          featuredOrder: !activity.isFeatured ? Date.now() : null
        })
      })

      if (response.ok) {
        console.log('✅ Featured status updated successfully')
        await fetchActivities()
      } else {
        const error = await response.json()
        console.error('❌ Error response:', error)
        alert(error.error || 'Error actualizando estado destacado')
      }
    } catch (error) {
      console.error('Error updating featured status:', error)
      alert('Error de conexión')
    }
  }

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800'
      case 'moderate': return 'bg-yellow-100 text-yellow-800'
      case 'challenging': return 'bg-orange-100 text-orange-800'
      case 'extreme': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDifficultyText = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy': return 'Fácil'
      case 'moderate': return 'Moderado'
      case 'challenging': return 'Desafiante'
      case 'extreme': return 'Extremo'
      default: return 'N/A'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Actividades</h1>
          <p className="text-gray-600">Administra actividades turísticas y experiencias</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Actividad
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Buscar
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nombre o descripción..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dificultad
              </label>
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todas</option>
                <option value="easy">Fácil</option>
                <option value="moderate">Moderado</option>
                <option value="challenging">Desafiante</option>
                <option value="extreme">Extremo</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos</option>
                <option value="true">Activos</option>
                <option value="false">Inactivos</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('')
                  setDifficultyFilter('')
                  setActiveFilter('all')
                  setCurrentPage(1)
                }}
                className="w-full"
              >
                <Filter className="h-4 w-4 mr-2" />
                Limpiar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Actividades */}
      {activities.length > 0 ? (
        <div className="grid gap-6">
          {activities.map((activity) => (
            <Card key={activity.id} className={`relative ${activity.isFeatured ? 'ring-2 ring-antigua-purple' : ''}`}>
              {activity.isFeatured && (
                <div className="absolute -top-2 -right-2 bg-antigua-purple text-white px-2 py-1 rounded-full text-xs font-medium flex items-center z-10">
                  <Star className="h-3 w-3 mr-1 fill-current" />
                  Destacada #{activity.featuredOrder}
                </div>
              )}
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-3">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{activity.name}</h3>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            activity.isActive 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {activity.isActive ? 'Activa' : 'Inactiva'}
                          </span>
                          {activity.difficultyLevel && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(activity.difficultyLevel)}`}>
                              {getDifficultyText(activity.difficultyLevel)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {activity.shortDescription && (
                      <p className="text-gray-600 mb-4">{activity.shortDescription}</p>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-green-500" />
                        <span>${activity.basePrice} {activity.currency}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-blue-500" />
                        <span>{activity.minParticipants}-{activity.maxParticipants || '∞'} pax</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-purple-500" />
                        <span>{activity.durationHours || 'N/A'} horas</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>{activity.location || 'Por definir'}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm mt-3">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-orange-500" />
                        <span>{activity._count.activitySchedules} horarios</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span>{activity._count.activityBookings} reservaciones</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/dashboard/activities/${activity.id}/schedules`, '_blank')}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Gestionar Horarios
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/dashboard/activities/${activity.id}/images`, '_blank')}
                    >
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Gestionar Imágenes
                    </Button>
                    
                    <Button
                      variant={activity.isFeatured ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleToggleFeatured(activity)}
                      className={activity.isFeatured ? "bg-antigua-purple hover:bg-antigua-purple-dark text-white" : ""}
                    >
                      <Star className={`h-4 w-4 mr-2 ${activity.isFeatured ? 'fill-current' : ''}`} />
                      {activity.isFeatured ? 'Destacada' : 'Destacar'}
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        console.log('🎯 Edit activity clicked:', activity)
                        setEditingActivity(activity)
                        console.log('✅ editingActivity state set')
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(activity)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay actividades</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || difficultyFilter ? 'No se encontraron actividades con los filtros aplicados.' : 'Comienza agregando tu primera actividad.'}
            </p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Primera Actividad
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Paginación */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Página {pagination.currentPage} de {pagination.totalPages}
            {' '}({pagination.totalCount} actividades total)
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === pagination.totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}

      {/* Modal de crear/editar actividad */}
      {(showCreateForm || editingActivity) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingActivity ? 'Editar Actividad' : 'Crear Nueva Actividad'}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowCreateForm(false)
                    setEditingActivity(null)
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="p-6">
              <ActivityForm
                activity={editingActivity}
                onClose={() => {
                  setShowCreateForm(false)
                  setEditingActivity(null)
                }}
                onSave={() => {
                  fetchActivities()
                  setShowCreateForm(false)
                  setEditingActivity(null)
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
