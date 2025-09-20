import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { v2 as cloudinary } from 'cloudinary'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing Cloudinary connection...')
    
    // Verificar autenticación (opcional para test)
    const session = await getServerSession(authOptions)
    console.log('👤 Session:', session ? `User: ${session.user.email}, Role: ${session.user.role}` : 'No session')

    // Si no hay sesión, continuar con el test pero marcar como no autenticado
    if (!session) {
      console.log('⚠️ No session found, proceeding without auth check')
    } else if (!['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      console.log('⚠️ User role not authorized, proceeding anyway for test')
    }

    // Configurar Cloudinary con variables de entorno
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET
    
    console.log('🔧 Environment variables check:', {
      CLOUDINARY_CLOUD_NAME: cloudName ? '✅ Set' : '❌ Missing',
      CLOUDINARY_API_KEY: apiKey ? '✅ Set' : '❌ Missing',
      CLOUDINARY_API_SECRET: apiSecret ? '✅ Set' : '❌ Missing'
    })
    
    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        { 
          error: 'Cloudinary no está configurado',
          details: 'Faltan variables de entorno: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET'
        },
        { status: 400 }
      )
    }
    
    // Configurar Cloudinary
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret
    })
    
    console.log('✅ Cloudinary configured successfully')

    // Probar conexión con una operación simple
    const result = await cloudinary.api.ping()
    
    if (result.status === 'ok') {
      // Obtener información de la cuenta
      const usage = await cloudinary.api.usage()
      
      return NextResponse.json({
        success: true,
        status: 'connected',
        cloudName: cloudName,
        usage: {
          credits: usage.credits,
          used_percent: usage.used_percent,
          limit: usage.limit
        },
        message: 'Cloudinary conectado exitosamente',
        authenticated: !!session && ['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)
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
