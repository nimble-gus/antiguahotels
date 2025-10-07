// Script simple para probar la carga de actividades
const testActivitiesLoading = async () => {
  const baseUrl = 'http://localhost:3000'
  
  console.log('🧪 Probando carga de actividades...\n')
  
  try {
    // Probar API de actividades
    console.log('1️⃣ Probando API de actividades...')
    const response = await fetch(`${baseUrl}/api/public/activities`)
    
    if (response.ok) {
      const activities = await response.json()
      console.log(`✅ Actividades cargadas: ${activities.length}`)
      
      if (activities.length > 0) {
        console.log('\n📋 Primeras 3 actividades:')
        activities.slice(0, 3).forEach((activity, index) => {
          console.log(`${index + 1}. ${activity.name}`)
          console.log(`   - ID: ${activity.id}`)
          console.log(`   - Categoría: ${activity.category}`)
          console.log(`   - Dificultad: ${activity.difficulty}`)
          console.log(`   - Precio: $${activity.basePrice}`)
          console.log(`   - Duración: ${activity.duration} min`)
          console.log(`   - Ubicación: ${activity.location}`)
          console.log(`   - Imágenes: ${activity.images?.length || 0}`)
          console.log(`   - Horarios: ${activity.schedules?.length || 0}`)
          console.log(`   - Activa: ${activity.isActive}`)
          console.log('')
        })
      } else {
        console.log('⚠️ No hay actividades en la base de datos')
      }
    } else {
      const error = await response.text()
      console.log('❌ Error en la API:', response.status, error)
    }
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error.message)
  }
}

// Ejecutar la prueba
testActivitiesLoading()
