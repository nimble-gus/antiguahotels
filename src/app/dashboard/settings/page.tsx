'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Settings,
  Building,
  CreditCard,
  Bell,
  Globe,
  Shield,
  Database,
  Cloud,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Edit,
  Trash2,
  Plus,
  TestTube,
  XCircle
} from 'lucide-react'

interface SystemSettings {
  [category: string]: {
    [key: string]: {
      value: any
      description: string
      dataType: string
      isPublic: boolean
      updatedAt: string
    }
  }
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('company')
  const [editingSettings, setEditingSettings] = useState<Record<string, any>>({})
  const [cloudinaryStatus, setCloudinaryStatus] = useState<'unknown' | 'connected' | 'error'>('unknown')
  const [testingCloudinary, setTestingCloudinary] = useState(false)

  useEffect(() => {
    fetchSettings()
    testCloudinaryConnection()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      console.log('⚙️ Fetching settings...')
      
      const response = await fetch('/api/settings')
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Settings loaded:', Object.keys(data.settings))
        setSettings(data.settings)
        
        // Inicializar editingSettings con valores actuales
        const initialEditing: Record<string, any> = {}
        Object.entries(data.settings).forEach(([category, categorySettings]) => {
          Object.entries(categorySettings as any).forEach(([key, setting]: [string, any]) => {
            initialEditing[`${category}.${key}`] = setting.value
          })
        })
        setEditingSettings(initialEditing)
      } else {
        console.error('❌ Failed to fetch settings')
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
      console.log('🔍 Testing Cloudinary connection from frontend...')
      const response = await fetch('/api/test/cloudinary')
      console.log('📡 Response status:', response.status, response.ok)
      
      if (response.ok) {
        const data = await response.json()
        console.log('📊 Response data:', data)
        console.log('✅ Success check:', data.success)
        setCloudinaryStatus(data.success ? 'connected' : 'error')
      } else {
        console.log('❌ Response not ok:', response.status)
        setCloudinaryStatus('error')
      }
    } catch (error) {
      console.error('❌ Error testing Cloudinary:', error)
      setCloudinaryStatus('error')
    } finally {
      setTestingCloudinary(false)
    }
  }

  const saveSettings = async () => {
    try {
      setSaving(true)
      console.log('💾 Saving settings...')
      
      // Preparar settings para envío
      const settingsToSave = Object.entries(editingSettings).map(([fullKey, value]) => {
        const [category, key] = fullKey.split('.')
        const originalSetting = settings[category]?.[key]
        
        return {
          settingKey: fullKey,
          settingValue: value,
          dataType: originalSetting?.dataType || 'STRING',
          description: originalSetting?.description || '',
          isPublic: originalSetting?.isPublic || false
        }
      })

      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: settingsToSave })
      })

      if (response.ok) {
        console.log('✅ Settings saved successfully')
        await fetchSettings() // Recargar configuraciones
        alert('Configuraciones guardadas exitosamente')
      } else {
        console.error('❌ Failed to save settings')
        alert('Error guardando configuraciones')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Error guardando configuraciones')
    } finally {
      setSaving(false)
    }
  }

  const handleSettingChange = (fullKey: string, value: any) => {
    setEditingSettings(prev => ({
      ...prev,
      [fullKey]: value
    }))
  }

  const settingTabs = [
    { id: 'company', name: 'Empresa', icon: Building, color: 'blue' },
    { id: 'reservations', name: 'Reservaciones', icon: Settings, color: 'green' },
    { id: 'payments', name: 'Pagos', icon: CreditCard, color: 'purple' },
    { id: 'notifications', name: 'Notificaciones', icon: Bell, color: 'yellow' },
    { id: 'business', name: 'Negocio', icon: Globe, color: 'indigo' },
    { id: 'system', name: 'Sistema', icon: Shield, color: 'red' },
  ]

  const renderSettingInput = (category: string, key: string, setting: any) => {
    const fullKey = `${category}.${key}`
    const currentValue = editingSettings[fullKey] ?? setting.value

    switch (setting.dataType) {
      case 'BOOLEAN':
        return (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={currentValue}
              onChange={(e) => handleSettingChange(fullKey, e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600">
              {currentValue ? 'Habilitado' : 'Deshabilitado'}
            </span>
          </div>
        )
      
      case 'INTEGER':
        return (
          <input
            type="number"
            value={currentValue}
            onChange={(e) => handleSettingChange(fullKey, parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        )
      
      case 'DECIMAL':
        return (
          <input
            type="number"
            step="0.01"
            value={currentValue}
            onChange={(e) => handleSettingChange(fullKey, parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        )
      
      case 'JSON':
        return (
          <textarea
            value={typeof currentValue === 'string' ? currentValue : JSON.stringify(currentValue, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value)
                handleSettingChange(fullKey, parsed)
              } catch {
                handleSettingChange(fullKey, e.target.value)
              }
            }}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
          />
        )
      
      default: // STRING
        return (
          <input
            type="text"
            value={currentValue}
            onChange={(e) => handleSettingChange(fullKey, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        )
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
        <span>Cargando configuraciones...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configuración del Sistema</h1>
          <p className="text-gray-600">Gestiona todas las configuraciones del sistema</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={fetchSettings} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Recargar
          </Button>
          <Button onClick={saveSettings} disabled={saving}>
            <Save className={`h-4 w-4 mr-2 ${saving ? 'animate-spin' : ''}`} />
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Estado del Sistema</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Database Status */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <div>
                  <p className="font-medium text-green-900">Base de Datos</p>
                  <p className="text-sm text-green-700">Conectado</p>
                </div>
              </div>
            </div>

            {/* Cloudinary Status */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {cloudinaryStatus === 'connected' && (
                    <>
                      <CheckCircle className="h-6 w-6 text-green-500" />
                      <div>
                        <p className="font-medium text-green-900">Cloudinary</p>
                        <p className="text-sm text-green-700">Conectado</p>
                      </div>
                    </>
                  )}
                  
                  {cloudinaryStatus === 'error' && (
                    <>
                      <XCircle className="h-6 w-6 text-red-500" />
                      <div>
                        <p className="font-medium text-red-900">Cloudinary</p>
                        <p className="text-sm text-red-700">Error</p>
                      </div>
                    </>
                  )}
                  
                  {cloudinaryStatus === 'unknown' && (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <div>
                        <p className="font-medium text-gray-900">Cloudinary</p>
                        <p className="text-sm text-gray-700">Verificando...</p>
                      </div>
                    </>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={testCloudinaryConnection}
                  disabled={testingCloudinary}
                >
                  <TestTube className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Email Status */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <div>
                  <p className="font-medium text-green-900">Email (Resend)</p>
                  <p className="text-sm text-green-700">Configurado</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {settingTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.name}</span>
              {settings[tab.id] && (
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                  {Object.keys(settings[tab.id]).length}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Settings Content */}
      <div className="space-y-6">
        {/* Settings by Category */}
        {settings[activeTab] && (
          <Card>
            <CardHeader>
              <CardTitle>
                Configuraciones de {settingTabs.find(t => t.id === activeTab)?.name}
              </CardTitle>
              <CardDescription>
                Ajusta las configuraciones específicas de esta categoría
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(settings[activeTab]).map(([key, setting]: [string, any]) => (
                  <div key={key} className="border-b border-gray-100 pb-4 last:border-b-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-900 mb-1">
                          {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </label>
                        {setting.description && (
                          <p className="text-xs text-gray-500 mb-2">{setting.description}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        {setting.isPublic && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            Público
                          </span>
                        )}
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                          {setting.dataType}
                        </span>
                      </div>
                    </div>
                    
                    <div className="max-w-md">
                      {renderSettingInput(activeTab, key, setting)}
                    </div>
                    
                    <p className="text-xs text-gray-400 mt-1">
                      Última actualización: {new Date(setting.updatedAt).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!settings[activeTab] && (
          <Card>
            <CardContent className="p-12 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay configuraciones para esta categoría
              </h3>
              <p className="text-gray-500 mb-4">
                Ejecuta el script de configuraciones por defecto para inicializar el sistema.
              </p>
              <Button variant="outline" onClick={fetchSettings}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Recargar
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Acciones Rápidas</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button variant="outline" onClick={testCloudinaryConnection} disabled={testingCloudinary}>
              <Cloud className="h-4 w-4 mr-2" />
              Test Cloudinary
            </Button>
            <Button variant="outline" onClick={() => window.open('/api/test/email?type=config', '_blank')}>
              <Bell className="h-4 w-4 mr-2" />
              Test Email
            </Button>
            <Button variant="outline" onClick={() => alert('Función por implementar')}>
              <Database className="h-4 w-4 mr-2" />
              Backup Manual
            </Button>
            <Button variant="outline" onClick={() => alert('Función por implementar')}>
              <Shield className="h-4 w-4 mr-2" />
              Verificar Seguridad
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>💡 Instrucciones de Configuración</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">🏢 Configuración de Empresa</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Actualiza información de contacto</li>
                  <li>• Configura políticas de cancelación</li>
                  <li>• Define horarios de operación</li>
                  <li>• Establece redes sociales</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">💳 Configuración de Pagos</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Configura monedas soportadas</li>
                  <li>• Define políticas de depósito</li>
                  <li>• Establece tipos de cambio</li>
                  <li>• Configura CyberSource</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">📧 Configuración de Notificaciones</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Habilita/deshabilita emails automáticos</li>
                  <li>• Configura recordatorios</li>
                  <li>• Define emails de administradores</li>
                  <li>• Ajusta tiempos de notificación</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">⚙️ Configuración del Sistema</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Modo de mantenimiento</li>
                  <li>• Configuración de backup</li>
                  <li>• Logs y auditoría</li>
                  <li>• Performance y cache</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}