'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import SimpleImageUpload from '@/components/simple-image-upload'
import { ArrowLeft, Hotel, Bed } from 'lucide-react'

interface Hotel {
  id: string
  name: string
  code?: string
}

interface RoomType {
  id: string
  name: string
  description?: string
  _count: {
    rooms: number
  }
}

export default function HotelImagesPage() {
  const params = useParams()
  const router = useRouter()
  const hotelId = params.id as string

  const [hotel, setHotel] = useState<Hotel | null>(null)
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [hotelId])

  const fetchData = async () => {
    try {
      const [hotelResponse, roomTypesResponse] = await Promise.all([
        fetch(`/api/hotels?id=${hotelId}`),
        fetch(`/api/hotels/${hotelId}/room-types`)
      ])

      if (hotelResponse.ok) {
        const hotelData = await hotelResponse.json()
        setHotel(hotelData.hotels[0] || null)
      }

      if (roomTypesResponse.ok) {
        const roomTypesData = await roomTypesResponse.json()
        setRoomTypes(roomTypesData)
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

  if (!hotel) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Hotel no encontrado</h2>
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
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Gestión de Imágenes
          </h1>
          <p className="text-gray-600">
            {hotel.name} {hotel.code && `(${hotel.code})`}
          </p>
        </div>
      </div>

      {/* Imágenes del Hotel */}
      <SimpleImageUpload
        onUploadComplete={(imageUrl, publicId) => {
          console.log('Imagen subida:', imageUrl, publicId)
        }}
        onUploadError={(error) => {
          console.error('Error al subir imagen:', error)
        }}
      />

      {/* Imágenes por Tipo de Habitación */}
      {roomTypes.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            <Bed className="h-5 w-5 text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-900">
              Imágenes por Tipo de Habitación
            </h2>
          </div>

          {roomTypes.map((roomType) => (
            <SimpleImageUpload
              key={roomType.id}
              onUploadComplete={(imageUrl, publicId) => {
                console.log('Imagen subida:', imageUrl, publicId)
              }}
              onUploadError={(error) => {
                console.error('Error al subir imagen:', error)
              }}
            />
          ))}
        </div>
      )}

      {roomTypes.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <Bed className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay tipos de habitación
            </h3>
            <p className="text-gray-500 mb-4">
              Primero crea tipos de habitación para poder agregar sus imágenes.
            </p>
            <Button onClick={() => router.push(`/dashboard/hotels/${hotelId}`)}>
              Ir a Tipos de Habitación
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Información útil */}
      <Card>
        <CardHeader>
          <CardTitle>💡 Consejos para Imágenes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Imágenes del Hotel</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Fachada del hotel</li>
                <li>• Lobby y áreas comunes</li>
                <li>• Piscina, restaurante, gym</li>
                <li>• Vistas exteriores</li>
                <li>• Amenidades generales</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Imágenes de Habitaciones</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Vista general de la habitación</li>
                <li>• Cama y área de descanso</li>
                <li>• Baño y amenidades</li>
                <li>• Balcón o vistas (si aplica)</li>
                <li>• Detalles únicos del tipo</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-yellow-50 rounded-md">
            <p className="text-sm text-yellow-800">
              <strong>Nota:</strong> Por ahora las imágenes se muestran temporalmente. 
              La integración completa con Cloudinary estará disponible próximamente.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}








