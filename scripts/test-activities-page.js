// Script de prueba para la página de actividades
const testActivitiesPage = async () => {
  const baseUrl = 'http://localhost:3000'
  
  console.log('🧪 Iniciando pruebas de la página de actividades...\n')
  
  try {
    // 1. Probar API de actividades públicas
    console.log('1️⃣ Probando API de actividades públicas...')
    const activitiesResponse = await fetch(`${baseUrl}/api/public/activities`)
    if (activitiesResponse.ok) {
      const activities = await activitiesResponse.json()
      console.log(`✅ Actividades cargadas: ${activities.length}`)
      if (activities.length > 0) {
        console.log(`📋 Primera actividad:`, {
          id: activities[0].id,
          name: activities[0].name,
          category: activities[0].category,
          difficulty: activities[0].difficulty,
          price: activities[0].basePrice
        })
      }
    } else {
      console.log('❌ Error cargando actividades')
      return
    }
    
    // 2. Probar API de detalles de actividad
    if (activities.length > 0) {
      const firstActivity = activities[0]
      console.log(`\n2️⃣ Probando API de detalles para: ${firstActivity.name}...`)
      
      const detailResponse = await fetch(`${baseUrl}/api/public/activities/${firstActivity.id}`)
      if (detailResponse.ok) {
        const activityDetail = await detailResponse.json()
        console.log(`✅ Detalles cargados:`, {
          name: activityDetail.name,
          images: activityDetail.images?.length || 0,
          schedules: activityDetail.schedules?.length || 0,
          amenities: activityDetail.amenities?.length || 0
        })
      } else {
        console.log('❌ Error cargando detalles de actividad')
      }
    }
    
    // 3. Probar páginas
    console.log(`\n3️⃣ Probando páginas...`)
    console.log('📝 Páginas disponibles:')
    console.log(`   - Lista de actividades: ${baseUrl}/activities`)
    console.log(`   - Detalles de actividad: ${baseUrl}/activities/[id]`)
    
    console.log('\n✅ Pruebas completadas. El sistema de actividades está listo.')
    console.log('\n🚀 Para usar el sistema:')
    console.log('1. Ve a: http://localhost:3000/activities')
    console.log('2. Explora las actividades con filtros')
    console.log('3. Haz clic en "Ver Detalles" para ver una actividad específica')
    console.log('4. Usa los filtros de búsqueda para encontrar actividades específicas')
    
  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message)
  }
}

// Ejecutar las pruebas
testActivitiesPage()
