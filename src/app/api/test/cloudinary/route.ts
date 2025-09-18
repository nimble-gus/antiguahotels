import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { v2 as cloudinary } from 'cloudinary'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verificar configuración
    const config = cloudinary.config()
    
    if (!config.cloud_name || !config.api_key || !config.api_secret) {
      return NextResponse.json(
        { 
          error: 'Cloudinary no está configurado',
          details: 'Faltan variables de entorno: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET'
        },
        { status: 400 }
      )
    }

    // Probar conexión con una operación simple
    const result = await cloudinary.api.ping()
    
    if (result.status === 'ok') {
      // Obtener información de la cuenta
      const usage = await cloudinary.api.usage()
      
      return NextResponse.json({
        status: 'connected',
        cloudName: config.cloud_name,
        usage: {
          credits: usage.credits,
          used_percent: usage.used_percent,
          limit: usage.limit
        },
        message: 'Cloudinary conectado exitosamente'
      })
    } else {
      return NextResponse.json(
        { error: 'Error en la respuesta de Cloudinary' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Error testing Cloudinary:', error)
    
    let errorMessage = 'Error de conexión con Cloudinary'
    
    if (error instanceof Error) {
      if (error.message.includes('Invalid API key')) {
        errorMessage = 'API Key inválida'
      } else if (error.message.includes('Invalid API secret')) {
        errorMessage = 'API Secret inválida'
      } else if (error.message.includes('Cloud name')) {
        errorMessage = 'Cloud Name inválido'
      }
    }

    return NextResponse.json(
      { 
        error: errorMessage,
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}
