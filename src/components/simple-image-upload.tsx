'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, Trash2, Star, Image as ImageIcon } from 'lucide-react'

interface SimpleImageUploadProps {
  entityType: 'HOTEL' | 'ROOM_TYPE' | 'ROOM' | 'ACTIVITY' | 'PACKAGE'
  entityId: string
  title?: string
  onImageUploaded?: () => void
}

export function SimpleImageUpload({ 
  entityType, 
  entityId, 
  title = 'Imágenes',
  onImageUploaded
}: SimpleImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [images, setImages] = useState<string[]>([])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)

    try {
      // Por ahora, crear URL temporal para mostrar la imagen
      const tempUrl = URL.createObjectURL(file)
      setImages(prev => [...prev, tempUrl])
      
      // TODO: Implementar upload real a Cloudinary
      console.log('Uploading image for:', { entityType, entityId, fileName: file.name })
      
      if (onImageUploaded) {
        onImageUploaded()
      }

    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Error subiendo imagen')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <ImageIcon className="h-5 w-5 mr-2" />
            {title}
          </CardTitle>
          
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
                  {uploading ? 'Subiendo...' : 'Subir Imagen'}
                </span>
              </Button>
            </label>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {images.length === 0 ? (
          <div className="text-center py-8">
            <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No hay imágenes cargadas</p>
            <p className="text-sm text-gray-400">
              Sube imágenes para mostrar este {entityType.toLowerCase()}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((imageUrl, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={imageUrl}
                    alt={`Imagen ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setImages(prev => prev.filter((_, i) => i !== index))
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">💡 Próximamente:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Integración completa con Cloudinary</li>
            <li>• Gestión de imágenes primarias</li>
            <li>• Reordenamiento por drag & drop</li>
            <li>• Optimización automática de imágenes</li>
            <li>• Alt text y metadatos</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
