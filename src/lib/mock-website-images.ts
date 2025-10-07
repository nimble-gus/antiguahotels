// Datos mock compartidos para las imágenes del sitio web
// En un entorno real, esto sería reemplazado por la base de datos

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

let mockImages: WebsiteImage[] = [
  {
    id: '1',
    imageKey: 'hero_home',
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
    imageKey: 'gallery_1',
    title: 'Catedral de Antigua',
    description: 'Hermosa vista de la Catedral de Antigua Guatemala',
    imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop',
    cloudinaryPublicId: 'antigua-cathedral',
    altText: 'Catedral de Antigua Guatemala',
    isActive: true,
    sortOrder: 1,
    pageSection: 'gallery',
    pageType: 'home',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    imageKey: 'gallery_2',
    title: 'Volcán de Agua',
    description: 'Vista del Volcán de Agua desde Antigua',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    cloudinaryPublicId: 'volcan-agua',
    altText: 'Volcán de Agua',
    isActive: true,
    sortOrder: 2,
    pageSection: 'gallery',
    pageType: 'home',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

export function getMockImages(): WebsiteImage[] {
  return mockImages
}

export function addMockImage(image: Omit<WebsiteImage, 'id' | 'createdAt' | 'updatedAt'>): WebsiteImage {
  const newImage: WebsiteImage = {
    ...image,
    id: (mockImages.length + 1).toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  mockImages.push(newImage)
  console.log('📸 New image added to shared mock data:', newImage)
  console.log('📸 Total images in shared mock:', mockImages.length)
  
  return newImage
}

export function updateMockImage(id: string, updates: Partial<Omit<WebsiteImage, 'id' | 'createdAt'>>): WebsiteImage | null {
  const imageIndex = mockImages.findIndex(img => img.id === id)
  
  if (imageIndex === -1) {
    return null
  }
  
  mockImages[imageIndex] = {
    ...mockImages[imageIndex],
    ...updates,
    id: id, // Mantener el ID original
    updatedAt: new Date().toISOString()
  }
  
  console.log('📸 Image updated in shared mock data:', mockImages[imageIndex])
  
  return mockImages[imageIndex]
}

export function deleteMockImage(id: string): boolean {
  const imageIndex = mockImages.findIndex(img => img.id === id)
  
  if (imageIndex === -1) {
    return false
  }
  
  mockImages.splice(imageIndex, 1)
  console.log('📸 Image deleted from shared mock data:', id)
  
  return true
}



