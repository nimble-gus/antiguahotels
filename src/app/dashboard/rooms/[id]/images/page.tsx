'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CloudinaryImageManager } from '@/components/cloudinary-image-manager'
import { ArrowLeft, Bed, Hotel, Hash } from 'lucide-react'

interface Room {
  id: string
  code: string
  floorNumber?: number
  isActive: boolean
  hotel: {
    id: string
    name: string
    code?: string
  }
  roomType: {
    id: string
    name: string
    baseRate: string
    occupancy: number
    bedConfiguration?: string
  }
}

export default function RoomImagesPage() {
  const params = useParams()
  const router = useRouter()
  const roomId = params.id as string

  const [room, setRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRoomData()
  }, [roomId])

  const fetchRoomData = async () => {
    try {
      const response = await fetch(`/api/rooms/${roomId}`)
      if (response.ok) {
        const data = await response.json()
        setRoom(data)
      }
    } catch (error) {
      console.error('Error fetching room data:', error)
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

  if (!room) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Habitación no encontrada</h2>
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
            Imágenes - Habitación {room.code}
          </h1>
          <p className="text-gray-600">
            {room.hotel.name} • {room.roomType.name}
          </p>
        </div>
      </div>

      {/* Room Info */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <Hotel className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-600">
                {room.hotel.name} {room.hotel.code && `(${room.hotel.code})`}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Bed className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-600">{room.roomType.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Hash className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-600">
                Habitación {room.code}
                {room.floorNumber && ` - Piso ${room.floorNumber}`}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                room.isActive 
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {room.isActive ? 'Activa' : 'Inactiva'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gestión de Imágenes Específicas de esta Habitación */}
      <CloudinaryImageManager
        entityType="ROOM"
        entityId={roomId}
        title={`Imágenes Específicas - Habitación ${room.code}`}
        maxImages={6}
      />

      {/* Información Útil */}
      <Card>
        <CardHeader>
          <CardTitle>💡 Gestión de Imágenes por Habitación</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Imágenes de Habitación Individual</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Vista específica de ESTA habitación</li>
                <li>• Características únicas (vista, ubicación)</li>
                <li>• Estado actual de la habitación</li>
                <li>• Detalles específicos del espacio</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">vs. Imágenes del Tipo</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Imágenes generales del tipo &quot;{room.roomType.name}&quot;</li>
                <li>• Representan todas las habitaciones del tipo</li>
                <li>• Se usan en catálogos y búsquedas</li>
                <li>• Características comunes del tipo</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Recomendación:</strong> Usa imágenes del tipo para el catálogo general, 
              e imágenes específicas para mostrar detalles únicos de habitaciones premium o con vistas especiales.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}








