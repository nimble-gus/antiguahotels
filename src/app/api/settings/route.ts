import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    console.log('⚙️ Fetching settings, category:', category)

    let whereClause = {}
    if (category) {
      whereClause = {
        settingKey: {
          startsWith: `${category}.`
        }
      }
    }

    const settings = await prisma.systemSetting.findMany({
      where: whereClause,
      orderBy: { settingKey: 'asc' }
    })

    console.log('✅ Found settings:', settings.length)

    // Organizar settings por categoría
    const organizedSettings = settings.reduce((acc, setting) => {
      const [category, key] = setting.settingKey.split('.')
      
      if (!acc[category]) {
        acc[category] = {}
      }
      
      // Convertir valor según el tipo
      let value = setting.settingValue
      switch (setting.dataType) {
        case 'INTEGER':
          value = parseInt(setting.settingValue)
          break
        case 'DECIMAL':
          value = parseFloat(setting.settingValue)
          break
        case 'BOOLEAN':
          value = setting.settingValue === 'true'
          break
        case 'JSON':
          try {
            value = JSON.parse(setting.settingValue)
          } catch {
            value = setting.settingValue
          }
          break
      }
      
      acc[category][key] = {
        value,
        description: setting.description,
        dataType: setting.dataType,
        isPublic: setting.isPublic,
        updatedAt: setting.updatedAt.toISOString()
      }
      
      return acc
    }, {} as Record<string, any>)

    return NextResponse.json({
      settings: organizedSettings,
      count: settings.length
    })

  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Error obteniendo configuraciones' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { settingKey, settingValue, dataType, description, isPublic } = body

    console.log('⚙️ Creating/updating setting:', { settingKey, dataType })

    // Validar datos requeridos
    if (!settingKey || settingValue === undefined) {
      return NextResponse.json(
        { error: 'settingKey y settingValue son requeridos' },
        { status: 400 }
      )
    }

    // Convertir valor a string para almacenamiento
    let valueToStore = settingValue
    if (dataType === 'JSON') {
      valueToStore = typeof settingValue === 'string' ? settingValue : JSON.stringify(settingValue)
    } else {
      valueToStore = String(settingValue)
    }

    // Crear o actualizar configuración
    const setting = await prisma.systemSetting.upsert({
      where: { settingKey },
      update: {
        settingValue: valueToStore,
        dataType: dataType || 'STRING',
        description,
        isPublic: isPublic || false,
        updatedBy: session.user.id ? BigInt(session.user.id) : null
      },
      create: {
        settingKey,
        settingValue: valueToStore,
        dataType: dataType || 'STRING',
        description,
        isPublic: isPublic || false,
        updatedBy: session.user.id ? BigInt(session.user.id) : null
      }
    })

    console.log('✅ Setting saved:', setting.settingKey)

    return NextResponse.json({
      success: true,
      setting: {
        ...setting,
        id: setting.id.toString(),
        updatedBy: setting.updatedBy?.toString(),
        createdAt: setting.createdAt.toISOString(),
        updatedAt: setting.updatedAt.toISOString()
      },
      message: 'Configuración guardada exitosamente'
    })

  } catch (error) {
    console.error('Error saving setting:', error)
    return NextResponse.json(
      { error: 'Error guardando configuración' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { settings } = body // Array de configuraciones para actualización masiva

    console.log('⚙️ Bulk updating settings:', settings.length)

    if (!Array.isArray(settings)) {
      return NextResponse.json(
        { error: 'Se esperaba un array de configuraciones' },
        { status: 400 }
      )
    }

    // Actualizar configuraciones en lote
    const results = await Promise.all(
      settings.map(async (setting: any) => {
        const { settingKey, settingValue, dataType, description, isPublic } = setting

        let valueToStore = settingValue
        if (dataType === 'JSON') {
          valueToStore = typeof settingValue === 'string' ? settingValue : JSON.stringify(settingValue)
        } else {
          valueToStore = String(settingValue)
        }

        return await prisma.systemSetting.upsert({
          where: { settingKey },
          update: {
            settingValue: valueToStore,
            dataType: dataType || 'STRING',
            description,
            isPublic: isPublic || false,
            updatedBy: session.user.id ? BigInt(session.user.id) : null
          },
          create: {
            settingKey,
            settingValue: valueToStore,
            dataType: dataType || 'STRING',
            description,
            isPublic: isPublic || false,
            updatedBy: session.user.id ? BigInt(session.user.id) : null
          }
        })
      })
    )

    console.log('✅ Bulk settings updated:', results.length)

    return NextResponse.json({
      success: true,
      updated: results.length,
      message: `${results.length} configuraciones actualizadas exitosamente`
    })

  } catch (error) {
    console.error('Error bulk updating settings:', error)
    return NextResponse.json(
      { error: 'Error actualizando configuraciones' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Solo Super Admin puede eliminar configuraciones' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const settingKey = searchParams.get('key')

    if (!settingKey) {
      return NextResponse.json(
        { error: 'settingKey es requerido' },
        { status: 400 }
      )
    }

    console.log('⚙️ Deleting setting:', settingKey)

    await prisma.systemSetting.delete({
      where: { settingKey }
    })

    console.log('✅ Setting deleted:', settingKey)

    return NextResponse.json({
      success: true,
      message: 'Configuración eliminada exitosamente'
    })

  } catch (error) {
    console.error('Error deleting setting:', error)
    return NextResponse.json(
      { error: 'Error eliminando configuración' },
      { status: 500 }
    )
  }
}
