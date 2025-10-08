'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Save, X } from 'lucide-react'

interface Activity {
  id?: string
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

interface ActivityFormProps {
  activity?: Activity | null
  onClose: () => void
  onSave: () => void
}

export function ActivityForm({ activity, onClose, onSave }: ActivityFormProps) {
  const [formData, setFormData] = useState({
    name: activity?.name || '',
    description: activity?.description || '',
    shortDescription: activity?.shortDescription || '',
    durationHours: activity?.durationHours || '',
    minParticipants: activity?.minParticipants || 1,
    maxParticipants: activity?.maxParticipants || '',
    basePrice: activity?.basePrice || '',
    currency: activity?.currency || 'USD',
    ageRestriction: activity?.ageRestriction || '',
    difficultyLevel: activity?.difficultyLevel || '',
    location: activity?.location || '',
    meetingPoint: activity?.meetingPoint || '',
    whatIncludes: activity?.whatIncludes || '',
    whatToBring: activity?.whatToBring || '',
    cancellationPolicy: activity?.cancellationPolicy || '',
    isActive: activity?.isActive ?? true,
  })

  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = activity 
        ? `/api/activities?id=${activity.id}`
        : `/api/activities`
      
      const method = activity ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          minParticipants: parseInt(formData.minParticipants.toString()),
          maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants.toString()) : null,
          durationHours: formData.durationHours ? parseFloat(formData.durationHours) : null,
          basePrice: parseFloat(formData.basePrice),
        }),
      })

      if (response.ok) {
        onSave()
      } else {
        const error = await response.json()
        alert(error.error || `Error ${activity ? 'actualizando' : 'creando'} actividad`)
      }
    } catch (error) {
      console.error(`Error ${activity ? 'updating' : 'creating'} activity:`, error)
      alert('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Información Básica */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre de la Actividad *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ej: Tour de Volcanes"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ubicación
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="Ej: Volcán Pacaya, Guatemala"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Descripción Corta */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Descripción Corta
        </label>
        <input
          type="text"
          value={formData.shortDescription}
          onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
          placeholder="Descripción breve para mostrar en listados..."
          maxLength={500}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 mt-1">Máximo 500 caracteres</p>
      </div>

      {/* Descripción Completa */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Descripción Completa
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Descripción detallada de la actividad..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Detalles de la Actividad */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Duración (horas)
          </label>
          <input
            type="number"
            step="0.5"
            value={formData.durationHours}
            onChange={(e) => setFormData({ ...formData, durationHours: e.target.value })}
            placeholder="Ej: 3.5"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dificultad
          </label>
          <select
            value={formData.difficultyLevel}
            onChange={(e) => setFormData({ ...formData, difficultyLevel: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Seleccionar...</option>
            <option value="easy">Fácil</option>
            <option value="moderate">Moderado</option>
            <option value="challenging">Desafiante</option>
            <option value="extreme">Extremo</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Restricción de Edad
          </label>
          <input
            type="text"
            value={formData.ageRestriction}
            onChange={(e) => setFormData({ ...formData, ageRestriction: e.target.value })}
            placeholder="Ej: 18+, Todas las edades"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Participantes y Precio */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Participantes Mínimos *
          </label>
          <input
            type="number"
            value={formData.minParticipants}
            onChange={(e) => setFormData({ ...formData, minParticipants: parseInt(e.target.value) || 1 })}
            required
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Participantes Máximos
          </label>
          <input
            type="number"
            value={formData.maxParticipants}
            onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Precio Base *
          </label>
          <div className="flex">
            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
              $
            </span>
            <input
              type="number"
              step="0.01"
              value={formData.basePrice}
              onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
              required
              min="0"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="50.00"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Moneda
          </label>
          <select
            value={formData.currency}
            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="USD">USD</option>
            <option value="GTQ">GTQ</option>
            <option value="EUR">EUR</option>
          </select>
        </div>
      </div>

      {/* Punto de Encuentro */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Punto de Encuentro
        </label>
        <textarea
          value={formData.meetingPoint}
          onChange={(e) => setFormData({ ...formData, meetingPoint: e.target.value })}
          placeholder="Describe dónde se encontrarán los participantes..."
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Qué Incluye */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Qué Incluye
        </label>
        <textarea
          value={formData.whatIncludes}
          onChange={(e) => setFormData({ ...formData, whatIncludes: e.target.value })}
          placeholder="Ej: Transporte, guía, equipo, refrigerios..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Qué Traer */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Qué Traer
        </label>
        <textarea
          value={formData.whatToBring}
          onChange={(e) => setFormData({ ...formData, whatToBring: e.target.value })}
          placeholder="Ej: Ropa cómoda, zapatos deportivos, protector solar..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Política de Cancelación */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Política de Cancelación
        </label>
        <textarea
          value={formData.cancellationPolicy}
          onChange={(e) => setFormData({ ...formData, cancellationPolicy: e.target.value })}
          placeholder="Ej: Cancelación gratuita hasta 24 horas antes..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Estado Activo */}
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
          Actividad activa (disponible para reservas)
        </label>
      </div>

      {/* Botones */}
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
          disabled={loading || !formData.name || !formData.basePrice}
        >
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Guardando...' : activity ? 'Actualizar' : 'Crear'} Actividad
        </Button>
      </div>
    </form>
  )
}





