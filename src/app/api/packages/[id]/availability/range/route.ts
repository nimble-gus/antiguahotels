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

    // Validar participantes básicos
    if (participants < packageData.minParticipants) {
      return NextResponse.json({
        availability: {},
        message: `El paquete requiere mínimo ${packageData.minParticipants} participantes`
      })
    }

    if (packageData.maxParticipants && participants > packageData.maxParticipants) {
      return NextResponse.json({
        availability: {},
        message: `El paquete permite máximo ${packageData.maxParticipants} participantes`
      })
    }

    // Generar fechas del rango
    const availability: { [date: string]: number } = {}
    const startDateObj = new Date(startDate + 'T00:00:00')
    const endDateObj = new Date(endDate + 'T00:00:00')
    
    console.log('📅 Checking availability from', startDate, 'to', endDate)

    // Verificar disponibilidad para cada fecha de inicio posible
    const currentDate = new Date(startDateObj)
    while (currentDate <= endDateObj) {
      const dateStr = currentDate.toISOString().split('T')[0]
      
      try {
        // Verificar disponibilidad para esta fecha de inicio
        const isAvailable = await checkPackageAvailabilityForDate(
          packageData, 
          dateStr, 
          participants
        )
        
        availability[dateStr] = isAvailable ? 1 : 0
        
        // Log cada 7 días para no saturar la consola
        if (currentDate.getDate() % 7 === 0) {
          console.log(`📦 ${dateStr}: ${isAvailable ? 'Disponible' : 'No disponible'}`)
        }
        
      } catch (error) {
        console.error(`Error checking availability for ${dateStr}:`, error)
        availability[dateStr] = 0
      }
      
      currentDate.setDate(currentDate.getDate() + 1)
    }

    const availableDates = Object.values(availability).filter(v => v > 0).length
    console.log(`✅ Availability check completed. ${availableDates} dates available`)

    return NextResponse.json({
      availability,
      message: `${availableDates} fechas disponibles en el rango`,
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
  for (const packageHotel of packageData.packageHotels) {
    const checkInDay = packageHotel.checkInDay - 1 // Convertir a índice base 0
    const checkOutDay = checkInDay + packageHotel.nights
    
    if (checkInDay >= packageDays.length || checkOutDay > packageDays.length) {
      continue // Skip si los días están fuera del rango del paquete
    }

    const checkInDate = packageDays[checkInDay].date
    const checkOutDate = packageDays[checkOutDay]?.date || 
      new Date(new Date(checkInDate).getTime() + packageHotel.nights * 24 * 60 * 60 * 1000)
        .toISOString().split('T')[0]

    // Verificar disponibilidad del hotel usando consulta directa optimizada
    const isHotelAvailable = await checkHotelAvailabilityDirect(
      packageHotel.hotelId.toString(),
      packageHotel.roomTypeId.toString(),
      checkInDate,
      checkOutDate,
      participants
    )

    if (!isHotelAvailable) {
      return false // Si cualquier hotel no está disponible, el paquete no está disponible
    }
  }

  // Verificar disponibilidad de actividades
  for (const packageActivity of packageData.packageActivities) {
    const activityDay = packageActivity.dayNumber - 1 // Convertir a índice base 0
    
    if (activityDay >= packageDays.length) {
      continue // Skip si el día está fuera del rango del paquete
    }

    const activityDate = packageDays[activityDay].date

    // Buscar horarios disponibles para esa actividad en esa fecha
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

    if (availableSchedules === 0) {
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
        roomTypeId: BigInt(roomTypeId),
        date: {
          gte: checkInDateObj,
          lt: checkOutDateObj // Excluir el día de checkout
        },
        isBlocked: true
      }
    })

    // Obtener total de habitaciones de este tipo
    const roomType = await prisma.roomType.findUnique({
      where: { id: BigInt(roomTypeId) },
      select: { totalRooms: true }
    })

    if (!roomType) return false

    // Verificar si hay habitaciones disponibles
    const availableRooms = roomType.totalRooms - blockedRooms
    return availableRooms > 0

  } catch (error) {
    console.error('Error checking hotel availability directly:', error)
    return false
  }
}
