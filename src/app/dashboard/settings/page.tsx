'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Settings, 
  Cloud, 
  Database,
  Globe,
  Mail,
  Phone,
  Save,
  TestTube,
  CheckCircle,
  XCircle
} from 'lucide-react'

interface SystemSetting {
  id: string
  settingKey: string
  settingValue: string
  dataType: string
  description?: string
  isPublic: boolean
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSetting[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testingCloudinary, setTestingCloudinary] = useState(false)
  const [cloudinaryStatus, setCloudinaryStatus] = useState<'unknown' | 'connected' | 'error'>('unknown')

  useEffect(() => {
    fetchSettings()
    testCloudinaryConnection()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings')
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const testCloudinaryConnection = async () => {
    setTestingCloudinary(true)
    try {
      const response = await fetch('/api/test/cloudinary')
      if (response.ok) {
        setCloudinaryStatus('connected')
      } else {
        setCloudinaryStatus('error')
      }
    } catch (error) {
      setCloudinaryStatus('error')
    } finally {
      setTestingCloudinary(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configuración del Sistema</h1>
        <p className="text-gray-600">Gestiona la configuración general del sistema</p>
      </div>

      {/* Cloudinary Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Cloud className="h-5 w-5 mr-2" />
            Estado de Cloudinary
          </CardTitle>
          <CardDescription>
            Verifica la conexión con el servicio de imágenes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {cloudinaryStatus === 'connected' && (
                <>
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  <div>
                    <p className="font-medium text-green-900">Conectado</p>
                    <p className="text-sm text-green-700">Cloudinary está funcionando correctamente</p>
                  </div>
                </>
              )}
              
              {cloudinaryStatus === 'error' && (
                <>
                  <XCircle className="h-6 w-6 text-red-500" />
                  <div>
                    <p className="font-medium text-red-900">Error de Conexión</p>
                    <p className="text-sm text-red-700">Verifica las credenciales en el archivo .env</p>
                  </div>
                </>
              )}
              
              {cloudinaryStatus === 'unknown' && (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <div>
                    <p className="font-medium text-gray-900">Verificando...</p>
                    <p className="text-sm text-gray-700">Probando conexión con Cloudinary</p>
                  </div>
                </>
              )}
            </div>
            
            <Button
              variant="outline"
              onClick={testCloudinaryConnection}
              disabled={testingCloudinary}
            >
              <TestTube className="h-4 w-4 mr-2" />
              {testingCloudinary ? 'Probando...' : 'Probar Conexión'}
            </Button>
          </div>

          {cloudinaryStatus === 'error' && (
            <div className="mt-4 p-4 bg-red-50 rounded-lg">
              <h4 className="font-medium text-red-900 mb-2">Configuración Requerida</h4>
              <p className="text-sm text-red-800 mb-3">
                Para habilitar Cloudinary, agrega estas variables a tu archivo .env:
              </p>
              <pre className="bg-red-100 p-3 rounded text-sm text-red-900 overflow-x-auto">
{`CLOUDINARY_CLOUD_NAME="tu-cloud-name"
CLOUDINARY_API_KEY="tu-api-key"
CLOUDINARY_API_SECRET="tu-api-secret"`}
              </pre>
              <p className="text-xs text-red-700 mt-2">
                Obtén estas credenciales en tu dashboard de Cloudinary: https://cloudinary.com/console
              </p>
            </div>
          )}

          {cloudinaryStatus === 'connected' && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">✅ Cloudinary Configurado</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-800">
                <div>
                  <p><strong>Funcionalidades Activas:</strong></p>
                  <ul className="mt-1 space-y-1">
                    <li>• Upload automático de imágenes</li>
                    <li>• Optimización automática (WebP)</li>
                    <li>• Redimensionamiento inteligente</li>
                    <li>• CDN global</li>
                  </ul>
                </div>
                <div>
                  <p><strong>Formatos Soportados:</strong></p>
                  <ul className="mt-1 space-y-1">
                    <li>• JPG, PNG, WebP</li>
                    <li>• Hasta 10MB por imagen</li>
                    <li>• Múltiples tamaños automáticos</li>
                    <li>• Compresión inteligente</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* System Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Configuración General
          </CardTitle>
          <CardDescription>
            Configuraciones básicas del sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Sitio
                </label>
                <input
                  type="text"
                  defaultValue="Antigua Hotels"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email de Contacto
                </label>
                <input
                  type="email"
                  defaultValue="info@antiguahotels.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono de Contacto
                </label>
                <input
                  type="tel"
                  defaultValue="+502-1234-5678"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Moneda por Defecto
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="USD">USD - Dólar Americano</option>
                  <option value="GTQ">GTQ - Quetzal Guatemalteco</option>
                  <option value="EUR">EUR - Euro</option>
                </select>
              </div>
            </div>

            <div className="pt-4">
              <Button disabled={saving}>
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {saving ? 'Guardando...' : 'Guardar Configuración'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>💡 Configuración de Cloudinary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <h4>Pasos para configurar Cloudinary:</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
              <li>
                <strong>Crear cuenta:</strong> Ve a{' '}
                <a href="https://cloudinary.com" target="_blank" className="text-blue-600 underline">
                  cloudinary.com
                </a>{' '}
                y crea una cuenta gratuita
              </li>
              <li>
                <strong>Obtener credenciales:</strong> En tu dashboard de Cloudinary, copia:
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li>Cloud Name</li>
                  <li>API Key</li>
                  <li>API Secret</li>
                </ul>
              </li>
              <li>
                <strong>Configurar .env:</strong> Agrega las variables a tu archivo .env
              </li>
              <li>
                <strong>Probar:</strong> Usa el botón "Probar Conexión" arriba
              </li>
            </ol>
            
            <div className="mt-4 p-3 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Plan gratuito de Cloudinary incluye:</strong> 25GB de almacenamiento, 
                25GB de ancho de banda mensual, y transformaciones ilimitadas.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
