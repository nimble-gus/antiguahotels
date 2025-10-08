// Script para probar que las imágenes de hoteles se cargan correctamente
const testHotelImages = async () => {
  try {
    console.log('🔍 Probando API de hoteles con imágenes...')
    
    const response = await fetch('http://localhost:3000/api/hotels?active=true&limit=5')
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('✅ Respuesta de la API:', data)
    
    if (data.hotels && data.hotels.length > 0) {
      console.log(`📊 Total de hoteles: ${data.hotels.length}`)
      
      data.hotels.forEach((hotel, index) => {
        console.log(`\n🏨 Hotel ${index + 1}: ${hotel.name}`)
        console.log(`   - ID: ${hotel.id}`)
        console.log(`   - Logo URL: ${hotel.logoUrl || 'No logo'}`)
        console.log(`   - Imágenes: ${hotel.images ? hotel.images.length : 0}`)
        
        if (hotel.images && hotel.images.length > 0) {
          hotel.images.forEach((img, imgIndex) => {
            console.log(`     Imagen ${imgIndex + 1}:`)
            console.log(`       - URL: ${img.imageUrl}`)
            console.log(`       - Es primaria: ${img.isPrimary}`)
            console.log(`       - Alt text: ${img.altText || 'Sin alt text'}`)
          })
        } else {
          console.log('     ⚠️  No hay imágenes en entity_images')
        }
      })
    } else {
      console.log('❌ No se encontraron hoteles')
    }
    
  } catch (error) {
    console.error('❌ Error probando API:', error)
  }
}

// Ejecutar si estamos en el navegador
if (typeof window !== 'undefined') {
  testHotelImages()
} else {
  console.log('Ejecuta este script en la consola del navegador')
}

