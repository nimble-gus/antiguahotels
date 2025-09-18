'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Save, 
  X, 
  Plus,
  Trash2,
  Hotel,
  MapPin,
  Clock,
  Users,
  DollarSign,
  Calendar,
  AlertCircle,
  Image as ImageIcon
} from 'lucide-react'

interface PackageFormProps {
  package?: any
  onClose: () => void
  onSave: () => void
}

interface Hotel {
  id: string
  name: string
  city?: string
  roomTypes: RoomType[]
}

interface RoomType {
  id: string
  name: string
  baseRate: string
}

interface Activity {
  id: string
  name: string
  durationHours: number
  basePrice: string
}

interface PackageHotel {
  hotelId: string
  roomTypeId: string
  nights: number
  checkInDay: number
  hotel?: Hotel
  roomType?: RoomType
}

interface PackageActivity {
  activityId: string
  dayNumber: number
  participantsIncluded?: number
  activity?: Activity
}

export function PackageForm({ package: pkg, onClose, onSave }: PackageFormProps) {
  const [loading, setLoading] = useState(false)
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  
  const [formData, setFormData] = useState({
    name: pkg?.name || '',
    description: pkg?.description || '',
    shortDescription: pkg?.shortDescription || '',
    durationDays: pkg?.durationDays || 1,
    durationNights: pkg?.durationNights || 1,
    minParticipants: pkg?.minParticipants || 1,
    maxParticipants: pkg?.maxParticipants || '',
    basePrice: pkg?.basePrice || '',
    currency: pkg?.currency || 'USD',
    capacity: pkg?.capacity || '',
    whatIncludes: pkg?.whatIncludes || '',
    whatExcludes: pkg?.whatExcludes || '',
    itinerary: pkg?.itinerary || '',
    isActive: pkg?.active !== false,
  })

  const [packageHotels, setPackageHotels] = useState<PackageHotel[]>(
    pkg?.packageHotels?.map((ph: any) => ({
      hotelId: ph.hotelId,
      roomTypeId: ph.roomTypeId,
      nights: ph.nights,
      checkInDay: ph.checkInDay,
      hotel: ph.hotel,
      roomType: ph.roomType
    })) || []
  )

  const [packageActivities, setPackageActivities] = useState<PackageActivity[]>(
    pkg?.packageActivities?.map((pa: any) => ({
      activityId: pa.activityId,
      dayNumber: pa.dayNumber,
      participantsIncluded: pa.participantsIncluded,
      activity: pa.activity
    })) || []
  )

  useEffect(() => {
    fetchHotels()
    fetchActivities()
  }, [])

  const fetchHotels = async () => {
    try {
      const response = await fetch('/api/hotels?limit=100&active=true')
      if (response.ok) {
        const data = await response.json()
        
        // Cargar tipos de habitación para cada hotel
        const hotelsWithRoomTypes = await Promise.all(
          data.hotels.map(async (hotel: any) => {
            const roomTypesResponse = await fetch(`/api/hotels/${hotel.id}/room-types?active=true`)
            if (roomTypesResponse.ok) {
              const roomTypesData = await roomTypesResponse.json()
              return {
                ...hotel,
                roomTypes: roomTypesData.roomTypes || []
              }
            }
            return { ...hotel, roomTypes: [] }
          })
        )
        
        setHotels(hotelsWithRoomTypes)
      }
    } catch (error) {
      console.error('Error fetching hotels:', error)
    }
  }

  const fetchActivities = async () => {
    try {
      const response = await fetch('/api/activities?limit=100&active=true')
      if (response.ok) {
        const data = await response.json()
        setActivities(data.activities || [])
      }
    } catch (error) {
      console.error('Error fetching activities:', error)
    }
  }

  const addHotel = () => {
    setPackageHotels([...packageHotels, {
      hotelId: '',
      roomTypeId: '',
      nights: 1,
      checkInDay: 1
    }])
  }

  const removeHotel = (index: number) => {
    setPackageHotels(packageHotels.filter((_, i) => i !== index))
  }

  const updateHotel = (index: number, field: string, value: any) => {
    const updated = [...packageHotels]
    updated[index] = { ...updated[index], [field]: value }
    
    // Si cambia el hotel, limpiar el tipo de habitación
    if (field === 'hotelId') {
      updated[index].roomTypeId = ''
      updated[index].hotel = hotels.find(h => h.id === value)
    }
    
    setPackageHotels(updated)
  }

  const addActivity = () => {
    setPackageActivities([...packageActivities, {
      activityId: '',
      dayNumber: 1,
      participantsIncluded: undefined
    }])
  }

  const removeActivity = (index: number) => {
    setPackageActivities(packageActivities.filter((_, i) => i !== index))
  }

  const updateActivity = (index: number, field: string, value: any) => {
    const updated = [...packageActivities]
    updated[index] = { ...updated[index], [field]: value }
    
    if (field === 'activityId') {
      updated[index].activity = activities.find(a => a.id === value)
    }
    
    setPackageActivities(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        ...formData,
        hotels: packageHotels.filter(h => h.hotelId && h.roomTypeId),
        activities: packageActivities.filter(a => a.activityId)
      }

      console.log('📦 Submitting package:', payload)

      const url = pkg ? `/api/packages/${pkg.id}` : '/api/packages'
      const method = pkg ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        console.log('✅ Package saved successfully')
        onSave()
      } else {
        const error = await response.json()
        alert(`Error guardando paquete: ${error.error || 'Error desconocido'}`)
      }
    } catch (error) {
      console.error('Error saving package:', error)
      alert('Error de conexión al guardar paquete')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Información básica */}
      <Card>
        <CardHeader>
          <CardTitle>Información Básica</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Paquete *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Ej: Paquete Aventura Antigua"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción Corta
            </label>
            <input
              type="text"
              value={formData.shortDescription}
              onChange={(e) => setFormData({...formData, shortDescription: e.target.value})}
              placeholder="Descripción breve para catálogos"
              maxLength={500}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción Completa *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Descripción detallada del paquete..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Duración y Participantes */}
      <Card>
        <CardHeader>
          <CardTitle>Duración y Participantes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Días *
              </label>
              <input
                type="number"
                min="1"
                value={formData.durationDays}
                onChange={(e) => setFormData({...formData, durationDays: parseInt(e.target.value) || 1})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Noches *
              </label>
              <input
                type="number"
                min="0"
                value={formData.durationNights}
                onChange={(e) => setFormData({...formData, durationNights: parseInt(e.target.value) || 0})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Capacidad Exacta (Personas) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={formData.capacity}
                onChange={(e) => {
                  const capacity = e.target.value
                  setFormData({
                    ...formData, 
                    capacity,
                    minParticipants: parseInt(capacity) || 1,
                    maxParticipants: capacity
                  })
                }}
                placeholder="Ej: 4 personas"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                🎯 El paquete será para exactamente esta cantidad de personas
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Precio del Paquete */}
      <Card>
        <CardHeader>
          <CardTitle>Precio del Paquete</CardTitle>
          <p className="text-sm text-gray-600">
            Precio fijo para todo el grupo, sin importar el número exacto de participantes
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio Total del Paquete <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.basePrice}
                  onChange={(e) => setFormData({...formData, basePrice: e.target.value})}
                  placeholder="499.00"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                💰 Precio fijo para todo el grupo completo
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Moneda
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({...formData, currency: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="USD">USD - Dólar Americano</option>
                <option value="GTQ">GTQ - Quetzal Guatemalteco</option>
                <option value="EUR">EUR - Euro</option>
              </select>
            </div>
          </div>

          {/* Ejemplo visual */}
          {formData.capacity && formData.basePrice && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">📋 Resumen del Paquete:</h4>
              <div className="text-sm text-blue-800">
                <p>• <strong>{formData.name || 'Tu Paquete'}</strong></p>
                <p>• {formData.durationDays} días y {formData.durationNights} noches</p>
                <p>• Para exactamente <strong>{formData.capacity} personas</strong></p>
                <p>• Precio total: <strong>{formData.currency} ${formData.basePrice}</strong></p>
                {formData.basePrice && formData.capacity && (
                  <p className="text-xs mt-1 text-blue-600">
                    (≈ ${(parseFloat(formData.basePrice) / parseInt(formData.capacity)).toFixed(2)} por persona)
                  </p>
                )}
              </div>
            </div>
          )}

        </CardContent>
      </Card>

      {/* Hoteles del Paquete */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Hoteles Incluidos</CardTitle>
            <Button type="button" onClick={addHotel} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Agregar Hotel
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {packageHotels.map((hotel, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">Hotel #{index + 1}</h4>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => removeHotel(index)}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hotel
                  </label>
                  <select
                    value={hotel.hotelId}
                    onChange={(e) => updateHotel(index, 'hotelId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Seleccionar hotel...</option>
                    {hotels.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name} ({h.city})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Habitación
                  </label>
                  <select
                    value={hotel.roomTypeId}
                    onChange={(e) => updateHotel(index, 'roomTypeId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    disabled={!hotel.hotelId}
                  >
                    <option value="">Seleccionar tipo...</option>
                    {hotel.hotelId && hotels.find(h => h.id === hotel.hotelId)?.roomTypes.map((rt) => (
                      <option key={rt.id} value={rt.id}>
                        {rt.name} (${rt.baseRate})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Noches
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={hotel.nights}
                    onChange={(e) => updateHotel(index, 'nights', parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Día de Check-in
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={formData.durationDays}
                    value={hotel.checkInDay}
                    onChange={(e) => updateHotel(index, 'checkInDay', parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>
          ))}
          
          {packageHotels.length === 0 && (
            <div className="text-center py-6 text-gray-500">
              <Hotel className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p>No hay hoteles agregados al paquete</p>
              <Button type="button" onClick={addHotel} className="mt-2">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Primer Hotel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actividades del Paquete */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Actividades Incluidas</CardTitle>
            <Button type="button" onClick={addActivity} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Agregar Actividad
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {packageActivities.map((activity, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">Actividad #{index + 1}</h4>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => removeActivity(index)}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Actividad
                  </label>
                  <select
                    value={activity.activityId}
                    onChange={(e) => updateActivity(index, 'activityId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Seleccionar actividad...</option>
                    {activities.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.durationHours}h)
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Día del Paquete
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={formData.durationDays}
                    value={activity.dayNumber}
                    onChange={(e) => updateActivity(index, 'dayNumber', parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Participantes Incluidos
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={activity.participantsIncluded || ''}
                    onChange={(e) => updateActivity(index, 'participantsIncluded', e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="Todos"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          ))}
          
          {packageActivities.length === 0 && (
            <div className="text-center py-6 text-gray-500">
              <MapPin className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p>No hay actividades agregadas al paquete</p>
              <Button type="button" onClick={addActivity} className="mt-2">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Primera Actividad
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Información Adicional */}
      <Card>
        <CardHeader>
          <CardTitle>Información Adicional</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Qué Incluye
              </label>
              <textarea
                value={formData.whatIncludes}
                onChange={(e) => setFormData({...formData, whatIncludes: e.target.value})}
                placeholder="• Transporte&#10;• Alimentación&#10;• Guía turístico..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Qué NO Incluye
              </label>
              <textarea
                value={formData.whatExcludes}
                onChange={(e) => setFormData({...formData, whatExcludes: e.target.value})}
                placeholder="• Bebidas alcohólicas&#10;• Propinas&#10;• Gastos personales..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Itinerario Detallado
            </label>
            <textarea
              value={formData.itinerary}
              onChange={(e) => setFormData({...formData, itinerary: e.target.value})}
              placeholder="Día 1: Llegada y check-in...&#10;Día 2: Tour por la ciudad...&#10;Día 3: Actividades de aventura..."
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
              Paquete activo (visible para reservaciones)
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Gestión de Imágenes - Solo para paquetes existentes */}
      {pkg && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <ImageIcon className="h-5 w-5 text-purple-600" />
                <span>Imágenes del Paquete</span>
              </CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => window.open(`/dashboard/packages/${pkg.id}/images`, '_blank')}
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                Gestionar Imágenes
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              💡 Para agregar, editar o eliminar imágenes del paquete, utiliza el botón "Gestionar Imágenes" 
              que abrirá una ventana dedicada con todas las herramientas de Cloudinary.
            </p>
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">📸 Recomendaciones para las imágenes:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• <strong>Imagen Principal:</strong> Una foto atractiva que represente todo el paquete</li>
                <li>• <strong>Imágenes Adicionales:</strong> Fotos de hoteles, actividades, paisajes incluidos</li>
                <li>• <strong>Calidad:</strong> Usa imágenes de alta resolución (mínimo 1200x800px)</li>
                <li>• <strong>Formato:</strong> JPG o PNG, máximo 5MB por imagen</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Botones */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
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
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Guardando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {pkg ? 'Actualizar Paquete' : 'Crear Paquete'}
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
