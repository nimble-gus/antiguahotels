'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Package, Image as ImageIcon } from 'lucide-react'
import { CloudinaryImageManager } from '@/components/cloudinary-image-manager'

interface PackageData {
  id: string
  name: string
  description?: string
  shortDescription?: string
  durationDays: number
  durationNights: number
  capacity?: number
  basePrice: string
  currency: string
}

export default function PackageImagesPage() {
  const params = useParams()
  const router = useRouter()
  const packageId = params.id as string

  const [packageData, setPackageData] = useState<PackageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPackageData()
  }, [packageId])

  const fetchPackageData = async () => {
    try {
      setLoading(true)
      console.log('📦 Fetching package data for ID:', packageId)
      
      const response = await fetch(`/api/packages/${packageId}`)
      
      if (!response.ok) {
        throw new Error('Error obteniendo datos del paquete')
      }

      const data = await response.json()
      console.log('✅ Package data received:', data.name)
      
      setPackageData(data)
    } catch (error) {
      console.error('Error fetching package data:', error)
      setError('Error cargando datos del paquete')
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

  if (error || !packageData) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          {error || 'Paquete no encontrado'}
        </div>
        <Button onClick={() => router.push('/dashboard/packages')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Paquetes
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/dashboard/packages')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Paquetes
          </Button>
          <div className="flex items-center space-x-3">
            <Package className="h-6 w-6 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Gestión de Imágenes
              </h1>
              <p className="text-gray-600">
                {packageData.name}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Información del Paquete */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5 text-blue-600" />
            <span>Información del Paquete</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Nombre del Paquete</p>
              <p className="font-medium">{packageData.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Duración</p>
              <p className="font-medium">
                {packageData.durationDays} días, {packageData.durationNights} noches
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Capacidad</p>
              <p className="font-medium">
                {packageData.capacity ? `${packageData.capacity} personas exactas` : 'Sin límite definido'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Precio</p>
              <p className="font-medium text-green-600">
                {packageData.currency} ${packageData.basePrice}
              </p>
            </div>
          </div>
          {packageData.shortDescription && (
            <div className="mt-4">
              <p className="text-sm text-gray-600">Descripción</p>
              <p className="text-gray-800">{packageData.shortDescription}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gestión de Imágenes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ImageIcon className="h-5 w-5 text-purple-600" />
            <span>Imágenes del Paquete</span>
          </CardTitle>
          <p className="text-sm text-gray-600">
            Sube una imagen principal y varias imágenes adicionales para mostrar tu paquete turístico. 
            La imagen principal será la que se muestre en las listas y búsquedas.
          </p>
        </CardHeader>
        <CardContent>
          <CloudinaryImageManager 
            entityType="PACKAGE"
            entityId={packageId}
            onImagesChange={() => {
              console.log('🖼️ Package images updated')
              // Aquí podrías refrescar datos si es necesario
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
