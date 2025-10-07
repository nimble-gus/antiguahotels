// Script para insertar actividades de muestra usando Prisma
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const sampleActivities = [
  {
    name: 'Tour Volcán Pacaya',
    description: 'Una aventura única al volcán activo más accesible de Guatemala. Disfruta de vistas espectaculares y experimenta la fuerza de la naturaleza.',
    shortDescription: 'Aventura al volcán activo con vistas espectaculares',
    basePrice: 45.00,
    currency: 'USD',
    durationHours: 4.00,
    minParticipants: 2,
    maxParticipants: 12,
    location: 'Volcán Pacaya, Escuintla',
    difficultyLevel: 'moderate',
    isActive: true,
    isFeatured: true,
    featuredOrder: 1,
  },
  {
    name: 'City Tour Antigua Guatemala',
    description: 'Recorrido histórico por la ciudad colonial más hermosa de Guatemala. Descubre la rica historia y arquitectura colonial.',
    shortDescription: 'Recorrido histórico por la ciudad colonial',
    basePrice: 25.00,
    currency: 'USD',
    durationHours: 3.00,
    minParticipants: 1,
    maxParticipants: 15,
    location: 'Antigua Guatemala, Sacatepéquez',
    difficultyLevel: 'easy',
    isActive: true,
    isFeatured: true,
    featuredOrder: 2,
  },
  {
    name: 'Mercado y Clase de Cocina Local',
    description: 'Experiencia gastronómica auténtica visitando mercados locales y aprendiendo a cocinar platos tradicionales guatemaltecos.',
    shortDescription: 'Experiencia gastronómica con cocina tradicional',
    basePrice: 35.00,
    currency: 'USD',
    durationHours: 3.50,
    minParticipants: 2,
    maxParticipants: 8,
    location: 'Antigua Guatemala, Sacatepéquez',
    difficultyLevel: 'easy',
    isActive: true,
    isFeatured: false,
    featuredOrder: null,
  },
  {
    name: 'Trekking a la Cima del Volcán Acatenango',
    description: 'Desafiante caminata al volcán Acatenango con campamento nocturno y vistas del volcán Fuego en erupción.',
    shortDescription: 'Caminata desafiante con campamento nocturno',
    basePrice: 85.00,
    currency: 'USD',
    durationHours: 24.00,
    minParticipants: 2,
    maxParticipants: 8,
    location: 'Volcán Acatenango, Sacatepéquez',
    difficultyLevel: 'challenging',
    isActive: true,
    isFeatured: false,
    featuredOrder: null,
  },
  {
    name: 'Tour de Café en Finca Local',
    description: 'Visita a una finca de café tradicional donde aprenderás sobre el proceso de cultivo y producción del café guatemalteco.',
    shortDescription: 'Visita educativa a finca de café tradicional',
    basePrice: 30.00,
    currency: 'USD',
    durationHours: 2.50,
    minParticipants: 1,
    maxParticipants: 10,
    location: 'Finca de Café, Antigua Guatemala',
    difficultyLevel: 'easy',
    isActive: true,
    isFeatured: false,
    featuredOrder: null,
  }
]

const sampleSchedules = [
  // Tour Volcán Pacaya - 2 horarios
  { activity_name: 'Tour Volcán Pacaya', start_time: '06:00:00', end_time: '10:00:00', available_spots: 8, total_spots: 12 },
  { activity_name: 'Tour Volcán Pacaya', start_time: '06:00:00', end_time: '10:00:00', available_spots: 8, total_spots: 12 },
  
  // City Tour Antigua Guatemala - 2 horarios
  { activity_name: 'City Tour Antigua Guatemala', start_time: '09:00:00', end_time: '12:00:00', available_spots: 10, total_spots: 15 },
  { activity_name: 'City Tour Antigua Guatemala', start_time: '09:00:00', end_time: '12:00:00', available_spots: 10, total_spots: 15 },
  
  // Mercado y Clase de Cocina Local - 2 horarios
  { activity_name: 'Mercado y Clase de Cocina Local', start_time: '08:00:00', end_time: '11:30:00', available_spots: 6, total_spots: 8 },
  { activity_name: 'Mercado y Clase de Cocina Local', start_time: '08:00:00', end_time: '11:30:00', available_spots: 6, total_spots: 8 },
  
  // Trekking Acatenango - 1 horario
  { activity_name: 'Trekking a la Cima del Volcán Acatenango', start_time: '14:00:00', end_time: '14:00:00', available_spots: 4, total_spots: 8 },
  
  // Tour de Café - 2 horarios
  { activity_name: 'Tour de Café en Finca Local', start_time: '10:00:00', end_time: '12:30:00', available_spots: 8, total_spots: 10 },
  { activity_name: 'Tour de Café en Finca Local', start_time: '10:00:00', end_time: '12:30:00', available_spots: 8, total_spots: 10 },
]

async function seedActivities() {
  try {
    console.log('🌱 Iniciando inserción de actividades de muestra...\n')
    
    // Verificar si ya existen actividades
    const existingCount = await prisma.activity.count()
    console.log(`📊 Actividades existentes en la BD: ${existingCount}`)
    
    if (existingCount > 0) {
      console.log('⚠️ Ya existen actividades en la base de datos.')
      console.log('¿Deseas continuar? Esto agregará más actividades...')
      // Por ahora continuamos, pero en producción podrías preguntar al usuario
    }
    
    // Insertar actividades
    console.log('\n1️⃣ Insertando actividades...')
    const createdActivities = []
    
    for (const activityData of sampleActivities) {
      try {
        const activity = await prisma.activity.create({
          data: activityData
        })
        createdActivities.push(activity)
        console.log(`✅ Creada: ${activity.name} (ID: ${activity.id})`)
      } catch (error) {
        console.log(`❌ Error creando ${activityData.name}:`, error.message)
      }
    }
    
    console.log(`\n📋 Total actividades creadas: ${createdActivities.length}`)
    
    // Insertar horarios
    console.log('\n2️⃣ Insertando horarios...')
    let schedulesCreated = 0
    
    for (const scheduleData of sampleSchedules) {
      try {
        // Buscar la actividad por nombre
        const activity = await prisma.activity.findFirst({
          where: { name: scheduleData.activity_name }
        })
        
        if (activity) {
          // Crear horarios para hoy y mañana
          const today = new Date()
          const tomorrow = new Date(today)
          tomorrow.setDate(tomorrow.getDate() + 1)
          
          for (const date of [today, tomorrow]) {
            await prisma.activitySchedule.create({
              data: {
                activity_id: activity.id,
                start_time: scheduleData.start_time,
                end_time: scheduleData.end_time,
                date: date,
                available_spots: scheduleData.available_spots,
                total_spots: scheduleData.total_spots,
                is_active: true
              }
            })
            schedulesCreated++
          }
          console.log(`✅ Horarios creados para: ${activity.name}`)
        } else {
          console.log(`⚠️ No se encontró la actividad: ${scheduleData.activity_name}`)
        }
      } catch (error) {
        console.log(`❌ Error creando horarios para ${scheduleData.activity_name}:`, error.message)
      }
    }
    
    console.log(`\n📅 Total horarios creados: ${schedulesCreated}`)
    
    // Verificar resultados
    console.log('\n3️⃣ Verificando resultados...')
    const finalCount = await prisma.activity.count()
    const schedulesCount = await prisma.activitySchedule.count()
    
    console.log(`📊 Actividades totales en BD: ${finalCount}`)
    console.log(`📅 Horarios totales en BD: ${schedulesCount}`)
    
    // Mostrar actividades creadas
    console.log('\n📋 Actividades en la base de datos:')
    const allActivities = await prisma.activity.findMany({
      select: {
        id: true,
        name: true,
        difficultyLevel: true,
        basePrice: true,
        durationHours: true,
        isActive: true,
        isFeatured: true
      },
      orderBy: { createdAt: 'desc' }
    })
    
    allActivities.forEach((activity, index) => {
      console.log(`${index + 1}. ${activity.name}`)
      console.log(`   - ID: ${activity.id}`)
      console.log(`   - Dificultad: ${activity.difficultyLevel}`)
      console.log(`   - Precio: $${activity.basePrice}`)
      console.log(`   - Duración: ${activity.durationHours} horas`)
      console.log(`   - Activa: ${activity.isActive}`)
      console.log(`   - Destacada: ${activity.isFeatured}`)
      console.log('')
    })
    
    console.log('🎉 ¡Inserción completada exitosamente!')
    
  } catch (error) {
    console.error('❌ Error durante la inserción:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar el script
seedActivities()
