'use client'

import { useState, useRef, useCallback } from 'react'
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop'
import { Button } from '@/components/ui/button'
import { Upload, Crop as CropIcon, RotateCw, ZoomIn, ZoomOut, Check, X } from 'lucide-react'
import 'react-image-crop/dist/ReactCrop.css'

interface ImageCropEditorProps {
  onImageCropped: (croppedImageUrl: string, originalFile: File) => void
  onCancel: () => void
  aspectRatio?: number // 16/9 para hero, 1 para cuadrado, etc.
  className?: string
}

export default function ImageCropEditor({
  onImageCropped,
  onCancel,
  aspectRatio = 16 / 9, // Por defecto para hero images
  className = ''
}: ImageCropEditorProps) {
  const [imgSrc, setImgSrc] = useState<string>('')
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [scale, setScale] = useState(1)
  const [rotate, setRotate] = useState(0)
  const [originalFile, setOriginalFile] = useState<File | null>(null)
  
  const imgRef = useRef<HTMLImageElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      setOriginalFile(file)
      
      const reader = new FileReader()
      reader.addEventListener('load', () => {
        setImgSrc(reader.result?.toString() || '')
      })
      reader.readAsDataURL(file)
    }
  }

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    if (aspectRatio) {
      const { width, height } = e.currentTarget
      setCrop(centerCrop(
        makeAspectCrop(
          {
            unit: '%',
            width: 90,
          },
          aspectRatio,
          width,
          height,
        ),
        width,
        height,
      ))
    }
  }, [aspectRatio])

  const cropImage = useCallback(async () => {
    if (!completedCrop || !imgRef.current || !canvasRef.current || !originalFile) {
      return
    }

    const image = imgRef.current
    const canvas = canvasRef.current
    const crop = completedCrop

    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      throw new Error('No 2d context')
    }

    const pixelRatio = window.devicePixelRatio
    canvas.width = crop.width * pixelRatio * scaleX
    canvas.height = crop.height * pixelRatio * scaleY

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
    ctx.imageSmoothingQuality = 'high'

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width * scaleX,
      crop.height * scaleY,
    )

    // Convert canvas to blob
    canvas.toBlob((blob) => {
      if (!blob) {
        console.error('Failed to create blob')
        return
      }

      const croppedImageUrl = URL.createObjectURL(blob)
      onImageCropped(croppedImageUrl, originalFile)
    }, 'image/jpeg', 0.9)
  }, [completedCrop, originalFile, onImageCropped])

  const resetCrop = () => {
    if (imgRef.current && aspectRatio) {
      const { width, height } = imgRef.current
      setCrop(centerCrop(
        makeAspectCrop(
          {
            unit: '%',
            width: 90,
          },
          aspectRatio,
          width,
          height,
        ),
        width,
        height,
      ))
    }
  }

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 ${className}`}>
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Editor de Imagen</h2>
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {!imgSrc ? (
            /* File Upload */
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={onSelectFile}
                className="hidden"
              />
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg text-gray-600 mb-2">Selecciona una imagen para editar</p>
              <p className="text-sm text-gray-500 mb-4">JPG, PNG, WEBP hasta 10MB</p>
              <Button onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Seleccionar Imagen
              </Button>
            </div>
          ) : (
            /* Image Crop Editor */
            <div className="space-y-6">
              {/* Controls */}
              <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">Escala:</label>
                    <input
                      type="range"
                      min="0.5"
                      max="3"
                      step="0.1"
                      value={scale}
                      onChange={(e) => setScale(Number(e.target.value))}
                      className="w-20"
                    />
                    <span className="text-sm text-gray-600">{scale.toFixed(1)}x</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">Rotación:</label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRotate(prev => prev + 90)}
                    >
                      <RotateCw className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-gray-600">{rotate}°</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={resetCrop}>
                    Resetear
                  </Button>
                  <Button onClick={() => fileInputRef.current?.click()}>
                    <Upload className="h-4 w-4 mr-2" />
                    Cambiar Imagen
                  </Button>
                </div>
              </div>

              {/* Crop Area */}
              <div className="border rounded-lg overflow-hidden bg-gray-100">
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={aspectRatio}
                  minWidth={100}
                  minHeight={100}
                  className="max-h-[400px]"
                >
                  <img
                    ref={imgRef}
                    alt="Crop preview"
                    src={imgSrc}
                    style={{ 
                      transform: `scale(${scale}) rotate(${rotate}deg)`,
                      maxHeight: '400px',
                      width: 'auto'
                    }}
                    onLoad={onImageLoad}
                  />
                </ReactCrop>
              </div>

              {/* Preview Canvas (Hidden) */}
              <canvas
                ref={canvasRef}
                className="hidden"
              />

              {/* Info */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Instrucciones:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Arrastra las esquinas del área de selección para ajustar el recorte</li>
                  <li>• Usa la escala para hacer zoom in/out</li>
                  <li>• Rota la imagen si es necesario</li>
                  <li>• El área seleccionada se subirá a Cloudinary</li>
                  <li>• Ratio recomendado: {aspectRatio === 16/9 ? '16:9 para hero' : aspectRatio === 1 ? '1:1 cuadrado' : 'personalizado'}</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4">
                <Button variant="outline" onClick={onCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button 
                  onClick={cropImage}
                  disabled={!completedCrop}
                  className="bg-antigua-purple hover:bg-antigua-purple-dark"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Aplicar Recorte y Subir
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}





