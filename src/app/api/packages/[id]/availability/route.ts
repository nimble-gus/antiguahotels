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
    const { startDate, participants } = await request.json()

    console.log('📦 Checking package availability:', {
      packageId,
      startDate,
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

    // Validar participantes
    if (participants < packageData.minParticipants) {
      return NextResponse.json({
        available: false,
        message: `El paquete requiere mínimo ${packageData.minParticipants} participantes`
      })
    }

    if (packageData.maxParticipants && participants > packageData.maxParticipants) {
      return NextResponse.json({
        available: false,
        message: `El paquete permite máximo ${packageData.maxParticipants} participantes`
      })
    }

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

    console.log('📅 Package days calculated:', packageDays)

    // Validar disponibilidad de hoteles
    const hotelAvailability = []
    for (const packageHotel of packageData.packageHotels) {
      const checkInDay = packageHotel.checkInDay - 1 // Convertir a índice base 0
      const checkOutDay = checkInDay + packageHotel.nights
      
      if (checkInDay >= packageDays.length || checkOutDay > packageDays.length) {
        console.error('❌ Hotel booking days exceed package duration')
        continue
      }

      const checkInDate = packageDays[checkInDay].date
      const checkOutDate = packageDays[checkOutDay]?.date || 
        new Date(new Date(checkInDate).getTime() + packageHotel.nights * 24 * 60 * 60 * 1000)
          .toISOString().split('T')[0]

      console.log('🏨 Checking hotel availability:', {
        hotel: packageHotel.hotel.name,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        nights: packageHotel.nights
      })

      // Verificar disponibilidad del hotel usando la misma lógica que alojamientos
      const isHotelAvailable = await checkHotelAvailability(
        packageHotel.hotelId.toString(),
        packageHotel.roomTypeId.toString(),
        checkInDate,
        checkOutDate,
        participants
      )

      hotelAvailability.push({
        packageHotelId: packageHotel.id.toString(),
        hotelId: packageHotel.hotelId.toString(),
        hotelName: packageHotel.hotel.name,
        roomTypeId: packageHotel.roomTypeId.toString(),
        roomTypeName: packageHotel.roomType.name,
        checkInDay: packageHotel.checkInDay,
        checkInDate,
        checkOutDate,
        nights: packageHotel.nights,
        available: isHotelAvailable.available,
        message: isHotelAvailable.message,
        availableRooms: isHotelAvailable.availableRooms
      })

      if (!isHotelAvailable.available) {
        return NextResponse.json({
          available: false,
          message: `Hotel ${packageHotel.hotel.name} no disponible: ${isHotelAvailable.message}`,
          details: { hotelAvailability, activityAvailability: [] }
        })
      }
    }

    // Validar disponibilidad de actividades
    const activityAvailability = []
    for (const packageActivity of packageData.packageActivities) {
      const activityDay = packageActivity.dayNumber - 1 // Convertir a índice base 0
      
      if (activityDay >= packageDays.length) {
        console.error('❌ Activity day exceeds package duration')
        continue
      }

      const activityDate = packageDays[activityDay].date

      console.log('🎯 Checking activity availability:', {
        activity: packageActivity.activity.name,
        date: activityDate,
        dayNumber: packageActivity.dayNumber
      })

      // Buscar horarios disponibles para esa actividad en esa fecha
      const availableSchedules = await prisma.activitySchedule.findMany({
        where: {
          activityId: packageActivity.activityId,
          date: new Date(activityDate + 'T00:00:00'),
          isActive: true,
          availableSpots: {
            gte: participants // Suficientes cupos
          }
        },
        include: {
          _count: {
            select: {
              activityBookings: true
            }
          }
        }
      })

      // Filtrar horarios que realmente tienen cupos disponibles
      const viableSchedules = availableSchedules.filter(schedule => {
        const bookedSpots = schedule._count.activityBookings
        const availableSpots = schedule.availableSpots - bookedSpots
        return availableSpots >= participants
      })

      if (viableSchedules.length === 0) {
        return NextResponse.json({
          available: false,
          message: `Actividad ${packageActivity.activity.name} no tiene horarios disponibles el día ${packageActivity.dayNumber}`,
          details: { hotelAvailability, activityAvailability }
        })
      }

      // Seleccionar el primer horario disponible (se puede mejorar con lógica más inteligente)
      const selectedSchedule = viableSchedules[0]
      const bookedSpots = selectedSchedule._count.activityBookings
      const availableSpots = selectedSchedule.availableSpots - bookedSpots

      activityAvailability.push({
        packageActivityId: packageActivity.id.toString(),
        activityId: packageActivity.activityId.toString(),
        activityName: packageActivity.activity.name,
        dayNumber: packageActivity.dayNumber,
        date: activityDate,
        scheduleId: selectedSchedule.id.toString(),
        startTime: selectedSchedule.startTime,
        endTime: selectedSchedule.endTime,
        participantsIncluded: packageActivity.participantsIncluded || participants,
        available: true,
        availableSpots,
        selectedAutomatically: true
      })
    }

    console.log('✅ Package availability check completed successfully')

    return NextResponse.json({
      available: true,
      message: 'Paquete disponible para las fechas seleccionadas',
      details: {
        packageDays,
        hotelAvailability,
        activityAvailability,
        totalParticipants: participants,
        startDate,
        endDate: packageDays[packageDays.length - 1]?.date
      }
    })

  } catch (error) {
    console.error('Error checking package availability:', error)
    return NextResponse.json(
      { error: 'Error verificando disponibilidad del paquete' },
      { status: 500 }
    )
  }
}

// Función auxiliar para verificar disponibilidad de hotel
async function checkHotelAvailability(
  hotelId: string,
  roomTypeId: string,
  checkInDate: string,
  checkOutDate: string,
  participants: number
) {
  try {
    // Reutilizar la lógica de disponibilidad de alojamientos
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/check-availability`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        hotelId,
        roomTypeId,
        checkInDate,
        checkOutDate,
        participants
      })
    })

    if (response.ok) {
      return await response.json()
    } else {
      return { available: false, message: 'Error verificando disponibilidad del hotel' }
    }
  } catch (error) {
    console.error('Error checking hotel availability:', error)
    return { available: false, message: 'Error de conexión verificando hotel' }
  }
}








