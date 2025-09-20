'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { 
  Image as ImageIcon, 
  Plus, 
  Edit, 
  Trash2, 
  Upload, 
  Eye,
  Settings,
  Save,
  X
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import CloudinaryUpload from '@/components/cloudinary-upload'

interface WebsiteImage {
  id: string
  imageKey: string
  title: string
  description?: string
  imageUrl: string
  cloudinaryPublicId: string
  altText?: string
  isActive: boolean
  sortOrder: number
  pageSection: string
  pageType: string
  createdAt: string
  updatedAt: string
}

export default function WebsiteImagesPage() {
  const { toast } = useToast()
  const [images, setImages] = useState<WebsiteImage[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('hero')
  const [showForm, setShowForm] = useState(false)
  const [editingImage, setEditingImage] = useState<WebsiteImage | null>(null)
  const [uploading, setUploading] = useState(false)

  const [formData, setFormData] = useState({
    imageKey: '',
    title: '',
    description: '',
    imageUrl: '',
    cloudinaryPublicId: '',
    altText: '',
    isActive: true,
    sortOrder: 0,
    pageSection: 'hero',
    pageType: 'home'
  })

  useEffect(() => {
    fetchImages()
  }, [activeTab])

  const fetchImages = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/website-images?pageSection=${activeTab}`)
      if (response.ok) {
        const data = await response.json()
        setImages(data.images)
      } else {
        toast({
          title: 'Error',
          description: 'Error cargando imágenes',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error fetching images:', error)
      toast({
        title: 'Error',
        description: 'Error cargando imágenes',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const resetForm = () => {
    setFormData({
      imageKey: '',
      title: '',
      description: '',
      imageUrl: '',
      cloudinaryPublicId: '',
      altText: '',
      isActive: true,
      sortOrder: 0,
      pageSection: activeTab,
      pageType: 'home'
    })
    setEditingImage(null)
    setShowForm(false)
  }

  const handleSave = async () => {
    try {
      setUploading(true)
      
      const url = editingImage 
        ? `/api/website-images?id=${editingImage.id}`
        : '/api/website-images'
      
      const method = editingImage ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast({
          title: 'Éxito',
          description: editingImage ? 'Imagen actualizada' : 'Imagen creada',
        })
        resetForm()
        fetchImages()
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Error guardando imagen',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error saving image:', error)
      toast({
        title: 'Error',
        description: 'Error guardando imagen',
        variant: 'destructive'
      })
    } finally {
      setUploading(false)
    }
  }

  const handleEdit = (image: WebsiteImage) => {
    setFormData({
      imageKey: image.imageKey,
      title: image.title,
      description: image.description || '',
      imageUrl: image.imageUrl,
      cloudinaryPublicId: image.cloudinaryPublicId,
      altText: image.altText || '',
      isActive: image.isActive,
      sortOrder: image.sortOrder,
      pageSection: image.pageSection,
      pageType: image.pageType
    })
    setEditingImage(image)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta imagen?')) {
      return
    }

    try {
      const response = await fetch(`/api/website-images?id=${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: 'Éxito',
          description: 'Imagen eliminada',
        })
        fetchImages()
      } else {
        toast({
          title: 'Error',
          description: 'Error eliminando imagen',
          variant: 'destructive'
        })
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

  const pageSections = [
    { key: 'hero', name: 'Hero Section', description: 'Imágenes principales de cada página' },
    { key: 'gallery', name: 'Galería', description: 'Imágenes de galería' },
    { key: 'about', name: 'Sobre Nosotros', description: 'Imágenes de la sección about' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Imágenes del Sitio Web</h1>
          <p className="text-gray-600">Gestiona las imágenes del sitio web público</p>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Imagen
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          {pageSections.map(section => (
            <TabsTrigger key={section.key} value={section.key}>
              {section.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {pageSections.map(section => (
          <TabsContent key={section.key} value={section.key}>
            <Card>
              <CardHeader>
                <CardTitle>{section.name}</CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {images
                    .filter(img => img.pageSection === section.key)
                    .map(image => (
                      <Card key={image.id} className="overflow-hidden">
                        <div className="relative h-48">
                          <img
                            src={image.imageUrl}
                            alt={image.altText || image.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 right-2 flex space-x-1">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => window.open(image.imageUrl, '_blank')}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleEdit(image)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(image.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          {!image.isActive && (
                            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs">
                              Inactiva
                            </div>
                          )}
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-lg mb-2">{image.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">{image.imageKey}</p>
                          <p className="text-sm text-gray-500 line-clamp-2">
                            {image.description}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  
                  {images.filter(img => img.pageSection === section.key).length === 0 && (
                    <div className="col-span-full text-center py-12">
                      <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No hay imágenes en esta sección</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                {editingImage ? 'Editar Imagen' : 'Nueva Imagen'}
                <Button variant="ghost" onClick={resetForm}>
                  <X className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="imageKey">Clave de Imagen *</Label>
                  <Input
                    id="imageKey"
                    value={formData.imageKey}
                    onChange={(e) => handleInputChange('imageKey', e.target.value)}
                    placeholder="ej: hero_home, hero_accommodations"
                    disabled={editingImage !== null}
                  />
                </div>
                <div>
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Título descriptivo"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Descripción de la imagen"
                  rows={3}
                />
              </div>

              {/* Cloudinary Upload */}
              <div>
                <Label>Subir Imagen a Cloudinary</Label>
                <CloudinaryUpload
                  onUploadComplete={(imageUrl, publicId) => {
                    handleInputChange('imageUrl', imageUrl)
                    handleInputChange('cloudinaryPublicId', publicId)
                  }}
                  onUploadError={(error) => {
                    toast({
                      title: 'Error',
                      description: error,
                      variant: 'destructive'
                    })
                  }}
                  className="mt-2"
                />
              </div>

              {/* Manual URL Input (fallback) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="imageUrl">URL de Imagen *</Label>
                  <Input
                    id="imageUrl"
                    value={formData.imageUrl}
                    onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                    placeholder="https://res.cloudinary.com/..."
                  />
                </div>
                <div>
                  <Label htmlFor="cloudinaryPublicId">Cloudinary Public ID *</Label>
                  <Input
                    id="cloudinaryPublicId"
                    value={formData.cloudinaryPublicId}
                    onChange={(e) => handleInputChange('cloudinaryPublicId', e.target.value)}
                    placeholder="antigua-hero-main"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="altText">Texto Alternativo</Label>
                <Input
                  id="altText"
                  value={formData.altText}
                  onChange={(e) => handleInputChange('altText', e.target.value)}
                  placeholder="Texto para accesibilidad"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="pageSection">Sección</Label>
                  <select
                    id="pageSection"
                    value={formData.pageSection}
                    onChange={(e) => handleInputChange('pageSection', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="hero">Hero Section</option>
                    <option value="gallery">Galería</option>
                    <option value="about">Sobre Nosotros</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="pageType">Tipo de Página</Label>
                  <select
                    id="pageType"
                    value={formData.pageType}
                    onChange={(e) => handleInputChange('pageType', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="home">Inicio</option>
                    <option value="accommodations">Alojamientos</option>
                    <option value="activities">Actividades</option>
                    <option value="packages">Paquetes</option>
                    <option value="shuttle">Shuttle</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="sortOrder">Orden</Label>
                  <Input
                    id="sortOrder"
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => handleInputChange('sortOrder', parseInt(e.target.value))}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                />
                <Label htmlFor="isActive">Imagen Activa</Label>
              </div>

              <div className="flex justify-end space-x-4">
                <Button variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSave}
                  disabled={uploading}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {uploading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {uploading ? 'Guardando...' : 'Guardar'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
