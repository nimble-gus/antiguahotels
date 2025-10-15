'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Upload, 
  Trash2, 
  Star, 
  Image as ImageIcon,
  ArrowLeft,
  Plus
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useToast } from '@/components/ui/use-toast'

interface RoomTypeImage {
  id: string
  imageUrl: string
  altText: string
  isPrimary: boolean
  displayOrder: number
  cloudinaryPublicId?: string
}

interface RoomType {
  id: string
  name: string
  hotel: {
    id: string
    name: string
  }
}

export default function RoomTypeImagesPage() {
  const { toast } = useToast()
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])
  const [selectedRoomType, setSelectedRoomType] = useState<RoomType | null>(null)
  const [images, setImages] = useState<RoomTypeImage[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  // Cargar tipos de habitación una sola vez
  useEffect(() => {
    const loadRoomTypes = async () => {
      try {
        const response = await fetch('/api/room-types')
        if (response.ok) {
          const data = await response.json()
          setRoomTypes(data)
        }
      } catch (error) {
        console.error('Error loading room types:', error)
        toast({
          title: 'Error',
          description: 'Error cargando tipos de habitación',
          variant: 'destructive'
        })
      } finally {
        setLoading(false)
      }
    }

    loadRoomTypes()
  }, []) // Removido toast de las dependencias

  // Cargar imágenes cuando se selecciona un tipo de habitación
  const loadImages = async (roomTypeId: string) => {
    try {
      const response = await fetch(`/api/room-types/${roomTypeId}/images`)
      if (response.ok) {
        const data = await response.json()
        setImages(data)
      }
    } catch (error) {
      console.error('Error loading images:', error)
      toast({
        title: 'Error',
        description: 'Error cargando imágenes',
        variant: 'destructive'
      })
    }
  }

  // Manejar selección de tipo de habitación
  const handleRoomTypeSelect = (roomType: RoomType) => {
    setSelectedRoomType(roomType)
    loadImages(roomType.id)
  }

  // Subir imagen
  const handleImageUpload = async (file: File) => {
    if (!selectedRoomType) return

    setUploading(true)
    try {
      // Subir a Cloudinary
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'room-types')

      const uploadResponse = await fetch('/api/upload/cloudinary-simple', {
        method: 'POST',
        body: formData
      })

      if (!uploadResponse.ok) {
        throw new Error('Error subiendo imagen')
      }

      const uploadData = await uploadResponse.json()

      // Guardar en base de datos
      const saveResponse = await fetch(`/api/room-types/${selectedRoomType.id}/images`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: uploadData.secure_url,
          cloudinaryPublicId: uploadData.public_id,
          altText: `Imagen de ${selectedRoomType.name}`,
          isPrimary: images.length === 0,
          displayOrder: images.length + 1
        }),
      })

      if (saveResponse.ok) {
        toast({
          title: 'Éxito',
          description: 'Imagen subida correctamente',
        })
        loadImages(selectedRoomType.id) // Recargar imágenes
      } else {
        throw new Error('Error guardando imagen')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      toast({
        title: 'Error',
        description: 'Error subiendo imagen',
        variant: 'destructive'
      })
    } finally {
      setUploading(false)
    }
  }

  // Establecer imagen principal
  const handleSetPrimary = async (imageId: string) => {
    try {
      const response = await fetch(`/api/room-types/images/${imageId}/primary`, {
        method: 'PUT',
      })

      if (response.ok) {
        toast({
          title: 'Éxito',
          description: 'Imagen principal actualizada',
        })
        loadImages(selectedRoomType!.id)
      } else {
        throw new Error('Error actualizando imagen principal')
      }
    } catch (error) {
      console.error('Error setting primary image:', error)
      toast({
        title: 'Error',
        description: 'Error actualizando imagen principal',
        variant: 'destructive'
      })
    }
  }

  // Eliminar imagen
  const handleDeleteImage = async (imageId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta imagen?')) return

    try {
      const response = await fetch(`/api/room-types/images/${imageId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast({
          title: 'Éxito',
          description: 'Imagen eliminada correctamente',
        })
        loadImages(selectedRoomType!.id)
      } else {
        throw new Error('Error eliminando imagen')
      }
    } catch (error) {
      console.error('Error deleting image:', error)
      toast({
        title: 'Error',
        description: 'Error eliminando imagen',
        variant: 'destructive'
      })
    }
  }

  // Manejar selección de archivo
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleImageUpload(file)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-antigua-purple mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando tipos de habitación...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/dashboard/hotels">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Imágenes de Habitaciones</h1>
          </div>
          <p className="text-gray-600">
            Gestiona las imágenes de los tipos de habitación usando Cloudinary
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista de Tipos de Habitación */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Tipos de Habitación
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {roomTypes.map((roomType) => (
                    <div
                      key={roomType.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedRoomType?.id === roomType.id
                          ? 'border-antigua-purple bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleRoomTypeSelect(roomType)}
                    >
                      <div className="font-medium text-gray-900">{roomType.name}</div>
                      <div className="text-sm text-gray-500">{roomType.hotel.name}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gestión de Imágenes */}
          <div className="lg:col-span-2">
            {selectedRoomType ? (
              <div className="space-y-6">
                {/* Header del Tipo de Habitación */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Imágenes de {selectedRoomType.name}</span>
                      <Badge variant="outline">{images.length} imágenes</Badge>
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      Hotel: {selectedRoomType.hotel.name}
                    </p>
                  </CardHeader>
                </Card>

                {/* Subir Nueva Imagen */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="h-5 w-5" />
                      Subir Nueva Imagen
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        disabled={uploading}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className={`cursor-pointer ${uploading ? 'cursor-not-allowed opacity-50' : ''}`}
                      >
                        {uploading ? (
                          <div className="space-y-2">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-antigua-purple mx-auto"></div>
                            <p className="text-sm text-gray-600">Subiendo imagen...</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                            <p className="text-sm text-gray-600">
                              Haz clic para subir una imagen
                            </p>
                            <p className="text-xs text-gray-500">
                              PNG, JPG, WEBP hasta 10MB
                            </p>
                          </div>
                        )}
                      </label>
                    </div>
                  </CardContent>
                </Card>

                {/* Lista de Imágenes */}
                <Card>
                  <CardHeader>
                    <CardTitle>Imágenes Actuales</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {images.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <ImageIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No hay imágenes para este tipo de habitación</p>
                        <p className="text-sm">Sube la primera imagen usando el formulario de arriba</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {images
                          .sort((a, b) => a.displayOrder - b.displayOrder)
                          .map((image, index) => (
                            <div key={image.id} className="relative group">
                              <div className="relative aspect-video rounded-lg overflow-hidden border">
                                <Image
                                  src={image.imageUrl}
                                  alt={image.altText}
                                  fill
                                  className="object-cover"
                                />
                                
                                {/* Badges */}
                                <div className="absolute top-2 left-2 flex gap-1">
                                  {image.isPrimary && (
                                    <Badge className="bg-yellow-500 text-white">
                                      <Star className="h-3 w-3 mr-1" />
                                      Principal
                                    </Badge>
                                  )}
                                  <Badge variant="secondary">
                                    #{index + 1}
                                  </Badge>
                                </div>

                                {/* Actions */}
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <div className="flex gap-1">
                                    {!image.isPrimary && (
                                      <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={() => handleSetPrimary(image.id)}
                                        className="h-8 w-8 p-0"
                                      >
                                        <Star className="h-4 w-4" />
                                      </Button>
                                    )}
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => handleDeleteImage(image.id)}
                                      className="h-8 w-8 p-0"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="mt-2">
                                <p className="text-sm text-gray-600 truncate">{image.altText}</p>
                                <span className="text-xs text-gray-500">
                                  Orden: {image.displayOrder}
                                </span>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <ImageIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500">Selecciona un tipo de habitación para gestionar sus imágenes</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}