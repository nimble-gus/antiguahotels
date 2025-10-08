import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    console.log('🌐 Fetching public settings for footer...')

    // Obtener solo las configuraciones públicas relacionadas con el footer
    const settings = await prisma.systemSetting.findMany({
      where: {
        isPublic: true,
        settingKey: {
          startsWith: 'company.footer_'
        }
      },
      orderBy: { settingKey: 'asc' }
    })

    console.log('✅ Found public settings:', settings.length)

    // Convertir a un objeto más fácil de usar
    const footerSettings = settings.reduce((acc, setting) => {
      const key = setting.settingKey.replace('company.footer_', '')
      acc[key] = setting.settingValue
      return acc
    }, {} as Record<string, string>)

    return NextResponse.json({
      success: true,
      settings: footerSettings
    })

  } catch (error) {
    console.error('Error fetching public settings:', error)
    return NextResponse.json(
      { error: 'Error obteniendo configuraciones públicas' },
      { status: 500 }
    )
  }
}

