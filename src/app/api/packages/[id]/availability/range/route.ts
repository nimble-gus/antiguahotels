import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const packageId = params.id
    const { startDate, endDate, participants } = await request.json()

    console.log('📦 Checking package availability range:', {
      packageId,
      startDate,
      endDate,
      participants
    })

    // Obtener el paquete completo con sus hoteles y actividades
    const packageData = await prisma.package.findUnique({
      where: { id: BigInt(packageId) },
      include: {
        packageHotels: {
          include: {
            hotel: {
              select: {
                id: true,
                name: true,
                checkInTime: true,
                checkOutTime: true
              }
            },
            roomType: {
              select: {
                id: true,
                name: true,
                occupancy: true
              }
            }
          }
        },
        packageActivities: {
          include: {
            activity: {
              select: {
                id: true,
                name: true,
                minParticipants: true,
                maxParticipants: true
              }
            }
          }
        }
      }
    })

    if (!packageData) {
      return NextResponse.json({ error: 'Paquete no encontrado' }, { status: 404 })
    }

    console.log('📦 Package data loaded:', {
      name: packageData.name,
      hotelsCount: packageData.packageHotels.length,
      activitiesCount: packageData.packageActivities.length,
      durationDays: packageData.durationDays
    })

    // Verificar si el paquete tiene hoteles y actividades
    if (packageData.packageHotels.length === 0) {
      console.log('❌ Package has no hotels associated')
      return NextResponse.json({
        availability: {},
        message: 'El paquete no tiene hoteles configurados'
      })
    }

    if (packageData.packageActivities.length === 0) {
      console.log('❌ Package has no activities associated')
      return NextResponse.json({
        availability: {},
        message: 'El paquete no tiene actividades configuradas'
      })
    }

    // Validar participantes básicos
    console.log('👥 Validating participants:', {
      requested: participants,
      min: packageData.minParticipants,
      max: packageData.maxParticipants,
      capacity: packageData.capacity
    })

    if (participants < packageData.minParticipants) {
      console.log(`❌ Not enough participants: ${participants} < ${packageData.minParticipants}`)
      return NextResponse.json({
        availability: {},
        message: `El paquete requiere mínimo ${packageData.minParticipants} participantes`
      })
    }

    if (packageData.maxParticipants && participants > packageData.maxParticipants) {
      console.log(`❌ Too many participants: ${participants} > ${packageData.maxParticipants}`)
      return NextResponse.json({
        availability: {},
        message: `El paquete permite máximo ${packageData.maxParticipants} participantes`
      })
    }

    console.log('✅ Participants validation passed')

    console.log('📅 Creating simple availability response...')

    // SUPER SIMPLE: Solo crear un objeto básico de disponibilidad
    const availability: { [date: string]: number } = {}
    
    // Generar 30 días de disponibilidad desde hoy
    const today = new Date()
    for (let i = 0; i < 30; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      const dateStr = date.toISOString().split('T')[0]
      availability[dateStr] = 1 // Todas disponibles temporalmente
    }
    
    console.log('✅ Simple availability created for 30 days')

    const availableDates = Object.values(availability).filter(v => v > 0).length

    return NextResponse.json({
      availability,
      message: `${availableDates} fechas disponibles (temporal)`,
      packageInfo: {
        name: packageData.name,
        durationDays: packageData.durationDays,
        durationNights: packageData.durationNights,
        hotelsCount: packageData.packageHotels.length,
        activitiesCount: packageData.packageActivities.length
      }
    })

  } catch (error) {
    console.error('Error checking package availability range:', error)
    return NextResponse.json(
      { error: 'Error verificando disponibilidad del paquete' },
      { status: 500 }
    )
  }
}

// Función auxiliar optimizada para verificar disponibilidad de un paquete en una fecha
async function checkPackageAvailabilityForDate(
  packageData: any,
  startDate: string,
  participants: number
): Promise<boolean> {
  console.log(`🔍 checkPackageAvailabilityForDate called for ${startDate}`)
  
  // Calcular fechas del paquete
  const startDateObj = new Date(startDate + 'T00:00:00')
  const packageDays = []
  
  for (let day = 0; day < packageData.durationDays; day++) {
    const currentDate = new Date(startDateObj)
    currentDate.setDate(startDateObj.getDate() + day)
    packageDays.push({
      dayNumber: day + 1,
      date: currentDate.toISOString().split('T')[0]
    })
  }

  // Verificar disponibilidad de hoteles
  console.log('🏨 Checking hotel availability for', packageData.packageHotels.length, 'hotels')
  for (const packageHotel of packageData.packageHotels) {
    const checkInDay = packageHotel.checkInDay - 1 // Convertir a índice base 0
    const checkOutDay = checkInDay + packageHotel.nights
    
    console.log('🏨 Hotel check:', {
      hotelId: packageHotel.hotelId.toString(),
      roomTypeId: packageHotel.roomTypeId.toString(),
      checkInDay: packageHotel.checkInDay,
      nights: packageHotel.nights,
      calculatedCheckInDay: checkInDay,
      calculatedCheckOutDay: checkOutDay,
      packageDaysLength: packageDays.length
    })
    
    if (checkInDay >= packageDays.length || checkOutDay > packageDays.length) {
      console.log('❌ Hotel booking days exceed package duration, skipping')
      continue // Skip si los días están fuera del rango del paquete
    }

    const checkInDate = packageDays[checkInDay].date
    const checkOutDate = packageDays[checkOutDay]?.date || 
      new Date(new Date(checkInDate).getTime() + packageHotel.nights * 24 * 60 * 60 * 1000)
        .toISOString().split('T')[0]

    console.log('🏨 Hotel dates:', { checkInDate, checkOutDate })

    // Verificar disponibilidad del hotel usando consulta directa optimizada
    const isHotelAvailable = await checkHotelAvailabilityDirect(
      packageHotel.hotelId.toString(),
      packageHotel.roomTypeId.toString(),
      checkInDate,
      checkOutDate,
      participants
    )

    console.log('🏨 Hotel availability result:', isHotelAvailable)

    if (!isHotelAvailable) {
      console.log('❌ Hotel not available, package not available for this date')
      return false // Si cualquier hotel no está disponible, el paquete no está disponible
    }
  }

  // Verificar disponibilidad de actividades
  console.log('🎯 Checking activity availability for', packageData.packageActivities.length, 'activities')
  for (const packageActivity of packageData.packageActivities) {
    const activityDay = packageActivity.dayNumber - 1 // Convertir a índice base 0
    
    console.log('🎯 Activity check:', {
      activityId: packageActivity.activityId.toString(),
      dayNumber: packageActivity.dayNumber,
      calculatedActivityDay: activityDay,
      packageDaysLength: packageDays.length
    })
    
    if (activityDay >= packageDays.length) {
      console.log('❌ Activity day exceeds package duration, skipping')
      continue // Skip si el día está fuera del rango del paquete
    }

    const activityDate = packageDays[activityDay].date
    console.log('🎯 Activity date:', activityDate)

    // Buscar horarios disponibles para esa actividad en esa fecha
    const totalSchedules = await prisma.activitySchedule.count({
      where: {
        activityId: packageActivity.activityId,
        date: new Date(activityDate + 'T00:00:00')
      }
    })

    const availableSchedules = await prisma.activitySchedule.count({
      where: {
        activityId: packageActivity.activityId,
        date: new Date(activityDate + 'T00:00:00'),
        isActive: true,
        availableSpots: {
          gte: participants
        }
      }
    })

    console.log('🎯 Activity schedules:', {
      activityId: packageActivity.activityId.toString(),
      date: activityDate,
      totalSchedules,
      availableSchedules,
      requiredParticipants: participants
    })

    // TEMPORALMENTE: Si no hay horarios para esta actividad, simplemente continuar
    // En producción, esto debería ser más estricto
    if (totalSchedules === 0) {
      console.log('⚠️ No schedules found for activity, but continuing (should create schedules)')
      continue
    }

    if (availableSchedules === 0) {
      console.log('❌ No available schedules for activity, package not available for this date')
      return false // Si cualquier actividad no tiene horarios disponibles, el paquete no está disponible
    }
  }

  return true // Todos los hoteles y actividades están disponibles
}

// Función auxiliar optimizada para verificar disponibilidad de hotel
async function checkHotelAvailabilityDirect(
  hotelId: string,
  roomTypeId: string,
  checkInDate: string,
  checkOutDate: string,
  participants: number
): Promise<boolean> {
  try {
    // Consulta directa a la base de datos para verificar disponibilidad
    const checkInDateObj = new Date(checkInDate + 'T00:00:00')
    const checkOutDateObj = new Date(checkOutDate + 'T00:00:00')

    // Contar habitaciones bloqueadas en el rango de fechas
    const blockedRooms = await prisma.roomInventory.count({
      where: {
        room: {
          roomTypeId: BigInt(roomTypeId)
        },
        stayDate: {
          gte: checkInDateObj,
          lt: checkOutDateObj // Excluir el día de checkout
        },
        isBlocked: true
      }
    })

    // Obtener total de habitaciones de este tipo
    const roomType = await prisma.roomType.findUnique({
      where: { id: BigInt(roomTypeId) },
      select: { 
        rooms: {
          select: { id: true }
        }
      }
    })

    if (!roomType) return false

    // Verificar si hay habitaciones disponibles
    const availableRooms = roomType.rooms.length - blockedRooms
    return availableRooms > 0

  } catch (error) {
    console.error('Error checking hotel availability directly:', error)
    return false
  }
}
