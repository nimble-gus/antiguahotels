'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  ArrowLeft,
  Upload, 
  Star,
  Trash2,
  Edit,
  Eye,
  ImageIcon,
  Plus
} from 'lucide-react'
import CloudinaryUpload from '@/components/cloudinary-upload'
import { useToast } from '@/components/ui/use-toast'

interface ActivityImage {
  id: string
  imageUrl: string
  altText?: string
  isPrimary: boolean
  sortOrder: number
  cloudinaryPublicId: string
  createdAt: string
}

interface Activity {
  id: string
  name: string
  description?: string
}

export default function ActivityImagesPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const activityId = params.id as string
  
  const [activity, setActivity] = useState<Activity | null>(null)
  const [images, setImages] = useState<ActivityImage[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showUploader, setShowUploader] = useState(false)

  useEffect(() => {
    fetchActivity()
    fetchImages()
  }, [activityId])

  const fetchActivity = async () => {
    try {
      const response = await fetch(`/api/activities?id=${activityId}`)
      if (response.ok) {
        const data = await response.json()
        setActivity(data.activity)
      }
    } catch (error) {
      console.error('Error fetching activity:', error)
    }
  }

  const fetchImages = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/activities/${activityId}/images-db`)
      if (response.ok) {
        const data = await response.json()
        setImages(data.images)
      }
    } catch (error) {
      console.error('Error fetching images:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (imageUrl: string, publicId: string) => {
    try {
      setUploading(true)
      
      const response = await fetch(`/api/activities/${activityId}/images-db`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl,
          cloudinaryPublicId: publicId,
          altText: `${activity?.name} - Imagen`,
          isPrimary: images.length === 0, // Primera imagen es principal por defecto
          sortOrder: images.length + 1
        })
      })

      if (response.ok) {
        toast({
          title: 'Éxito',
          description: 'Imagen subida exitosamente'
        })
        setShowUploader(false)
        await fetchImages()
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Error subiendo imagen')
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    } finally {
      setUploading(false)
    }
  }

  const handleSetPrimary = async (imageId: string) => {
    try {
      const response = await fetch(`/api/activities/${activityId}/images-db/${imageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ setPrimary: true })
      })

      if (response.ok) {
        toast({
          title: 'Éxito',
          description: 'Imagen principal actualizada'
        })
        await fetchImages()
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Error actualizando imagen principal')
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    }
  }

  const handleDeleteImage = async (imageId: string, cloudinaryPublicId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta imagen?')) return

    try {
      const response = await fetch(`/api/activities/${activityId}/images-db/${imageId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: 'Éxito',
          description: 'Imagen eliminada exitosamente'
        })
        await fetchImages()
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Error eliminando imagen')
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Gestión de Imágenes
            </h1>
            <p className="text-gray-600">
              {activity?.name || 'Cargando...'}
            </p>
          </div>
        </div>
        
        <Button 
          onClick={() => setShowUploader(true)}
          className="bg-antigua-purple hover:bg-antigua-purple-dark"
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar Imagen
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <ImageIcon className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Total de Imágenes</p>
                <p className="text-2xl font-bold">{images.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">Imagen Principal</p>
                <p className="text-2xl font-bold">
                  {images.find(img => img.isPrimary) ? '✓' : '-'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Galería</p>
                <p className="text-2xl font-bold">{Math.max(0, images.length - 1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gallery */}
      <Card>
        <CardHeader>
          <CardTitle>Galería de Imágenes</CardTitle>
          <CardDescription>
            Gestiona las imágenes de esta actividad. La imagen principal aparecerá en las tarjetas y listados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-antigua-purple mx-auto"></div>
              <p className="mt-2 text-gray-600">Cargando imágenes...</p>
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-lg text-gray-600 mb-2">No hay imágenes</p>
              <p className="text-sm text-gray-500 mb-4">Agrega la primera imagen para esta actividad</p>
              <Button 
                onClick={() => setShowUploader(true)}
                className="bg-antigua-purple hover:bg-antigua-purple-dark"
              >
                <Upload className="h-4 w-4 mr-2" />
                Subir Primera Imagen
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {images.map((image) => (
                <Card key={image.id} className={`overflow-hidden relative ${image.isPrimary ? 'ring-2 ring-antigua-purple' : ''}`}>
                  {image.isPrimary && (
                    <div className="absolute top-2 left-2 z-10 bg-antigua-purple text-white px-2 py-1 rounded-full text-xs font-medium flex items-center shadow-lg">
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      Principal
                    </div>
                  )}
                  
                  <div className="relative h-48 w-full">
                    <Image
                      src={image.imageUrl}
                      alt={image.altText || 'Imagen de actividad'}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">
                          {image.altText || 'Sin descripción'}
                        </p>
                        <p className="text-xs text-gray-500">
                          Orden: {image.sortOrder}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      {!image.isPrimary && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetPrimary(image.id)}
                        >
                          <Star className="h-3 w-3 mr-1" />
                          Hacer Principal
                        </Button>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteImage(image.id, image.cloudinaryPublicId)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Modal */}
      {showUploader && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Subir Nueva Imagen</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setShowUploader(false)}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <CloudinaryUpload
                onUploadComplete={handleImageUpload}
                onUploadError={(error) => {
                  toast({
                    title: 'Error',
                    description: error,
                    variant: 'destructive'
                  })
                }}
                disabled={uploading}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
