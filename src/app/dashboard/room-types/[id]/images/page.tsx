'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CloudinaryImageManager } from '@/components/cloudinary-image-manager'
import { ArrowLeft, Image as ImageIcon } from 'lucide-react'

interface RoomType {
  id: string
  name: string
  description?: string
  hotel: {
    name: string
  }
}

export default function RoomTypeImagesPage() {
  const params = useParams()
  const router = useRouter()
  const roomTypeId = params.id as string

  const [roomType, setRoomType] = useState<RoomType | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRoomType()
  }, [roomTypeId])

  const fetchRoomType = async () => {
    try {
      const response = await fetch(`/api/room-types/${roomTypeId}`)
      if (response.ok) {
        const data = await response.json()
        setRoomType(data)
      }
    } catch (error) {
      console.error('Error fetching room type:', error)
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

  if (!roomType) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Tipo de habitación no encontrado</h2>
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
            <h1 className="text-3xl font-bold text-gray-900">Imágenes - {roomType.name}</h1>
            <p className="text-gray-600">
              {roomType.hotel.name} • Gestión de imágenes del tipo de habitación
            </p>
          </div>
        </div>
      </div>

      {/* Room Type Info */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <ImageIcon className="h-8 w-8 text-blue-500" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{roomType.name}</h3>
              <p className="text-gray-600">{roomType.description || 'Sin descripción'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Image Manager */}
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Imágenes</CardTitle>
          <CardDescription>
            Sube y gestiona las imágenes para este tipo de habitación
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CloudinaryImageManager
            entityType="ROOM_TYPE"
            entityId={roomTypeId}
          />
        </CardContent>
      </Card>
    </div>
  )
}








