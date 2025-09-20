import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('📤 Simple Cloudinary upload endpoint called')

    // Verificar configuración
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET

    if (!cloudName || !apiKey || !apiSecret) {
      console.error('❌ Cloudinary configuration missing')
      return NextResponse.json(
        { error: 'Cloudinary no está configurado correctamente' },
        { status: 500 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = formData.get('folder') as string || 'website-images'

    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó archivo' },
        { status: 400 }
      )
    }

    console.log('📁 File details:', {
      name: file.name,
      size: file.size,
      type: file.type,
      folder: folder
    })

    // Validar tamaño del archivo (máximo 5MB para evitar timeouts)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'El archivo es demasiado grande. Máximo 5MB para evitar timeouts.' },
        { status: 400 }
      )
    }

    // Crear FormData para Cloudinary
    const cloudinaryFormData = new FormData()
    cloudinaryFormData.append('file', file)
    cloudinaryFormData.append('upload_preset', 'megatienda_unsigned') // Usar tu preset unsigned
    cloudinaryFormData.append('folder', folder)
    cloudinaryFormData.append('api_key', apiKey)

    console.log('🔄 Starting direct Cloudinary upload...')

    // Subir directamente a Cloudinary usando fetch
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: cloudinaryFormData,
        signal: AbortSignal.timeout(30000) // 30 segundos timeout
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Cloudinary API error:', response.status, errorText)
      
      if (response.status === 400) {
        return NextResponse.json(
          { 
            error: 'Error de configuración. Verifica que el upload preset "ml_default" esté habilitado en tu cuenta de Cloudinary.',
            details: errorText
          },
          { status: 400 }
        )
      }
      
      throw new Error(`Cloudinary API error: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    
    console.log('✅ Upload successful:', result.public_id)

    return NextResponse.json({
      success: true,
      secure_url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes
    })

  } catch (error: any) {
    console.error('❌ Error in simple Cloudinary upload API:', error)
    
    let errorMessage = 'Error subiendo imagen a Cloudinary'
    
    if (error.name === 'TimeoutError') {
      errorMessage = 'Timeout: La imagen tardó demasiado en subirse. Intenta con una imagen más pequeña.'
    } else if (error.message.includes('Invalid API key')) {
      errorMessage = 'API Key de Cloudinary inválida'
    } else if (error.message.includes('Cloud name')) {
      errorMessage = 'Nombre de cloud de Cloudinary inválido'
    } else if (error.message.includes('upload preset')) {
      errorMessage = 'Upload preset no configurado. Necesitas habilitar uploads sin firmar en Cloudinary.'
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error.message 
      },
      { status: 500 }
    )
  }
}
