import fs from 'fs'
import path from 'path'

export interface WebsiteImage {
  id: string
  imageKey: string
  title: string
  description: string | null
  imageUrl: string
  cloudinaryPublicId: string
  altText: string | null
  isActive: boolean
  sortOrder: number
  pageSection: string
  pageType: string
  createdAt: string
  updatedAt: string
}

const DATA_FILE = path.join(process.cwd(), 'data', 'website-images.json')

// Crear directorio si no existe
const dataDir = path.dirname(DATA_FILE)
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

// Datos por defecto
const defaultImages: WebsiteImage[] = [
  {
    id: '1',
    imageKey: 'hero_home_1',
    title: 'Antigua Guatemala Vista Principal',
    description: 'Vista panorámica de Antigua Guatemala con volcanes al fondo',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop',
    cloudinaryPublicId: 'antigua-hero-main',
    altText: 'Vista panorámica de Antigua Guatemala',
    isActive: true,
    sortOrder: 1,
    pageSection: 'hero',
    pageType: 'home',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    imageKey: 'hero_home_2',
    title: 'Catedral de Antigua',
    description: 'Hermosa arquitectura colonial en el corazón de la ciudad',
    imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1920&h=1080&fit=crop',
    cloudinaryPublicId: 'antigua-cathedral',
    altText: 'Catedral de Antigua Guatemala',
    isActive: true,
    sortOrder: 2,
    pageSection: 'hero',
    pageType: 'home',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    imageKey: 'hero_home_3',
    title: 'Volcán de Agua',
    description: 'Majestuosa vista del volcán desde la ciudad colonial',
    imageUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1920&h=1080&fit=crop',
    cloudinaryPublicId: 'volcan-agua',
    altText: 'Volcán de Agua desde Antigua',
    isActive: true,
    sortOrder: 3,
    pageSection: 'hero',
    pageType: 'home',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '4',
    imageKey: 'hero_home_4',
    title: 'Mercado Local',
    description: 'Colores y tradiciones del mercado de Antigua',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1920&h=1080&fit=crop',
    cloudinaryPublicId: 'antigua-market',
    altText: 'Mercado tradicional de Antigua',
    isActive: true,
    sortOrder: 4,
    pageSection: 'hero',
    pageType: 'home',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

function readImages(): WebsiteImage[] {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8')
      const parsed = JSON.parse(data)
      console.log('📸 Loaded images from file:', parsed.length)
      return parsed
    }
  } catch (error) {
    console.error('Error reading images file:', error)
  }
  
  // Si hay error o no existe el archivo, usar datos por defecto
  console.log('📸 Using default images')
  return defaultImages
}

function writeImages(images: WebsiteImage[]): void {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(images, null, 2))
    console.log('📸 Images saved to file:', images.length)
  } catch (error) {
    console.error('Error writing images file:', error)
  }
}

export function getPersistentImages(): WebsiteImage[] {
  return readImages()
}

export function addPersistentImage(image: Omit<WebsiteImage, 'id' | 'createdAt' | 'updatedAt'>): WebsiteImage {
  const images = readImages()
  
  const newImage: WebsiteImage = {
    ...image,
    id: (images.length + 1).toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  images.push(newImage)
  writeImages(images)
  
  console.log('📸 New image added persistently:', newImage.id)
  
  return newImage
}

export function updatePersistentImage(id: string, updates: Partial<Omit<WebsiteImage, 'id' | 'createdAt'>>): WebsiteImage | null {
  const images = readImages()
  const imageIndex = images.findIndex(img => img.id === id)
  
  if (imageIndex === -1) {
    return null
  }
  
  images[imageIndex] = {
    ...images[imageIndex],
    ...updates,
    id: id, // Mantener el ID original
    updatedAt: new Date().toISOString()
  }
  
  writeImages(images)
  
  console.log('📸 Image updated persistently:', id)
  
  return images[imageIndex]
}

export function deletePersistentImage(id: string): boolean {
  const images = readImages()
  const imageIndex = images.findIndex(img => img.id === id)
  
  if (imageIndex === -1) {
    return false
  }
  
  images.splice(imageIndex, 1)
  writeImages(images)
  
  console.log('📸 Image deleted persistently:', id)
  
  return true
}
