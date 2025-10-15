'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CloudinaryImageManager } from '@/components/cloudinary-image-manager'
import { 
  ArrowLeft,
  Plus, 
  Edit, 
  Trash2, 
  Clock,
  Users,
  DollarSign,
  MapPin,
  Calendar,
  Image as ImageIcon
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
}

interface ActivitySchedule {
  id: string
  date: string
  startTime: string
  endTime: string
  availableSpots: number
  priceOverride?: string
  isActive: boolean
  _count: {
    activityBookings: number
  }
}

export default function ActivityDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const activityId = params.id as string

  const [activity, setActivity] = useState<Activity | null>(null)
  const [schedules, setSchedules] = useState<ActivitySchedule[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'schedules' | 'images'>('schedules')
  const [showScheduleForm, setShowScheduleForm] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<ActivitySchedule | null>(null)

  useEffect(() => {
    fetchActivityData()
  }, [activityId])

  const fetchActivityData = async () => {
    try {
      const [activityResponse, schedulesResponse] = await Promise.all([
        fetch(`/api/activities/${activityId}`),
        fetch(`/api/activities/${activityId}/schedules`)
      ])

      if (activityResponse.ok) {
        const activityData = await activityResponse.json()
        setActivity(activityData)
      }

      if (schedulesResponse.ok) {
        const schedulesData = await schedulesResponse.json()
        setSchedules(schedulesData)
      }

    } catch (error) {
      console.error('Error fetching activity data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSchedule = async (schedule: ActivitySchedule) => {
    if (!confirm(`¿Estás seguro de eliminar este horario?`)) {
      return
    }

    try {
      const response = await fetch(`/api/activities/${activityId}/schedules?id=${schedule.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchActivityData()
      } else {
        const error = await response.json()
        alert(error.error || 'Error eliminando horario')
      }
    } catch (error) {
      console.error('Error deleting schedule:', error)
      alert('Error de conexión')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!activity) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Actividad no encontrada</h2>
        <Button onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Regresar
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{activity.name}</h1>
            <p className="text-gray-600">
              {activity.location} • ${activity.basePrice} {activity.currency}
            </p>
          </div>
        </div>
      </div>

      {/* Activity Info Card */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-600">
                {activity.durationHours ? `${activity.durationHours} horas` : 'Duración por definir'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-600">
                {activity.minParticipants}-{activity.maxParticipants || '∞'} participantes
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-600">{activity.location || 'Ubicación por definir'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-600">{schedules.length} horarios programados</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('schedules')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'schedules'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Horarios ({schedules.length})
          </button>
          <button
            onClick={() => setActiveTab('images')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'images'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Imágenes
          </button>
        </nav>
      </div>

      {/* Schedules Tab */}
      {activeTab === 'schedules' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Horarios Programados</h2>
            <Button onClick={() => setShowScheduleForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Horario
            </Button>
          </div>

          <div className="grid gap-4">
            {schedules.map((schedule) => (
              <Card key={schedule.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {new Date(schedule.date).toLocaleDateString('es-ES', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          schedule.isActive 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {schedule.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-blue-500" />
                          <span>{schedule.startTime} - {schedule.endTime}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-green-500" />
                          <span>{schedule.availableSpots} cupos</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-purple-500" />
                          <span>
                            ${schedule.priceOverride || activity.basePrice} {activity.currency}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-orange-500" />
                          <span>{schedule._count.activityBookings} reservados</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setEditingSchedule(schedule)
                          setShowScheduleForm(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteSchedule(schedule)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {schedules.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay horarios programados</h3>
                <p className="text-gray-500 mb-4">
                  Comienza agregando horarios para esta actividad.
                </p>
                <Button onClick={() => setShowScheduleForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primer Horario
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Images Tab */}
      {activeTab === 'images' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Gestión de Imágenes</h2>
          </div>

          <Card>
            <CardContent className="p-6">
              <CloudinaryImageManager
                entityType="ACTIVITY"
                entityId={activityId}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Schedule Form Modal */}
      {showScheduleForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>
                {editingSchedule ? 'Editar Horario' : 'Crear Nuevo Horario'}
              </CardTitle>
              <CardDescription>
                {editingSchedule ? 'Modifica el horario de la actividad' : 'Programa un nuevo horario para la actividad'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ActivityScheduleForm 
                activityId={activityId}
                schedule={editingSchedule}
                onClose={() => {
                  setShowScheduleForm(false)
                  setEditingSchedule(null)
                }}
                onSave={() => {
                  fetchActivityData()
                  setShowScheduleForm(false)
                  setEditingSchedule(null)
                }}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

// Componente para formulario de horarios
function ActivityScheduleForm({
  activityId,
  schedule,
  onClose,
  onSave
}: {
  activityId: string
  schedule?: ActivitySchedule | null
  onClose: () => void
  onSave: () => void
}) {
  const [formData, setFormData] = useState({
    date: schedule?.date || '',
    startTime: schedule?.startTime || '',
    endTime: schedule?.endTime || '',
    availableSpots: schedule?.availableSpots || 10,
    priceOverride: schedule?.priceOverride || '',
    isActive: schedule?.isActive ?? true,
  })

  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = schedule 
        ? `/api/activities/${activityId}/schedules?id=${schedule.id}`
        : `/api/activities/${activityId}/schedules`
      
      const method = schedule ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          availableSpots: parseInt(formData.availableSpots.toString()),
          priceOverride: formData.priceOverride ? parseFloat(formData.priceOverride) : null,
        }),
      })

      if (response.ok) {
        onSave()
      } else {
        const error = await response.json()
        alert(error.error || `Error ${schedule ? 'actualizando' : 'creando'} horario`)
      }
    } catch (error) {
      console.error(`Error ${schedule ? 'updating' : 'creating'} schedule:`, error)
      alert('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fecha *
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cupos Disponibles *
          </label>
          <input
            type="number"
            value={formData.availableSpots}
            onChange={(e) => setFormData({ ...formData, availableSpots: parseInt(e.target.value) || 0 })}
            required
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hora de Inicio *
          </label>
          <input
            type="time"
            value={formData.startTime}
            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hora de Finalización *
          </label>
          <input
            type="time"
            value={formData.endTime}
            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Precio Especial (opcional)
        </label>
        <div className="flex">
          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
            $
          </span>
          <input
            type="number"
            step="0.01"
            value={formData.priceOverride}
            onChange={(e) => setFormData({ ...formData, priceOverride: e.target.value })}
            placeholder="Dejar vacío para usar precio base"
            min="0"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
          Horario activo (disponible para reservas)
        </label>
      </div>

      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={loading || !formData.date || !formData.startTime || !formData.endTime}
        >
          {loading ? 'Guardando...' : schedule ? 'Actualizar' : 'Crear'} Horario
        </Button>
      </div>
    </form>
  )
}








