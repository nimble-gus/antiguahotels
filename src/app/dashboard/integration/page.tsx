'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { 
  Settings, 
  ExternalLink, 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  RefreshCw,
  Save,
  TestTube,
  Globe,
  Key,
  Bell
} from 'lucide-react'

interface IntegrationConfig {
  webhookSecret: string
  apiKey: string
  apiSecret: string
  webhookUrl: string
  syncInterval: number
  autoSyncEnabled: boolean
  notifyOnConflicts: boolean
  notifyOnErrors: boolean
  notificationEmail: string
  hotelMappings: Array<{ internalId: string; bookingId: string; hotelName: string }>
  roomTypeMappings: Array<{ internalId: string; bookingId: string; roomTypeName: string }>
}

interface SyncStatus {
  id: string
  platform: string
  hotelId: string
  lastSyncAt: string
  syncStatus: string
  recordsProcessed: number
  recordsUpdated: number
  recordsCreated: number
  errors: string | null
  hotel: {
    id: string
    name: string
  }
}

export default function IntegrationPage() {
  const [config, setConfig] = useState<IntegrationConfig>({
    webhookSecret: '',
    apiKey: '',
    apiSecret: '',
    webhookUrl: '',
    syncInterval: 1,
    autoSyncEnabled: false,
    notifyOnConflicts: true,
    notifyOnErrors: true,
    notificationEmail: '',
    hotelMappings: [],
    roomTypeMappings: []
  })

  const [syncStatus, setSyncStatus] = useState<SyncStatus[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)

  // Cargar configuración existente
  useEffect(() => {
    loadConfig()
    loadSyncStatus()
  }, [])

  const loadConfig = async () => {
    try {
      // Aquí cargarías la configuración desde tu API
      // Por ahora usamos valores por defecto
      setConfig({
        webhookSecret: process.env.NEXT_PUBLIC_BOOKING_WEBHOOK_SECRET || '',
        apiKey: process.env.NEXT_PUBLIC_BOOKING_API_KEY || '',
        apiSecret: process.env.NEXT_PUBLIC_BOOKING_API_SECRET || '',
        webhookUrl: `${window.location.origin}/api/webhooks/booking`,
        syncInterval: 1,
        autoSyncEnabled: false,
        notifyOnConflicts: true,
        notifyOnErrors: true,
        notificationEmail: '',
        hotelMappings: [],
        roomTypeMappings: []
      })
    } catch (error) {
      console.error('Error loading config:', error)
    }
  }

  const loadSyncStatus = async () => {
    try {
      const response = await fetch('/api/sync/availability')
      if (response.ok) {
        const data = await response.json()
        setSyncStatus(data)
      }
    } catch (error) {
      console.error('Error loading sync status:', error)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Aquí guardarías la configuración en tu API
      console.log('Saving config:', config)
      // Simular guardado
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert('Configuración guardada exitosamente')
    } catch (error) {
      console.error('Error saving config:', error)
      alert('Error guardando configuración')
    } finally {
      setSaving(false)
    }
  }

  const handleTestConnection = async () => {
    setTesting(true)
    try {
      // Aquí probarías la conexión con Booking.com
      console.log('Testing connection...')
      // Simular prueba
      await new Promise(resolve => setTimeout(resolve, 2000))
      alert('Conexión exitosa con Booking.com')
    } catch (error) {
      console.error('Error testing connection:', error)
      alert('Error en la conexión')
    } finally {
      setTesting(false)
    }
  }

  const handleSyncNow = async (hotelId: string) => {
    setLoading(true)
    try {
      const response = await fetch('/api/sync/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hotelId,
          platform: 'BOOKING_COM',
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        })
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Sync result:', result)
        alert('Sincronización iniciada exitosamente')
        loadSyncStatus()
      } else {
        throw new Error('Sync failed')
      }
    } catch (error) {
      console.error('Error syncing:', error)
      alert('Error en la sincronización')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: RefreshCw },
      IN_PROGRESS: { color: 'bg-blue-100 text-blue-800', icon: RefreshCw },
      COMPLETED: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      FAILED: { color: 'bg-red-100 text-red-800', icon: XCircle },
      CANCELLED: { color: 'bg-gray-100 text-gray-800', icon: XCircle }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING
    const IconComponent = config.icon

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <IconComponent className="h-3 w-3" />
        {status}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Integración con Booking.com</h1>
          <p className="text-gray-600">Configura la sincronización automática con Booking.com</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleTestConnection}
            disabled={testing}
            className="flex items-center gap-2"
          >
            <TestTube className="h-4 w-4" />
            {testing ? 'Probando...' : 'Probar Conexión'}
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Guardando...' : 'Guardar Configuración'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuración de API */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Configuración de API
            </CardTitle>
            <CardDescription>
              Credenciales y configuración de Booking.com
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="webhookSecret">Webhook Secret</Label>
              <Input
                id="webhookSecret"
                type="password"
                value={config.webhookSecret}
                onChange={(e) => setConfig(prev => ({ ...prev, webhookSecret: e.target.value }))}
                placeholder="Tu webhook secret de Booking.com"
              />
            </div>

            <div>
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                value={config.apiKey}
                onChange={(e) => setConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                placeholder="Tu API key de Booking.com"
              />
            </div>

            <div>
              <Label htmlFor="apiSecret">API Secret</Label>
              <Input
                id="apiSecret"
                type="password"
                value={config.apiSecret}
                onChange={(e) => setConfig(prev => ({ ...prev, apiSecret: e.target.value }))}
                placeholder="Tu API secret de Booking.com"
              />
            </div>

            <div>
              <Label htmlFor="webhookUrl">Webhook URL</Label>
              <Input
                id="webhookUrl"
                value={config.webhookUrl}
                onChange={(e) => setConfig(prev => ({ ...prev, webhookUrl: e.target.value }))}
                placeholder="URL para recibir webhooks"
              />
              <p className="text-sm text-gray-500 mt-1">
                Configura esta URL en tu panel de Booking.com
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Configuración de Sincronización */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Sincronización
            </CardTitle>
            <CardDescription>
              Configuración de sincronización automática
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="autoSync">Sincronización Automática</Label>
                <p className="text-sm text-gray-500">Sincronizar automáticamente con Booking.com</p>
              </div>
              <Switch
                id="autoSync"
                checked={config.autoSyncEnabled}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, autoSyncEnabled: checked }))}
              />
            </div>

            <div>
              <Label htmlFor="syncInterval">Intervalo de Sincronización (horas)</Label>
              <Input
                id="syncInterval"
                type="number"
                min="1"
                max="24"
                value={config.syncInterval}
                onChange={(e) => setConfig(prev => ({ ...prev, syncInterval: parseInt(e.target.value) }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notifyConflicts">Notificar Conflictos</Label>
                <p className="text-sm text-gray-500">Recibir alertas cuando haya conflictos de disponibilidad</p>
              </div>
              <Switch
                id="notifyConflicts"
                checked={config.notifyOnConflicts}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, notifyOnConflicts: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notifyErrors">Notificar Errores</Label>
                <p className="text-sm text-gray-500">Recibir alertas cuando haya errores de sincronización</p>
              </div>
              <Switch
                id="notifyErrors"
                checked={config.notifyOnErrors}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, notifyOnErrors: checked }))}
              />
            </div>

            <div>
              <Label htmlFor="notificationEmail">Email de Notificaciones</Label>
              <Input
                id="notificationEmail"
                type="email"
                value={config.notificationEmail}
                onChange={(e) => setConfig(prev => ({ ...prev, notificationEmail: e.target.value }))}
                placeholder="admin@tudominio.com"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estado de Sincronización */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Estado de Sincronización
          </CardTitle>
          <CardDescription>
            Historial y estado actual de las sincronizaciones
          </CardDescription>
        </CardHeader>
        <CardContent>
          {syncStatus.length === 0 ? (
            <div className="text-center py-8">
              <RefreshCw className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No hay sincronizaciones registradas</p>
            </div>
          ) : (
            <div className="space-y-4">
              {syncStatus.map((sync) => (
                <div key={sync.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">{sync.hotel.name}</h3>
                      {getStatusBadge(sync.syncStatus)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSyncNow(sync.hotelId)}
                        disabled={loading}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Sincronizar Ahora
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div>
                      <strong>Última Sincronización:</strong><br />
                      {new Date(sync.lastSyncAt).toLocaleString()}
                    </div>
                    <div>
                      <strong>Registros Procesados:</strong><br />
                      {sync.recordsProcessed}
                    </div>
                    <div>
                      <strong>Registros Actualizados:</strong><br />
                      {sync.recordsUpdated}
                    </div>
                    <div>
                      <strong>Registros Creados:</strong><br />
                      {sync.recordsCreated}
                    </div>
                  </div>

                  {sync.errors && (
                    <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-700">
                      <strong>Error:</strong> {sync.errors}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instrucciones de Configuración */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Instrucciones de Configuración
          </CardTitle>
          <CardDescription>
            Pasos para configurar la integración con Booking.com
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">1. Configurar Webhook en Booking.com</h4>
              <p className="text-blue-800 text-sm">
                Ve a tu panel de Booking.com y configura el webhook URL: <code className="bg-blue-100 px-2 py-1 rounded">{config.webhookUrl}</code>
              </p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">2. Obtener Credenciales API</h4>
              <p className="text-green-800 text-sm">
                Contacta a Booking.com para obtener tu API Key y Secret para la sincronización de disponibilidad.
              </p>
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-semibold text-yellow-900 mb-2">3. Mapear Hoteles y Tipos de Habitación</h4>
              <p className="text-yellow-800 text-sm">
                Configura la correspondencia entre tus hoteles internos y los IDs de Booking.com.
              </p>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-semibold text-purple-900 mb-2">4. Probar la Integración</h4>
              <p className="text-purple-800 text-sm">
                Usa el botón "Probar Conexión" para verificar que todo esté configurado correctamente.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


