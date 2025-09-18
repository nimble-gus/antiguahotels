'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Save, X } from 'lucide-react'

interface Room {
  id: string
  code: string
  roomTypeId: string
  floorNumber?: number
  isActive: boolean
  roomType?: {
    name: string
    baseRate: string
    occupancy: number
    bedConfiguration?: string
  }
}

interface RoomType {
  id: string
  name: string
  baseRate: string
  occupancy: number
  isActive: boolean
}

interface RoomFormProps {
  hotelId: string
  roomTypes: RoomType[]
  room?: Room | null
  onClose: () => void
  onSave: () => void
}

export function RoomForm({ hotelId, roomTypes, room, onClose, onSave }: RoomFormProps) {
  const [formData, setFormData] = useState({
    roomTypeId: room?.roomTypeId || '',
    code: room?.code || '',
    floorNumber: room?.floorNumber?.toString() || '',
    isActive: room?.isActive ?? true,
  })

  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = room 
        ? `/api/hotels/${hotelId}/rooms?id=${room.id}`
        : `/api/hotels/${hotelId}/rooms`
      
      const method = room ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          floorNumber: formData.floorNumber ? parseInt(formData.floorNumber) : null,
        }),
      })

      if (response.ok) {
        onSave()
      } else {
        const error = await response.json()
        alert(error.error || `Error ${room ? 'actualizando' : 'creando'} habitación`)
      }
    } catch (error) {
      console.error(`Error ${room ? 'updating' : 'creating'} room:`, error)
      alert('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Tipo de Habitación */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tipo de Habitación *
        </label>
        <select
          value={formData.roomTypeId}
          onChange={(e) => setFormData({ ...formData, roomTypeId: e.target.value })}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Seleccionar tipo...</option>
          {roomTypes.filter(rt => rt.isActive).map((roomType) => (
            <option key={roomType.id} value={roomType.id}>
              {roomType.name} - ${roomType.baseRate}/noche ({roomType.occupancy} pax)
            </option>
          ))}
        </select>
      </div>

      {/* Código de Habitación */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Código de Habitación *
        </label>
        <input
          type="text"
          value={formData.code}
          onChange={(e) => setFormData({ ...formData, code: e.target.value })}
          placeholder="Ej: 101, 201-A, Suite-01"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 mt-1">
          Código único para identificar la habitación
        </p>
      </div>

      {/* Número de Piso */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Número de Piso
        </label>
        <input
          type="number"
          value={formData.floorNumber}
          onChange={(e) => setFormData({ ...formData, floorNumber: e.target.value })}
          placeholder="Ej: 1, 2, 3..."
          min="0"
          max="50"
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
          Habitación activa
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
          disabled={loading || !formData.roomTypeId || !formData.code}
        >
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Guardando...' : room ? 'Actualizar' : 'Crear'} Habitación
        </Button>
      </div>
    </form>
  )
}
