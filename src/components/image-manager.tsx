'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Upload, 
  Trash2, 
  Star, 
  Image as ImageIcon,
  X,
  Eye,
  Download
} from 'lucide-react'

interface EntityImage {
  id: string
  imageUrl: string
  cloudinaryPublicId?: string
  altText?: string
  isPrimary: boolean
  displayOrder: number
  createdAt: string
}

interface ImageManagerProps {
  entityType: 'HOTEL' | 'ROOM_TYPE' | 'ACTIVITY' | 'PACKAGE'
  entityId: string
  title?: string
  maxImages?: number
}

export function ImageManager({ 
  entityType, 
  entityId, 
  title = 'Imágenes',
  maxImages = 10 
}: ImageManagerProps) {
  const [images, setImages] = useState<EntityImage[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<EntityImage | null>(null)

  useEffect(() => {
    fetchImages()
  }, [entityType, entityId])

  const fetchImages = async () => {
    try {
      const response = await fetch(`/api/images?entityType=${entityType}&entityId=${entityId}`)
      if (response.ok) {
        const data = await response.json()
        setImages(data)
      }
    } catch (error) {
      console.error('Error fetching images:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (images.length >= maxImages) {
      alert(`Máximo ${maxImages} imágenes permitidas`)
      return
    }

    setUploading(true)

    try {
      // Upload a Cloudinary
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)
      uploadFormData.append('folder', `antigua-hotels/${entityType.toLowerCase()}`)

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      })

      if (!uploadResponse.ok) {
        const error = await uploadResponse.json()
        throw new Error(error.error || 'Error subiendo imagen')
      }

      const uploadResult = await uploadResponse.json()

      // Guardar en base de datos
      const imageResponse = await fetch('/api/images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entityType,
          entityId,
          imageUrl: uploadResult.url,
          cloudinaryPublicId: uploadResult.publicId,
          altText: file.name,
          isPrimary: images.length === 0, // Primera imagen es primaria por defecto
          displayOrder: images.length,
        }),
      })

      if (imageResponse.ok) {
        await fetchImages()
      } else {
        const error = await imageResponse.json()
        throw new Error(error.error || 'Error guardando imagen')
      }

    } catch (error) {
      console.error('Error uploading image:', error)
      alert(error instanceof Error ? error.message : 'Error subiendo imagen')
    } finally {
      setUploading(false)
      // Reset input
      e.target.value = ''
    }
  }

  const handleSetPrimary = async (imageId: string) => {
    try {
      // Actualizar imagen como primaria
      const response = await fetch('/api/images', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: imageId,
          isPrimary: true,
        }),
      })

      if (response.ok) {
        await fetchImages()
      }
    } catch (error) {
      console.error('Error setting primary image:', error)
    }
  }

  const handleDeleteImage = async (image: EntityImage) => {
    if (!confirm('¿Estás seguro de eliminar esta imagen?')) {
      return
    }

    try {
      const response = await fetch(`/api/images?id=${image.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchImages()
      } else {
        const error = await response.json()
        alert(error.error || 'Error eliminando imagen')
      }
    } catch (error) {
      console.error('Error deleting image:', error)
      alert('Error de conexión')
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <ImageIcon className="h-5 w-5 mr-2" />
            {title} ({images.length}/{maxImages})
          </CardTitle>
          
          {images.length < maxImages && (
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id={`image-upload-${entityId}`}
                disabled={uploading}
              />
              <label htmlFor={`image-upload-${entityId}`}>
                <Button type="button" variant="outline" asChild>
                  <span className="cursor-pointer">
                    {uploading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    {uploading ? 'Subiendo...' : 'Subir Imagen'}
                  </span>
                </Button>
              </label>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-8">
            <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No hay imágenes cargadas</p>
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id={`first-image-upload-${entityId}`}
              />
              <label htmlFor={`first-image-upload-${entityId}`}>
                <Button type="button" asChild>
                  <span className="cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
                    Subir Primera Imagen
                  </span>
                </Button>
              </label>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image) => (
              <div key={image.id} className="relative group">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={image.imageUrl}
                    alt={image.altText || 'Imagen'}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Overlay con acciones */}
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setSelectedImage(image)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    {!image.isPrimary && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleSetPrimary(image.id)}
                        title="Marcar como imagen principal"
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteImage(image)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Indicador de imagen primaria */}
                  {image.isPrimary && (
                    <div className="absolute top-2 left-2">
                      <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    </div>
                  )}
                </div>
                
                <p className="text-xs text-gray-600 mt-1 truncate">
                  {image.altText || 'Sin descripción'}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Modal de imagen */}
        {selectedImage && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="relative max-w-4xl max-h-full">
              <img
                src={selectedImage.imageUrl}
                alt={selectedImage.altText || 'Imagen'}
                className="max-w-full max-h-full object-contain"
              />
              
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4"
              >
                <X className="h-4 w-4" />
              </Button>
              
              <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white p-3 rounded">
                <p className="text-sm">{selectedImage.altText || 'Sin descripción'}</p>
                <p className="text-xs opacity-75">
                  {new Date(selectedImage.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}








