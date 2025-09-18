'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react'

interface Activity {
  id: string
  name: string
  description?: string
  durationHours?: string
  minParticipants: number
  maxParticipants?: number
  basePrice: string
  currency: string
  location?: string
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

export default function ActivitySchedulesPage() {
  const params = useParams()
  const router = useRouter()
  const activityId = params.id as string

  const [activity, setActivity] = useState<Activity | null>(null)
  const [schedules, setSchedules] = useState<ActivitySchedule[]>([])
  const [loading, setLoading] = useState(true)
  const [showScheduleForm, setShowScheduleForm] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<ActivitySchedule | null>(null)
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')

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
    if (schedule._count.activityBookings > 0) {
      alert('No se puede eliminar un horario que tiene reservaciones')
      return
    }

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

  const getAvailabilityStatus = (schedule: ActivitySchedule) => {
    const booked = schedule._count.activityBookings
    const available = schedule.availableSpots
    const percentage = (booked / available) * 100

    if (percentage === 0) return { color: 'text-green-600', text: 'Disponible', bg: 'bg-green-50' }
    if (percentage < 50) return { color: 'text-blue-600', text: 'Parcialmente ocupado', bg: 'bg-blue-50' }
    if (percentage < 100) return { color: 'text-orange-600', text: 'Casi lleno', bg: 'bg-orange-50' }
    return { color: 'text-red-600', text: 'Completo', bg: 'bg-red-50' }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5) // HH:MM
  }

  // Agrupar horarios por fecha
  const schedulesByDate = schedules.reduce((acc, schedule) => {
    const date = schedule.date
    if (!acc[date]) acc[date] = []
    acc[date].push(schedule)
    return acc
  }, {} as Record<string, ActivitySchedule[]>)

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
            <h1 className="text-3xl font-bold text-gray-900">Horarios - {activity.name}</h1>
            <p className="text-gray-600">
              {activity.location} • {activity.durationHours ? `${activity.durationHours}h` : 'Duración variable'} • ${activity.basePrice} {activity.currency}
            </p>
          </div>
        </div>
        <Button onClick={() => setShowScheduleForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Horario
        </Button>
      </div>

      {/* Activity Info */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-500" />
              <span className="text-sm text-gray-600">
                {activity.minParticipants}-{activity.maxParticipants || '∞'} participantes
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-green-500" />
              <span className="text-sm text-gray-600">{schedules.length} horarios programados</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-purple-500" />
              <span className="text-sm text-gray-600">
                {schedules.reduce((sum, s) => sum + s._count.activityBookings, 0)} reservaciones totales
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-orange-500" />
              <span className="text-sm text-gray-600">Precio base ${activity.basePrice}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vista Toggle */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Horarios Disponibles</h2>
        <div className="flex space-x-2">
          <Button
            variant={viewMode === 'calendar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('calendar')}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Calendario
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            Lista
          </Button>
        </div>
      </div>

      {/* Vista de Calendario */}
      {viewMode === 'calendar' && (
        <div className="space-y-6">
          {Object.keys(schedulesByDate).length > 0 ? (
            Object.entries(schedulesByDate)
              .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
              .map(([date, daySchedules]) => (
                <Card key={date}>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {formatDate(date)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      {daySchedules
                        .sort((a, b) => a.startTime.localeCompare(b.startTime))
                        .map((schedule) => {
                          const status = getAvailabilityStatus(schedule)
                          return (
                            <div key={schedule.id} className={`p-4 rounded-lg border ${status.bg}`}>
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-4 mb-2">
                                    <h4 className="font-semibold text-gray-900">
                                      {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                                    </h4>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color} bg-white`}>
                                      {status.text}
                                    </span>
                                    {!schedule.isActive && (
                                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                        Inactivo
                                      </span>
                                    )}
                                  </div>
                                  
                                  <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                                    <div>
                                      <span className="font-medium">Cupos:</span> {schedule._count.activityBookings}/{schedule.availableSpots}
                                    </div>
                                    <div>
                                      <span className="font-medium">Precio:</span> ${schedule.priceOverride || activity.basePrice} {activity.currency}
                                    </div>
                                    <div>
                                      <span className="font-medium">Disponibles:</span> {schedule.availableSpots - schedule._count.activityBookings}
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
                                    disabled={schedule._count.activityBookings > 0}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  </CardContent>
                </Card>
              ))
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay horarios programados</h3>
                <p className="text-gray-500 mb-4">
                  Los clientes podrán reservar cuando agregues horarios específicos.
                </p>
                <Button onClick={() => setShowScheduleForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Programar Primer Horario
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Vista de Lista */}
      {viewMode === 'list' && (
        <div className="grid gap-4">
          {schedules
            .sort((a, b) => new Date(a.date + ' ' + a.startTime).getTime() - new Date(b.date + ' ' + b.startTime).getTime())
            .map((schedule) => {
              const status = getAvailabilityStatus(schedule)
              return (
                <Card key={schedule.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {formatDate(schedule.date)}
                          </h3>
                          <span className="text-sm text-gray-600">
                            {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color} ${status.bg}`}>
                            {status.text}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4 text-blue-500" />
                            <span>{schedule._count.activityBookings}/{schedule.availableSpots} reservados</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <DollarSign className="h-4 w-4 text-green-500" />
                            <span>${schedule.priceOverride || activity.basePrice} {activity.currency}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-purple-500" />
                            <span>{schedule.availableSpots - schedule._count.activityBookings} disponibles</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <AlertCircle className="h-4 w-4 text-gray-400" />
                            <span>{schedule.isActive ? 'Activo' : 'Inactivo'}</span>
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
                          disabled={schedule._count.activityBookings > 0}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
        </div>
      )}

      {/* Schedule Form Modal */}
      {showScheduleForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>
                {editingSchedule ? 'Editar Horario' : 'Programar Nuevo Horario'}
              </CardTitle>
              <CardDescription>
                {editingSchedule 
                  ? 'Modifica los detalles del horario' 
                  : `Programa un horario específico para ${activity.name}`
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ActivityScheduleForm 
                activityId={activityId}
                activity={activity}
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
  activity,
  schedule,
  onClose,
  onSave
}: {
  activityId: string
  activity: Activity
  schedule?: ActivitySchedule | null
  onClose: () => void
  onSave: () => void
}) {
  const [formData, setFormData] = useState({
    date: schedule?.date || '',
    startTime: schedule?.startTime || '',
    endTime: schedule?.endTime || '',
    availableSpots: schedule?.availableSpots || activity.maxParticipants || 10,
    priceOverride: schedule?.priceOverride || '',
    isActive: schedule?.isActive ?? true,
    // Nuevos campos para creación masiva
    bulkMode: false,
    bulkType: 'week', // 'week', 'month', 'custom'
    endDate: '',
    selectedDays: [1, 2, 3, 4, 5], // Lunes a Viernes por defecto
  })

  const [loading, setLoading] = useState(false)

  // Calcular hora de fin automáticamente basada en duración
  useEffect(() => {
    if (formData.startTime && activity.durationHours && !schedule) {
      const [hours, minutes] = formData.startTime.split(':').map(Number)
      const durationHours = parseFloat(activity.durationHours)
      const endHours = hours + Math.floor(durationHours)
      const endMinutes = minutes + ((durationHours % 1) * 60)
      
      const finalHours = endHours + Math.floor(endMinutes / 60)
      const finalMinutes = Math.floor(endMinutes % 60)
      
      const endTime = `${String(finalHours).padStart(2, '0')}:${String(finalMinutes).padStart(2, '0')}`
      setFormData(prev => ({ ...prev, endTime }))
    }
  }, [formData.startTime, activity.durationHours, schedule])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (formData.bulkMode && !schedule) {
        // Creación masiva
        const response = await fetch(`/api/activities/${activityId}/schedules/bulk`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            startDate: formData.date,
            endDate: formData.endDate,
            bulkType: formData.bulkType,
            selectedDays: formData.selectedDays,
            startTime: formData.startTime,
            endTime: formData.endTime,
            availableSpots: parseInt(formData.availableSpots.toString()),
            priceOverride: formData.priceOverride ? parseFloat(formData.priceOverride) : null,
            isActive: formData.isActive,
          }),
        })

        if (response.ok) {
          const result = await response.json()
          alert(result.message)
          onSave()
        } else {
          const error = await response.json()
          alert(error.error || 'Error creando horarios masivos')
        }
      } else {
        // Creación/edición individual
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
            date: formData.date,
            startTime: formData.startTime,
            endTime: formData.endTime,
            availableSpots: parseInt(formData.availableSpots.toString()),
            priceOverride: formData.priceOverride ? parseFloat(formData.priceOverride) : null,
            isActive: formData.isActive,
          }),
        })

        if (response.ok) {
          onSave()
        } else {
          const error = await response.json()
          alert(error.error || `Error ${schedule ? 'actualizando' : 'creando'} horario`)
        }
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
      {/* Modo de Creación */}
      {!schedule && (
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center space-x-3 mb-3">
            <input
              type="checkbox"
              id="bulkMode"
              checked={formData.bulkMode}
              onChange={(e) => setFormData({ ...formData, bulkMode: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="bulkMode" className="text-sm font-medium text-blue-900">
              🚀 Creación Masiva de Horarios
            </label>
          </div>
          {formData.bulkMode && (
            <p className="text-xs text-blue-700">
              Crea múltiples horarios automáticamente para semanas o meses completos
            </p>
          )}
        </div>
      )}

      {/* Configuración de Fechas */}
      {formData.bulkMode && !schedule ? (
        <div className="space-y-4 p-4 border border-blue-200 rounded-lg bg-blue-50">
          <h4 className="font-medium text-blue-900">Configuración de Periodo</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-blue-700 mb-2">
                Tipo de Periodo
              </label>
              <select
                value={formData.bulkType}
                onChange={(e) => setFormData({ ...formData, bulkType: e.target.value })}
                className="w-full px-3 py-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="week">Esta Semana</option>
                <option value="month">Este Mes</option>
                <option value="custom">Periodo Personalizado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-700 mb-2">
                Fecha de Inicio *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {formData.bulkType === 'custom' && (
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-2">
                  Fecha de Fin *
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                  min={formData.date}
                  className="w-full px-3 py-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>

          {/* Selección de Días de la Semana */}
          <div>
            <label className="block text-sm font-medium text-blue-700 mb-2">
              Días de la Semana
            </label>
            <div className="flex space-x-2">
              {[
                { value: 1, label: 'Lun' },
                { value: 2, label: 'Mar' },
                { value: 3, label: 'Mié' },
                { value: 4, label: 'Jue' },
                { value: 5, label: 'Vie' },
                { value: 6, label: 'Sáb' },
                { value: 0, label: 'Dom' }
              ].map((day) => (
                <label key={day.value} className="flex items-center space-x-1">
                  <input
                    type="checkbox"
                    checked={formData.selectedDays.includes(day.value)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          selectedDays: [...formData.selectedDays, day.value]
                        })
                      } else {
                        setFormData({
                          ...formData,
                          selectedDays: formData.selectedDays.filter(d => d !== day.value)
                        })
                      }
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-blue-300 rounded"
                  />
                  <span className="text-sm text-blue-700">{day.label}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-blue-600 mt-1">
              Selecciona los días de la semana para programar horarios
            </p>
          </div>
        </div>
      ) : (
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
              max={activity.maxParticipants || 100}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Máximo recomendado: {activity.maxParticipants || 'Sin límite'}
            </p>
          </div>
        </div>
      )}

      {/* Cupos para Modo Masivo */}
      {formData.bulkMode && !schedule && (
        <div>
          <label className="block text-sm font-medium text-blue-700 mb-2">
            Cupos por Horario *
          </label>
          <input
            type="number"
            value={formData.availableSpots}
            onChange={(e) => setFormData({ ...formData, availableSpots: parseInt(e.target.value) || 0 })}
            required
            min="1"
            max={activity.maxParticipants || 100}
            className="w-full px-3 py-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-blue-600 mt-1">
            Este número de cupos se aplicará a todos los horarios creados
          </p>
        </div>
      )}

      {/* Vista Previa de Creación Masiva */}
      {formData.bulkMode && !schedule && formData.date && formData.selectedDays.length > 0 && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="font-medium text-green-900 mb-2">📋 Vista Previa</h4>
          <div className="text-sm text-green-700">
            <p className="mb-1">
              <strong>Se crearán horarios para:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>
                <strong>Periodo:</strong> {
                  formData.bulkType === 'week' ? 'Esta semana' :
                  formData.bulkType === 'month' ? 'Este mes' :
                  `${formData.date} a ${formData.endDate}`
                }
              </li>
              <li>
                <strong>Días:</strong> {
                  formData.selectedDays.map(day => 
                    ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][day]
                  ).join(', ')
                }
              </li>
              {formData.startTime && formData.endTime && (
                <li>
                  <strong>Horario:</strong> {formData.startTime} - {formData.endTime}
                </li>
              )}
              <li>
                <strong>Cupos por horario:</strong> {formData.availableSpots}
              </li>
              {formData.priceOverride && (
                <li>
                  <strong>Precio especial:</strong> ${formData.priceOverride} {activity.currency}
                </li>
              )}
            </ul>
          </div>
        </div>
      )}

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
          {activity.durationHours && (
            <p className="text-xs text-gray-500 mt-1">
              Duración sugerida: {activity.durationHours} horas
            </p>
          )}
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
            placeholder={`Precio base: $${activity.basePrice}`}
            min="0"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Dejar vacío para usar precio base (${activity.basePrice} {activity.currency})
        </p>
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
          <X className="h-4 w-4 mr-2" />
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={loading || !formData.date || !formData.startTime || !formData.endTime || (formData.bulkMode && formData.selectedDays.length === 0)}
        >
          {loading 
            ? 'Creando...' 
            : schedule 
              ? 'Actualizar Horario' 
              : formData.bulkMode 
                ? '🚀 Crear Horarios Masivos' 
                : 'Programar Horario'
          }
        </Button>
      </div>
    </form>
  )
}
