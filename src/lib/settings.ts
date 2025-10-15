import { prisma } from '@/lib/prisma'

// Cache en memoria para configuraciones (opcional)
let settingsCache: Record<string, any> = {}
let cacheTimestamp = 0
const CACHE_TTL = 5 * 60 * 1000 // 5 minutos

// Función para obtener una configuración específica
export async function getSetting(key: string, defaultValue?: any): Promise<any> {
  try {
    // Verificar cache
    if (cacheTimestamp > Date.now() - CACHE_TTL && settingsCache[key] !== undefined) {
      return settingsCache[key]
    }

    const setting = await prisma.systemSetting.findUnique({
      where: { settingKey: key }
    })

    if (!setting) {
      console.warn(`Setting not found: ${key}, using default:`, defaultValue)
      return defaultValue
    }

    // Convertir valor según el tipo
    let value: any = setting.settingValue
    switch (setting.dataType) {
      case 'INTEGER':
        value = parseInt(setting.settingValue || '0', 10)
        break
      case 'DECIMAL':
        value = parseFloat(setting.settingValue || '0')
        break
      case 'BOOLEAN':
        value = setting.settingValue === 'true'
        break
      case 'JSON':
        try {
          value = JSON.parse(setting.settingValue || '{}')
        } catch {
          value = setting.settingValue
        }
        break
    }

    // Actualizar cache
    settingsCache[key] = value
    cacheTimestamp = Date.now()

    return value

  } catch (error) {
    console.error(`Error getting setting ${key}:`, error)
    return defaultValue
  }
}

// Función para obtener múltiples configuraciones por categoría
export async function getSettingsByCategory(category: string): Promise<Record<string, any>> {
  try {
    const settings = await prisma.systemSetting.findMany({
      where: {
        settingKey: {
          startsWith: `${category}.`
        }
      }
    })

    const result: Record<string, any> = {}
    
    settings.forEach((setting: any) => {
      const key = setting.settingKey.replace(`${category}.`, '')
      
      let value: any = setting.settingValue
      switch (setting.dataType) {
        case 'INTEGER':
          value = parseInt(setting.settingValue || '0', 10)
          break
        case 'DECIMAL':
          value = parseFloat(setting.settingValue || '0')
          break
        case 'BOOLEAN':
          value = setting.settingValue === 'true'
          break
        case 'JSON':
          try {
            value = JSON.parse(setting.settingValue || '{}')
          } catch {
            value = setting.settingValue
          }
          break
      }
      
      result[key] = value
    })

    return result

  } catch (error) {
    console.error(`Error getting settings for category ${category}:`, error)
    return {}
  }
}

// Función para establecer una configuración
export async function setSetting(key: string, value: any, dataType: 'STRING' | 'INTEGER' | 'DECIMAL' | 'BOOLEAN' | 'JSON' = 'STRING', description?: string): Promise<boolean> {
  try {
    let valueToStore = value
    if (dataType === 'JSON') {
      valueToStore = typeof value === 'string' ? value : JSON.stringify(value)
    } else {
      valueToStore = String(value)
    }

    await prisma.systemSetting.upsert({
      where: { settingKey: key },
      update: {
        settingValue: valueToStore,
        dataType: dataType as any,
        description
      },
      create: {
        settingKey: key,
        settingValue: valueToStore,
        dataType: dataType as any,
        description,
        isPublic: false
      }
    })

    // Limpiar cache
    delete settingsCache[key]
    
    return true

  } catch (error) {
    console.error(`Error setting ${key}:`, error)
    return false
  }
}

// Configuraciones por defecto del sistema
export const DEFAULT_SETTINGS = {
  // Empresa
  'company.name': 'Antigua Hotels Tours',
  'company.email': 'info@antiguahotelstours.com',
  'company.phone': '+502 1234-5678',
  
  // Reservaciones
  'reservations.advance_booking_days': 365,
  'reservations.min_advance_hours': 24,
  'reservations.auto_confirm_payment': true,
  'reservations.default_currency': 'USD',
  
  // Pagos
  'payments.require_deposit': true,
  'payments.deposit_percentage': 30,
  'currencies.primary': 'USD',
  'currencies.secondary': 'GTQ',
  'currencies.exchange_rate_usd_gtq': 7.75,
  
  // Notificaciones
  'notifications.email_enabled': true,
  'notifications.checkin_reminder_hours': 24,
  'notifications.payment_reminder_days': 3,
  
  // Negocio
  'business.checkin_time': '15:00',
  'business.checkout_time': '11:00',
  'business.timezone': 'America/Guatemala',
  
  // Sistema
  'system.maintenance_mode': false,
  'system.backup_enabled': true,
  'system.session_timeout_minutes': 480,
}

// Función para inicializar configuraciones por defecto
export async function initializeDefaultSettings(): Promise<void> {
  try {
    console.log('⚙️ Initializing default settings...')
    
    for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
      const existing = await prisma.systemSetting.findUnique({
        where: { settingKey: key }
      })
      
      if (!existing) {
        await setSetting(key, value, typeof value === 'boolean' ? 'BOOLEAN' : typeof value === 'number' ? 'INTEGER' : 'STRING')
      }
    }
    
    console.log('✅ Default settings initialized')
    
  } catch (error) {
    console.error('❌ Error initializing default settings:', error)
  }
}

// Función para limpiar cache de configuraciones
export function clearSettingsCache(): void {
  settingsCache = {}
  cacheTimestamp = 0
  console.log('🗑️ Settings cache cleared')
}









