import { v2 as cloudinary } from 'cloudinary'

// Configuración de Cloudinary
if (!cloudinary.config().cloud_name) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })
}

export interface CloudinaryUploadResult {
  public_id: string
  secure_url: string
  width: number
  height: number
  format: string
  resource_type: string
}

export async function uploadToCloudinary(
  file: File,
  folder: string = 'antigua-hotels'
): Promise<CloudinaryUploadResult> {
  try {
    // Convertir file a base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const dataURI = `data:${file.type};base64,${base64}`

    // Upload a Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder,
      resource_type: 'auto',
      transformation: [
        { width: 1200, height: 800, crop: 'limit', quality: 'auto' },
        { format: 'webp' }
      ]
    })

    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      resource_type: result.resource_type,
    }

  } catch (error) {
    console.error('Error uploading to Cloudinary:', error)
    throw new Error('Error subiendo imagen')
  }
}

export async function deleteFromCloudinary(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId)
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error)
    throw new Error('Error eliminando imagen')
  }
}

export function getOptimizedImageUrl(
  publicId: string,
  width?: number,
  height?: number,
  quality: string = 'auto'
): string {
  if (!publicId) return ''
  
  const transformations = []
  
  if (width || height) {
    transformations.push(`w_${width || 'auto'},h_${height || 'auto'},c_fill`)
  }
  
  transformations.push(`q_${quality}`, 'f_webp')
  
  return cloudinary.url(publicId, {
    transformation: transformations
  })
}
