'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Save, X, Check } from 'lucide-react'

interface Room {
  id: string
  code: string
  roomTypeId: string
  floorNumber?: number
  isActive: boolean
  amenities?: Amenity[]
  roomType?: {
    name: string
    baseRate: string
    occupancy: number
    bedConfiguration?: string
  }
}

interface Amenity {
  id: string
  name: string
  icon: string
  category: string
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

  const [availableAmenities, setAvailableAmenities] = useState<Amenity[]>([])
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
    room?.amenities?.map(a => a.id) || []
  )
  const [loading, setLoading] = useState(false)
  const [amenitiesLoading, setAmenitiesLoading] = useState(true)

  // Cargar amenidades disponibles
  useEffect(() => {
    const fetchAmenities = async () => {
      try {
        setAmenitiesLoading(true)
        console.log('🔍 Fetching amenities...')
        const response = await fetch('/api/amenities?category=ROOM')
        console.log('📡 Response status:', response.status)
        
        if (response.ok) {
          const data = await response.json()
          console.log('📦 Response data:', data)
          setAvailableAmenities(data.amenities || [])
          console.log('✅ Amenities loaded:', data.amenities?.length || 0)
        } else {
          console.error('❌ Error response:', response.status, response.statusText)
        }
      } catch (error) {
        console.error('❌ Error fetching amenities:', error)
      } finally {
        setAmenitiesLoading(false)
      }
    }
    fetchAmenities()
  }, [])

  // Cargar amenidades existentes cuando se edita una habitación
  useEffect(() => {
    if (room?.amenities) {
      console.log('🏠 Loading existing room amenities:', room.amenities)
      setSelectedAmenities(room.amenities.map(a => a.id))
    }
  }, [room])

  const handleAmenityToggle = (amenityId: string) => {
    console.log('🔄 Toggling amenity:', amenityId)
    setSelectedAmenities(prev => {
      const newSelection = prev.includes(amenityId) 
        ? prev.filter(id => id !== amenityId)
        : [...prev, amenityId]
      console.log('📝 New selection:', newSelection)
      return newSelection
    })
  }

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
          amenities: selectedAmenities,
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

      {/* Amenidades de la Habitación */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Amenidades de la Habitación
          <span className="text-xs text-gray-500 ml-2">
            ({selectedAmenities.length} de {availableAmenities.length} seleccionadas)
          </span>
        </label>
        <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto border border-gray-200 rounded-md p-3">
          {amenitiesLoading ? (
            <div className="col-span-2 text-center text-gray-500 py-4">
              <p>🔄 Cargando amenidades...</p>
            </div>
          ) : availableAmenities.length === 0 ? (
            <div className="col-span-2 text-center text-gray-500 py-4">
              <p>No hay amenidades disponibles</p>
              <p className="text-xs">Verifica que existan amenidades de tipo ROOM en la base de datos</p>
            </div>
          ) : (
            availableAmenities.map((amenity) => (
              <label
                key={amenity.id}
                className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
              >
                <input
                  type="checkbox"
                  checked={selectedAmenities.includes(amenity.id)}
                  onChange={() => handleAmenityToggle(amenity.id)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700 flex items-center">
                  <span className="mr-2">{amenity.icon}</span>
                  {amenity.name}
                </span>
              </label>
            ))
          )}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Selecciona las amenidades específicas de esta habitación
        </p>
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
