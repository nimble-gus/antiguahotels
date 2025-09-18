'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CloudinaryImageManager } from '@/components/cloudinary-image-manager'
import { 
  Hotel, 
  Bed, 
  MapPin,
  Package,
  Image as ImageIcon,
  ExternalLink,
  Plus
} from 'lucide-react'

interface Hotel {
  id: string
  name: string
  code?: string
  city?: string
}

interface RoomType {
  id: string
  hotelId: string
  name: string
  hotel: {
    name: string
    code?: string
  }
}

export default function ImagesPage() {
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState<'hotels' | 'room-types'>('hotels')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const hotelsResponse = await fetch('/api/hotels?limit=100')
      if (hotelsResponse.ok) {
        const hotelsData = await hotelsResponse.json()
        setHotels(hotelsData.hotels)
        
        // Obtener todos los tipos de habitación
        const roomTypesPromises = hotelsData.hotels.map((hotel: Hotel) =>
          fetch(`/api/hotels/${hotel.id}/room-types`)
        )
        
        const roomTypesResponses = await Promise.all(roomTypesPromises)
        const allRoomTypes: RoomType[] = []
        
        for (let i = 0; i < roomTypesResponses.length; i++) {
          if (roomTypesResponses[i].ok) {
            const roomTypesData = await roomTypesResponses[i].json()
            const roomTypesWithHotel = roomTypesData.map((rt: any) => ({
              ...rt,
              hotel: {
                name: hotelsData.hotels[i].name,
                code: hotelsData.hotels[i].code,
              }
            }))
            allRoomTypes.push(...roomTypesWithHotel)
          }
        }
        
        setRoomTypes(allRoomTypes)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Imágenes</h1>
        <p className="text-gray-600">
          Administra las imágenes de hoteles, habitaciones, actividades y paquetes
        </p>
      </div>

      {/* Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveSection('hotels')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeSection === 'hotels'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Hotel className="h-4 w-4 inline mr-2" />
            Hoteles ({hotels.length})
          </button>
          <button
            onClick={() => setActiveSection('room-types')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeSection === 'room-types'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Bed className="h-4 w-4 inline mr-2" />
            Tipos de Habitación ({roomTypes.length})
          </button>
        </nav>
      </div>

      {/* Hotels Section */}
      {activeSection === 'hotels' && (
        <div className="space-y-6">
          {hotels.map((hotel) => (
            <div key={hotel.id}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Hotel className="h-5 w-5 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-900">
                    {hotel.name}
                  </h2>
                  {hotel.code && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      {hotel.code}
                    </span>
                  )}
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a href={`/dashboard/hotels/${hotel.id}`}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Ver Hotel
                  </a>
                </Button>
              </div>
              
              <CloudinaryImageManager
                entityType="HOTEL"
                entityId={hotel.id}
                title={`Imágenes de ${hotel.name}`}
                maxImages={15}
              />
            </div>
          ))}

          {hotels.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center">
                <Hotel className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay hoteles</h3>
                <p className="text-gray-500 mb-4">
                  Primero crea hoteles para poder gestionar sus imágenes.
                </p>
                <Button asChild>
                  <a href="/dashboard/hotels">
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Hotel
                  </a>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Room Types Section */}
      {activeSection === 'room-types' && (
        <div className="space-y-6">
          {roomTypes.map((roomType) => (
            <div key={roomType.id}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Bed className="h-5 w-5 text-purple-600" />
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {roomType.name}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {roomType.hotel.name} {roomType.hotel.code && `(${roomType.hotel.code})`}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a href={`/dashboard/hotels/${roomType.hotelId}`}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Ver Hotel
                  </a>
                </Button>
              </div>
              
              <CloudinaryImageManager
                entityType="ROOM_TYPE"
                entityId={roomType.id}
                title={`Imágenes de ${roomType.name}`}
                maxImages={8}
              />
            </div>
          ))}

          {roomTypes.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center">
                <Bed className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay tipos de habitación</h3>
                <p className="text-gray-500 mb-4">
                  Primero crea hoteles y tipos de habitación para gestionar sus imágenes.
                </p>
                <Button asChild>
                  <a href="/dashboard/hotels">
                    <Hotel className="h-4 w-4 mr-2" />
                    Ir a Hoteles
                  </a>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
