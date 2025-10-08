'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Save, 
  X, 
  Upload, 
  MapPin, 
  Clock,
  Star,
  Wifi,
  Car,
  Waves,
  Dumbbell,
  Coffee,
  Shield
} from 'lucide-react'

interface Hotel {
  id?: string
  name: string
  code?: string
  brand?: string
  description?: string
  logoUrl?: string
  address?: string
  city?: string
  country?: string
  postalCode?: string
  latitude?: string
  longitude?: string
  wazeLink?: string
  googleMapsLink?: string
  phone?: string
  email?: string
  website?: string
  checkInTime?: string
  checkOutTime?: string
  rating?: number
  timezone?: string
  isActive: boolean
}

interface Amenity {
  id: string
  name: string
  description?: string
  icon?: string
  category: string
}

interface HotelFormProps {
  hotel?: Hotel | null
  onClose: () => void
  onSave: () => void
}

export function HotelForm({ hotel, onClose, onSave }: HotelFormProps) {
  const [formData, setFormData] = useState<Hotel>({
    name: '',
    code: '',
    brand: '',
    description: '',
    logoUrl: '',
    address: '',
    city: '',
    country: 'Guatemala',
    postalCode: '',
    latitude: '',
    longitude: '',
    wazeLink: '',
    googleMapsLink: '',
    phone: '',
    email: '',
    website: '',
    checkInTime: '15:00',
    checkOutTime: '11:00',
    rating: 0,
    timezone: 'America/Guatemala',
    isActive: true,
  })

  const [amenities, setAmenities] = useState<Amenity[]>([])
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  useEffect(() => {
    fetchAmenities()
    if (hotel) {
      // Cargar datos del hotel de forma segura
      setFormData({
        name: hotel.name || '',
        code: hotel.code || '',
        brand: hotel.brand || '',
        description: hotel.description || '',
        logoUrl: hotel.logoUrl || '',
        address: hotel.address || '',
        city: hotel.city || '',
        country: hotel.country || 'Guatemala',
        postalCode: hotel.postalCode || '',
        latitude: hotel.latitude || '',
        longitude: hotel.longitude || '',
        wazeLink: hotel.wazeLink || '',
        googleMapsLink: hotel.googleMapsLink || '',
        phone: hotel.phone || '',
        email: hotel.email || '',
        website: hotel.website || '',
        checkInTime: hotel.checkInTime || '15:00',
        checkOutTime: hotel.checkOutTime || '11:00',
        rating: hotel.rating || 0,
        timezone: hotel.timezone || 'America/Guatemala',
        isActive: hotel.isActive ?? true,
      })
      fetchHotelAmenities(hotel.id!)
    }
  }, [hotel])

  const fetchAmenities = async () => {
    try {
      const response = await fetch('/api/amenities?category=HOTEL')
      if (response.ok) {
        const data = await response.json()
        // Asegurar que amenities sea siempre un array
        setAmenities(Array.isArray(data) ? data : (data.amenities || []))
      }
    } catch (error) {
      console.error('Error fetching amenities:', error)
      // En caso de error, mantener amenities como array vacío
      setAmenities([])
    }
  }

  const fetchHotelAmenities = async (hotelId: string) => {
    try {
      const response = await fetch(`/api/hotels/${hotelId}/amenities`)
      if (response.ok) {
        const data = await response.json()
        setSelectedAmenities(data.map((a: any) => a.id))
      }
    } catch (error) {
      console.error('Error fetching hotel amenities:', error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleAmenityToggle = (amenityId: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenityId)
        ? prev.filter(id => id !== amenityId)
        : [...prev, amenityId]
    )
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    try {
      // TODO: Implementar upload a Cloudinary
      // Por ahora, simular upload
      setTimeout(() => {
        setFormData(prev => ({
          ...prev,
          logoUrl: URL.createObjectURL(file)
        }))
        setUploadingImage(false)
      }, 2000)
    } catch (error) {
      console.error('Error uploading image:', error)
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = '/api/hotels'
      const method = hotel ? 'PUT' : 'POST'
      
      // Preparar datos limpios para envío (sin código, se genera automáticamente)
      const cleanFormData = {
        name: formData.name,
        brand: formData.brand || null,
        description: formData.description || null,
        logoUrl: formData.logoUrl || null,
        address: formData.address || null,
        city: formData.city || null,
        country: formData.country || 'Guatemala',
        postalCode: formData.postalCode || null,
        latitude: formData.latitude || null,
        longitude: formData.longitude || null,
        wazeLink: formData.wazeLink || null,
        googleMapsLink: formData.googleMapsLink || null,
        phone: formData.phone || null,
        email: formData.email || null,
        website: formData.website || null,
        checkInTime: formData.checkInTime || null,
        checkOutTime: formData.checkOutTime || null,
        rating: formData.rating || 0,
        timezone: formData.timezone || 'America/Guatemala',
        isActive: formData.isActive,
        amenityIds: selectedAmenities
      }

      const body = hotel 
        ? { ...cleanFormData, id: hotel.id, code: formData.code } // Mantener código existente al editar
        : cleanFormData // Nuevo hotel: código se genera automáticamente

      console.log('Sending data:', body) // Debug

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        onSave()
        onClose()
      } else {
        const error = await response.json()
        console.error('API Error:', error)
        alert(error.error || 'Error procesando solicitud')
      }
    } catch (error) {
      console.error('Error saving hotel:', error)
      alert('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const getAmenityIcon = (icon?: string) => {
    switch (icon) {
      case 'wifi': return <Wifi className="h-4 w-4" />
      case 'parking': return <Car className="h-4 w-4" />
      case 'pool': return <Waves className="h-4 w-4" />
      case 'gym': return <Dumbbell className="h-4 w-4" />
      case 'restaurant': return <Coffee className="h-4 w-4" />
      case 'reception': return <Shield className="h-4 w-4" />
      default: return <Star className="h-4 w-4" />
    }
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>
          {hotel ? 'Editar Hotel' : 'Crear Nuevo Hotel'}
        </CardTitle>
        <CardDescription>
          Completa la información del hotel. Los campos marcados con * son obligatorios.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información Básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Básica</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Hotel *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Hotel Casa Antigua"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código del Hotel
              </label>
              <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-600">
                {formData.code || 'Se generará automáticamente'}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                El código se genera automáticamente basado en el nombre y ciudad
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Marca/Cadena
              </label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Antigua Hotels"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rating
              </label>
              <select
                name="rating"
                value={formData.rating}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={0}>Sin rating</option>
                <option value={1}>⭐ 1 estrella</option>
                <option value={2}>⭐⭐ 2 estrellas</option>
                <option value={3}>⭐⭐⭐ 3 estrellas</option>
                <option value={4}>⭐⭐⭐⭐ 4 estrellas</option>
                <option value={5}>⭐⭐⭐⭐⭐ 5 estrellas</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe el hotel, sus características principales y lo que lo hace especial..."
              />
            </div>
          </div>

          {/* Logo del Hotel */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Logo del Hotel</h3>
            <div className="flex items-center space-x-4">
              {formData.logoUrl && (
                <div className="w-20 h-20 border border-gray-300 rounded-lg overflow-hidden">
                  <img 
                    src={formData.logoUrl} 
                    alt="Logo del hotel"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="logo-upload"
                />
                <label htmlFor="logo-upload">
                  <Button type="button" variant="outline" asChild>
                    <span className="cursor-pointer">
                      {uploadingImage ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      ) : (
                        <Upload className="h-4 w-4 mr-2" />
                      )}
                      {uploadingImage ? 'Subiendo...' : 'Subir Logo'}
                    </span>
                  </Button>
                </label>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG hasta 2MB</p>
              </div>
            </div>
          </div>

          {/* Ubicación */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Ubicación
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección *
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Calle del Arco #30, Antigua Guatemala"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ciudad *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Antigua Guatemala"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  País
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Guatemala"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código Postal
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="03001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Latitud
                </label>
                <input
                  type="number"
                  step="any"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="14.5586"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Longitud
                </label>
                <input
                  type="number"
                  step="any"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="-90.7339"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link de Waze
                </label>
                <input
                  type="url"
                  name="wazeLink"
                  value={formData.wazeLink}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://waze.com/ul/..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link de Google Maps
                </label>
                <input
                  type="url"
                  name="googleMapsLink"
                  value={formData.googleMapsLink}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://maps.google.com/..."
                />
              </div>
            </div>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de Contacto</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+502-7832-0000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="reservas@hotel.com"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sitio Web
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://www.hotel.com"
                />
              </div>
            </div>
          </div>

          {/* Horarios */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Horarios del Hotel
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Check-in
                </label>
                <input
                  type="time"
                  name="checkInTime"
                  value={formData.checkInTime}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Check-out
                </label>
                <input
                  type="time"
                  name="checkOutTime"
                  value={formData.checkOutTime}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Zona Horaria
                </label>
                <select
                  name="timezone"
                  value={formData.timezone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="America/Guatemala">Guatemala (GMT-6)</option>
                  <option value="America/New_York">New York (GMT-5)</option>
                  <option value="America/Los_Angeles">Los Angeles (GMT-8)</option>
                  <option value="Europe/Madrid">Madrid (GMT+1)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Amenidades */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Amenidades del Hotel</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {Array.isArray(amenities) && amenities.map((amenity) => (
                <div
                  key={amenity.id}
                  onClick={() => handleAmenityToggle(amenity.id)}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedAmenities.includes(amenity.id)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {getAmenityIcon(amenity.icon)}
                    <span className="text-sm font-medium">{amenity.name}</span>
                  </div>
                  {amenity.description && (
                    <p className="text-xs text-gray-500 mt-1">{amenity.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Estado */}
          <div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Hotel activo (visible para reservaciones)
              </label>
            </div>
          </div>

          {/* Botones */}
          <div className="flex space-x-4 pt-6 border-t border-gray-200">
            <Button
              type="submit"
              disabled={loading}
              className="flex items-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {hotel ? 'Actualizar Hotel' : 'Crear Hotel'}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
