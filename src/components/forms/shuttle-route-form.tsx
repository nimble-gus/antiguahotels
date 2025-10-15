'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Save, 
  X, 
  Plane,
  MapPin,
  Clock,
  Users,
  DollarSign,
  Car,
  AlertCircle
} from 'lucide-react'

interface ShuttleRouteFormProps {
  route?: any
  onClose: () => void
  onSave: () => void
}

interface Airport {
  id: string
  iata?: string
  name: string
  city?: string
  country?: string
}

interface Hotel {
  id: string
  name: string
  city?: string
  code?: string
}

export function ShuttleRouteForm({ route, onClose, onSave }: ShuttleRouteFormProps) {
  const [loading, setLoading] = useState(false)
  const [airports, setAirports] = useState<Airport[]>([])
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [formData, setFormData] = useState({
    name: route?.name || '',
    description: route?.description || '',
    fromAirportId: route?.fromAirportId || '',
    toHotelId: route?.toHotelId || '',
    direction: route?.direction || 'ARRIVAL',
    distanceKm: route?.distanceKm || '',
    estimatedDurationMinutes: route?.estimatedDurationMinutes || '',
    basePrice: route?.basePrice || '',
    currency: route?.currency || 'USD',
    isShared: route?.isShared !== false,
    maxPassengers: route?.maxPassengers || 8,
    vehicleType: route?.vehicleType || '',
    isActive: route?.isActive !== false,
  })

  useEffect(() => {
    fetchAirports()
    fetchHotels()
  }, [])

  const fetchAirports = async () => {
    try {
      const response = await fetch('/api/airports?active=true')
      if (response.ok) {
        const data = await response.json()
        setAirports(data.airports || [])
      }
    } catch (error) {
      console.error('Error fetching airports:', error)
    }
  }

  const fetchHotels = async () => {
    try {
      const response = await fetch('/api/hotels?active=true&limit=100')
      if (response.ok) {
        const data = await response.json()
        setHotels(data.hotels || [])
      }
    } catch (error) {
      console.error('Error fetching hotels:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = route ? `/api/shuttle/routes/${route.id}` : '/api/shuttle/routes'
      const method = route ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        onSave()
      } else {
        const error = await response.json()
        alert(error.error || 'Error guardando ruta')
      }
    } catch (error) {
      console.error('Error saving route:', error)
      alert('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Información Básica */}
      <Card>
        <CardHeader>
          <CardTitle>Información Básica</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de la Ruta <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Ej: Aeropuerto GUA → Hotel Antigua"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Descripción del servicio de shuttle..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </CardContent>
      </Card>

      {/* Ruta y Dirección */}
      <Card>
        <CardHeader>
          <CardTitle>Ruta y Dirección</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Aeropuerto de Origen <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.fromAirportId}
                onChange={(e) => setFormData({...formData, fromAirportId: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Seleccionar aeropuerto...</option>
                {airports.map((airport) => (
                  <option key={airport.id} value={airport.id}>
                    {airport.iata ? `${airport.iata} - ` : ''}{airport.name}
                    {airport.city ? ` (${airport.city})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hotel de Destino <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.toHotelId}
                onChange={(e) => setFormData({...formData, toHotelId: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Seleccionar hotel...</option>
                {hotels.map((hotel) => (
                  <option key={hotel.id} value={hotel.id}>
                    {hotel.name}
                    {hotel.city ? ` - ${hotel.city}` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dirección del Servicio <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.direction}
              onChange={(e) => setFormData({...formData, direction: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="ARRIVAL">🛬 Llegada (Aeropuerto → Hotel)</option>
              <option value="DEPARTURE">🛫 Salida (Hotel → Aeropuerto)</option>
              <option value="ROUNDTRIP">🔄 Ida y Vuelta</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Detalles del Servicio */}
      <Card>
        <CardHeader>
          <CardTitle>Detalles del Servicio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Distancia (km)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={formData.distanceKm}
                onChange={(e) => setFormData({...formData, distanceKm: e.target.value})}
                placeholder="45.5"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duración Estimada (minutos)
              </label>
              <input
                type="number"
                min="1"
                value={formData.estimatedDurationMinutes}
                onChange={(e) => setFormData({...formData, estimatedDurationMinutes: e.target.value})}
                placeholder="60"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Vehículo
              </label>
              <select
                value={formData.vehicleType}
                onChange={(e) => setFormData({...formData, vehicleType: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Seleccionar...</option>
                <option value="Van">Van</option>
                <option value="Minibus">Minibus</option>
                <option value="Bus">Bus</option>
                <option value="Car">Auto</option>
                <option value="SUV">SUV</option>
                <option value="Luxury Van">Van de Lujo</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Precios y Capacidad */}
      <Card>
        <CardHeader>
          <CardTitle>Precios y Capacidad</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio Base <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.basePrice}
                  onChange={(e) => setFormData({...formData, basePrice: e.target.value})}
                  placeholder="25.00"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Máximo Pasajeros <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={formData.maxPassengers}
                onChange={(e) => setFormData({...formData, maxPassengers: parseInt(e.target.value) || 8})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isShared"
                checked={formData.isShared}
                onChange={(e) => setFormData({...formData, isShared: e.target.checked})}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isShared" className="text-sm text-gray-900">
                🤝 Servicio compartido (múltiples pasajeros)
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="text-sm text-gray-900">
                ✅ Ruta activa (disponible para reservaciones)
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview de la Ruta */}
      {formData.fromAirportId && formData.toHotelId && (
        <Card>
          <CardHeader>
            <CardTitle>📋 Preview de la Ruta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <Plane className="h-8 w-8 text-blue-600 mx-auto mb-1" />
                    <p className="text-sm font-medium">
                      {airports.find(a => a.id === formData.fromAirportId)?.iata || 'N/A'}
                    </p>
                    <p className="text-xs text-gray-600">
                      {airports.find(a => a.id === formData.fromAirportId)?.name}
                    </p>
                  </div>
                  
                  <div className="flex-1 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="flex-1 h-px bg-blue-300"></div>
                      <Car className="h-6 w-6 text-blue-600" />
                      <div className="flex-1 h-px bg-blue-300"></div>
                    </div>
                    <p className="text-xs text-blue-600 mt-1">
                      {formData.direction === 'ARRIVAL' ? 'Llegada' : 
                       formData.direction === 'DEPARTURE' ? 'Salida' : 'Ida y Vuelta'}
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <MapPin className="h-8 w-8 text-green-600 mx-auto mb-1" />
                    <p className="text-sm font-medium">
                      {hotels.find(h => h.id === formData.toHotelId)?.code || 'HTL'}
                    </p>
                    <p className="text-xs text-gray-600">
                      {hotels.find(h => h.id === formData.toHotelId)?.name}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-xs text-gray-600">Precio</p>
                  <p className="font-medium text-blue-900">
                    {formData.currency} ${formData.basePrice || '0.00'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Capacidad</p>
                  <p className="font-medium text-green-900">
                    {formData.maxPassengers} pax
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Duración</p>
                  <p className="font-medium text-yellow-900">
                    {formData.estimatedDurationMinutes ? `${formData.estimatedDurationMinutes}min` : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Tipo</p>
                  <p className="font-medium text-purple-900">
                    {formData.isShared ? 'Compartido' : 'Privado'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Nota Importante */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-medium mb-1">📋 Importante para Reservaciones:</p>
              <p>
                Para que los clientes puedan reservar shuttle, debe haber <strong>disponibilidad de habitaciones</strong> 
                en el hotel de destino para la fecha del traslado. El sistema validará automáticamente esta disponibilidad.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

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
              {route ? 'Actualizar Ruta' : 'Crear Ruta'}
            </>
          )}
        </Button>
      </div>
    </form>
  )
}








