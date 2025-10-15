'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, X, Image as ImageIcon, Check, Scissors } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import ImageCropEditor from './image-crop-editor'

interface CloudinaryUploadProps {
  onUploadComplete: (imageUrl: string, publicId: string) => void
  onUploadError?: (error: string) => void
  className?: string
  disabled?: boolean
  folder?: string
}

export default function CloudinaryUpload({
  onUploadComplete,
  onUploadError,
  className = '',
  disabled = false,
  folder = 'website-images'
}: CloudinaryUploadProps) {
  const { toast } = useToast()
  const [uploading, setUploading] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [uploadedPublicId, setUploadedPublicId] = useState<string | null>(null)
  const [showCropEditor, setShowCropEditor] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validaciones
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Error',
        description: 'Solo se permiten archivos de imagen',
        variant: 'destructive'
      })
      return
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB
      toast({
        title: 'Error',
        description: 'El archivo no puede ser mayor a 10MB',
        variant: 'destructive'
      })
      return
    }

    // Abrir editor de crop en lugar de subir directamente
    setShowCropEditor(true)
  }

  const handleImageCropped = async (croppedImageUrl: string, originalFile: File) => {
    setShowCropEditor(false)
    
    // Convertir la imagen recortada a File
    try {
      const response = await fetch(croppedImageUrl)
      const blob = await response.blob()
      const croppedFile = new File([blob], originalFile.name, { 
        type: originalFile.type,
        lastModified: Date.now()
      })
      
      // Subir la imagen recortada
      await uploadToCloudinary(croppedFile)
      
      // Limpiar URL temporal
      URL.revokeObjectURL(croppedImageUrl)
    } catch (error) {
      console.error('Error processing cropped image:', error)
      toast({
        title: 'Error',
        description: 'Error procesando la imagen recortada',
        variant: 'destructive'
      })
    }
  }

  const uploadToCloudinary = async (file: File) => {
    try {
      setUploading(true)

      // Crear FormData para nuestro API endpoint
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', folder)

      // Subir usando nuestro API endpoint simple (con tu preset unsigned)
      const response = await fetch('/api/upload/cloudinary-simple', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error subiendo imagen a Cloudinary')
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Error en la respuesta del servidor')
      }
      
      setUploadedImage(data.secure_url)
      setUploadedPublicId(data.public_id)
      
      onUploadComplete(data.secure_url, data.public_id)
      
      toast({
        title: 'Éxito',
        description: 'Imagen subida a Cloudinary correctamente',
      })

    } catch (error: any) {
      console.error('Error uploading to Cloudinary:', error)
      const errorMessage = error.message || 'Error subiendo imagen'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
      onUploadError?.(errorMessage)
    } finally {
      setUploading(false)
    }
  }

  const handleClear = () => {
    setUploadedImage(null)
    setUploadedPublicId(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click()
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Button */}
      <div
        onClick={handleClick}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${disabled 
            ? 'border-gray-300 bg-gray-50 cursor-not-allowed' 
            : 'border-gray-400 hover:border-antigua-purple hover:bg-purple-50'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />
        
        {uploading ? (
          <div className="space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-antigua-purple mx-auto"></div>
            <p className="text-sm text-gray-600">Subiendo imagen...</p>
          </div>
        ) : uploadedImage ? (
          <div className="space-y-2">
            <Check className="h-8 w-8 text-antigua-purple mx-auto" />
            <p className="text-sm text-antigua-purple font-medium">Imagen subida correctamente</p>
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
            <div className="flex items-center justify-center mt-2">
              <Scissors className="h-4 w-4 text-antigua-purple mr-1" />
              <span className="text-xs text-antigua-purple font-medium">Editor de recorte incluido</span>
            </div>
          </div>
        )}
      </div>

      {/* Preview */}
      {uploadedImage && (
        <div className="relative">
          <div className="relative rounded-lg overflow-hidden border">
            <img
              src={uploadedImage}
              alt="Preview"
              className="w-full h-48 object-cover"
            />
            <Button
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={handleClear}
              disabled={uploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            <p><strong>URL:</strong> {uploadedImage}</p>
            <p><strong>Public ID:</strong> {uploadedPublicId}</p>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Instrucciones:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Editor de recorte integrado para ajustar imágenes</li>
          <li>• Se guardarán en la carpeta &quot;website-images&quot;</li>
          <li>• Formatos recomendados: JPG para fotos, PNG para gráficos</li>
          <li>• Tamaño recomendado para hero: 1920x1080px (16:9)</li>
          <li>• Máximo 10MB - se optimizará automáticamente</li>
        </ul>
      </div>

      {/* Image Crop Editor Modal */}
      {showCropEditor && (
        <ImageCropEditor
          onImageCropped={handleImageCropped}
          onCancel={() => setShowCropEditor(false)}
          aspectRatio={16/9} // Para hero images
        />
      )}
    </div>
  )
}
