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
  Edit3,
  Move,
  Download,
  Check
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

interface CloudinaryImageManagerProps {
  entityType: 'HOTEL' | 'ROOM_TYPE' | 'ROOM' | 'ACTIVITY' | 'PACKAGE'
  entityId: string
  title?: string
  maxImages?: number
  onImagesChange?: () => void
}

export function CloudinaryImageManager({ 
  entityType, 
  entityId, 
  title = 'Imágenes',
  maxImages = 10,
  onImagesChange
}: CloudinaryImageManagerProps) {
  const [images, setImages] = useState<EntityImage[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<EntityImage | null>(null)
  const [editingAltText, setEditingAltText] = useState<string | null>(null)
  const [tempAltText, setTempAltText] = useState('')

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

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      alert('Solo se permiten archivos de imagen')
      return
    }

    // Validar tamaño (5MB máximo)
    if (file.size > 5 * 1024 * 1024) {
      alert('El archivo es demasiado grande. Máximo 5MB')
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
          altText: file.name.replace(/\.[^/.]+$/, ""), // Remover extensión
          isPrimary: images.length === 0, // Primera imagen es primaria por defecto
          displayOrder: images.length,
        }),
      })

      if (imageResponse.ok) {
        await fetchImages()
        if (onImagesChange) onImagesChange()
      } else {
        const error = await imageResponse.json()
        throw new Error(error.error || 'Error guardando imagen')
      }

    } catch (error) {
      console.error('Error uploading image:', error)
      alert(error instanceof Error ? error.message : 'Error subiendo imagen')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleSetPrimary = async (imageId: string) => {
    try {
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
        if (onImagesChange) onImagesChange()
      }
    } catch (error) {
      console.error('Error setting primary image:', error)
    }
  }

  const handleUpdateAltText = async (imageId: string, newAltText: string) => {
    try {
      const response = await fetch('/api/images', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: imageId,
          altText: newAltText,
        }),
      })

      if (response.ok) {
        await fetchImages()
        setEditingAltText(null)
        setTempAltText('')
        if (onImagesChange) onImagesChange()
      }
    } catch (error) {
      console.error('Error updating alt text:', error)
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
        if (onImagesChange) onImagesChange()
      } else {
        const error = await response.json()
        alert(error.error || 'Error eliminando imagen')
      }
    } catch (error) {
      console.error('Error deleting image:', error)
      alert('Error de conexión')
    }
  }

  const getOptimizedUrl = (url: string, width?: number, height?: number) => {
    // Si es una URL de Cloudinary, optimizar
    if (url.includes('cloudinary.com')) {
      const parts = url.split('/upload/')
      if (parts.length === 2) {
        const transformations = []
        if (width) transformations.push(`w_${width}`)
        if (height) transformations.push(`h_${height}`)
        transformations.push('c_fill', 'q_auto', 'f_webp')
        
        return `${parts[0]}/upload/${transformations.join(',')}/${parts[1]}`
      }
    }
    return url
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
                id={`image-upload-${entityType}-${entityId}`}
                disabled={uploading}
              />
              <label htmlFor={`image-upload-${entityType}-${entityId}`}>
                <Button type="button" variant="outline" asChild>
                  <span className="cursor-pointer">
                    {uploading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    {uploading ? 'Subiendo a Cloudinary...' : 'Subir Imagen'}
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
            <p className="text-sm text-gray-400 mb-4">
              Las imágenes se subirán automáticamente a Cloudinary y se optimizarán
            </p>
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id={`first-image-upload-${entityType}-${entityId}`}
                disabled={uploading}
              />
              <label htmlFor={`first-image-upload-${entityType}-${entityId}`}>
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
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-transparent group-hover:border-blue-200 transition-colors">
                  <img
                    src={getOptimizedUrl(image.imageUrl, 300, 300)}
                    alt={image.altText || 'Imagen'}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  
                  {/* Overlay con acciones */}
                  <div className="absolute inset-0 bg-black bg-opacity-60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="flex flex-wrap gap-1 justify-center">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setSelectedImage(image)}
                        title="Ver imagen completa"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setEditingAltText(image.id)
                          setTempAltText(image.altText || '')
                        }}
                        title="Editar descripción"
                      >
                        <Edit3 className="h-3 w-3" />
                      </Button>
                      
                      {!image.isPrimary && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleSetPrimary(image.id)}
                          title="Marcar como imagen principal"
                        >
                          <Star className="h-3 w-3" />
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteImage(image)}
                        title="Eliminar imagen"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Indicadores */}
                  <div className="absolute top-2 left-2 flex space-x-1">
                    {image.isPrimary && (
                      <div className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                        <Star className="h-3 w-3 mr-1 fill-current" />
                        Principal
                      </div>
                    )}
                  </div>

                  {/* Indicador de Cloudinary */}
                  {image.cloudinaryPublicId && (
                    <div className="absolute top-2 right-2">
                      <div className="bg-green-500 text-white p-1 rounded-full">
                        <Check className="h-3 w-3" />
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Alt text editable */}
                {editingAltText === image.id ? (
                  <div className="mt-2 flex space-x-1">
                    <input
                      type="text"
                      value={tempAltText}
                      onChange={(e) => setTempAltText(e.target.value)}
                      className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                      placeholder="Descripción de la imagen"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleUpdateAltText(image.id, tempAltText)
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleUpdateAltText(image.id, tempAltText)}
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingAltText(null)
                        setTempAltText('')
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <p className="text-xs text-gray-600 mt-1 truncate" title={image.altText}>
                    {image.altText || 'Sin descripción'}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Información de Cloudinary */}
        <div className="mt-6 p-4 bg-green-50 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
              <Check className="h-3 w-3 text-white" />
            </div>
            <h4 className="font-medium text-green-900">Sistema Cloudinary Activo</h4>
          </div>
          <ul className="text-sm text-green-800 space-y-1">
            <li>✅ Upload automático a Cloudinary</li>
            <li>✅ Optimización automática (WebP, calidad auto)</li>
            <li>✅ Múltiples tamaños generados</li>
            <li>✅ CDN global para carga rápida</li>
            <li>✅ Gestión de imagen principal</li>
            <li>✅ Eliminación segura</li>
          </ul>
        </div>

        {/* Modal de imagen completa */}
        {selectedImage && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50">
            <div className="relative max-w-6xl max-h-full">
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
              
              <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 text-white p-4 rounded-lg max-w-md">
                <div className="flex items-center space-x-2 mb-2">
                  {selectedImage.isPrimary && (
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  )}
                  <span className="text-sm font-medium">
                    {selectedImage.isPrimary ? 'Imagen Principal' : 'Imagen Secundaria'}
                  </span>
                </div>
                <p className="text-sm">{selectedImage.altText || 'Sin descripción'}</p>
                <p className="text-xs opacity-75 mt-1">
                  Subida: {new Date(selectedImage.createdAt).toLocaleDateString()}
                </p>
                {selectedImage.cloudinaryPublicId && (
                  <p className="text-xs opacity-75">
                    ID: {selectedImage.cloudinaryPublicId}
                  </p>
                )}
              </div>

              {/* Acciones de imagen */}
              <div className="absolute top-4 left-4 flex space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  asChild
                >
                  <a 
                    href={selectedImage.imageUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    download
                  >
                    <Download className="h-4 w-4" />
                  </a>
                </Button>
                
                {!selectedImage.isPrimary && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleSetPrimary(selectedImage.id)}
                  >
                    <Star className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
