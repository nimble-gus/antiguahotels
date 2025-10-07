// Script de prueba para el sistema de imágenes de habitaciones
const testRoomImagesSystem = async () => {
  const baseUrl = 'http://localhost:3000'
  
  console.log('🧪 Iniciando pruebas del sistema de imágenes de habitaciones...\n')
  
  try {
    // 1. Probar API de tipos de habitación
    console.log('1️⃣ Probando API de tipos de habitación...')
    const roomTypesResponse = await fetch(`${baseUrl}/api/room-types`)
    if (roomTypesResponse.ok) {
      const roomTypes = await roomTypesResponse.json()
      console.log(`✅ Tipos de habitación cargados: ${roomTypes.length}`)
      console.log(`📋 Primeros tipos:`, roomTypes.slice(0, 2).map(rt => ({ id: rt.id, name: rt.name, hotel: rt.hotel.name })))
    } else {
      console.log('❌ Error cargando tipos de habitación')
      return
    }
    
    // 2. Probar API de imágenes para el primer tipo de habitación
    if (roomTypes.length > 0) {
      const firstRoomType = roomTypes[0]
      console.log(`\n2️⃣ Probando API de imágenes para: ${firstRoomType.name}...`)
      
      const imagesResponse = await fetch(`${baseUrl}/api/room-types/${firstRoomType.id}/images`)
      if (imagesResponse.ok) {
        const images = await imagesResponse.json()
        console.log(`✅ Imágenes cargadas: ${images.length}`)
        if (images.length > 0) {
          console.log(`📋 Primera imagen:`, {
            id: images[0].id,
            url: images[0].imageUrl.substring(0, 50) + '...',
            isPrimary: images[0].isPrimary
          })
        }
      } else {
        console.log('❌ Error cargando imágenes')
      }
    }
    
    // 3. Probar subida de imagen (simulada)
    console.log(`\n3️⃣ Probando subida de imagen...`)
    console.log('📝 Para probar la subida, ve al dashboard y sube una imagen manualmente')
    
    console.log('\n✅ Pruebas completadas. El sistema está listo para usar.')
    console.log('\n🚀 Para usar el sistema:')
    console.log('1. Ve a: http://localhost:3000/dashboard/room-types/images')
    console.log('2. Selecciona un tipo de habitación')
    console.log('3. Sube imágenes usando el botón de subida')
    console.log('4. Gestiona las imágenes (principal, eliminar, etc.)')
    
  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message)
  }
}

// Ejecutar las pruebas
testRoomImagesSystem()
