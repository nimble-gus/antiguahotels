import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

// Configurar Cloudinary con timeout más largo
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  timeout: 60000, // 60 segundos
  secure: true
})

export async function POST(request: NextRequest) {
  try {
    console.log('📤 Cloudinary upload endpoint called')

    // Verificar configuración
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
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

    // Validar tamaño del archivo (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'El archivo es demasiado grande. Máximo 10MB' },
        { status: 400 }
      )
    }

    // Convertir File a Buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    console.log('🔄 Starting Cloudinary upload...')

    // Subir a Cloudinary usando el SDK con timeout personalizado
    const result = await Promise.race([
      new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: folder,
            resource_type: 'auto',
            public_id: `${folder}/${Date.now()}_${file.name.replace(/\.[^/.]+$/, "")}`,
            transformation: [
              { quality: 'auto' },
              { fetch_format: 'auto' }
            ],
            timeout: 120000 // 2 minutos
          },
          (error, result) => {
            if (error) {
              console.error('❌ Cloudinary upload error:', error)
              reject(error)
            } else {
              console.log('✅ Upload successful:', result?.public_id)
              resolve(result)
            }
          }
        ).end(buffer)
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Upload timeout after 2 minutes')), 120000)
      )
    ])

    console.log('🎉 Upload completed successfully')

    return NextResponse.json({
      success: true,
      secure_url: (result as any).secure_url,
      public_id: (result as any).public_id,
      width: (result as any).width,
      height: (result as any).height,
      format: (result as any).format,
      bytes: (result as any).bytes
    })

  } catch (error: any) {
    console.error('❌ Error in Cloudinary upload API:', error)
    
    let errorMessage = 'Error subiendo imagen a Cloudinary'
    
    if (error.message.includes('timeout')) {
      errorMessage = 'Timeout: La imagen es muy grande o la conexión es lenta. Intenta con una imagen más pequeña.'
    } else if (error.message.includes('Invalid API key')) {
      errorMessage = 'Credenciales de Cloudinary inválidas'
    } else if (error.message.includes('Cloud name')) {
      errorMessage = 'Nombre de cloud de Cloudinary inválido'
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
