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

    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const activityId = params.id
    const body = await request.json()
    const {
      startDate,
      endDate,
      bulkType,
      selectedDays,
      startTime,
      endTime,
      availableSpots,
      priceOverride,
      isActive
    } = body

    console.log('📅 Bulk schedule creation:', {
      activityId,
      startDate,
      endDate,
      bulkType,
      selectedDays,
      startTime,
      endTime
    })

    // Validaciones
    if (!startDate || !startTime || !endTime || !availableSpots || !selectedDays?.length) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      )
    }

    // Calcular fecha de fin según el tipo
    let finalEndDate = endDate
    const start = new Date(startDate)

    if (bulkType === 'week') {
      // Una semana desde la fecha de inicio
      finalEndDate = new Date(start)
      finalEndDate.setDate(start.getDate() + 6)
      finalEndDate = finalEndDate.toISOString().split('T')[0]
    } else if (bulkType === 'month') {
      // Un mes desde la fecha de inicio
      finalEndDate = new Date(start)
      finalEndDate.setMonth(start.getMonth() + 1)
      finalEndDate.setDate(start.getDate() - 1) // Último día del periodo
      finalEndDate = finalEndDate.toISOString().split('T')[0]
    }

    console.log('📅 Calculated end date:', finalEndDate)

    // Generar fechas válidas
    const datesToCreate = []
    const currentDate = new Date(start)
    const endDateObj = new Date(finalEndDate)

    while (currentDate <= endDateObj) {
      const dayOfWeek = currentDate.getDay()
      
      if (selectedDays.includes(dayOfWeek)) {
        datesToCreate.push(new Date(currentDate))
      }
      
      currentDate.setDate(currentDate.getDate() + 1)
    }

    console.log('📅 Dates to create schedules:', datesToCreate.map(d => d.toISOString().split('T')[0]))

    if (datesToCreate.length === 0) {
      return NextResponse.json(
        { error: 'No hay fechas válidas para crear horarios con los días seleccionados' },
        { status: 400 }
      )
    }

    // Verificar conflictos existentes
    const existingSchedules = await prisma.activitySchedule.findMany({
      where: {
        activityId: BigInt(activityId),
        date: {
          in: datesToCreate
        }
      },
      select: {
        date: true,
        startTime: true,
        endTime: true
      }
    })

    // Filtrar fechas que no tienen conflictos de horario
    const startTimeObj = new Date(`1970-01-01T${startTime}:00`)
    const endTimeObj = new Date(`1970-01-01T${endTime}:00`)

    const conflictingDates = existingSchedules.filter(existing => {
      const existingStart = existing.startTime
      const existingEnd = existing.endTime
      
      // Verificar superposición
      return (
        (startTimeObj < existingEnd && endTimeObj > existingStart)
      )
    }).map(s => s.date.toISOString().split('T')[0])

    const validDates = datesToCreate.filter(date => {
      const dateString = date.toISOString().split('T')[0]
      return !conflictingDates.includes(dateString)
    })

    console.log('📅 Valid dates after conflict check:', validDates.length)

    if (validDates.length === 0) {
      return NextResponse.json(
        { error: 'Todas las fechas tienen conflictos de horario existentes' },
        { status: 400 }
      )
    }

    // Crear horarios en lote
    const schedulesToCreate = validDates.map(date => ({
      activityId: BigInt(activityId),
      date: date,
      startTime: startTimeObj,
      endTime: endTimeObj,
      availableSpots: parseInt(availableSpots),
      priceOverride: priceOverride ? parseFloat(priceOverride) : null,
      isActive: isActive ?? true,
    }))

    const createdSchedules = await prisma.activitySchedule.createMany({
      data: schedulesToCreate,
      skipDuplicates: true
    })

    console.log('✅ Created schedules:', createdSchedules.count)

    return NextResponse.json({
      success: true,
      created: createdSchedules.count,
      skipped: datesToCreate.length - validDates.length,
      message: `Se crearon ${createdSchedules.count} horarios. ${datesToCreate.length - validDates.length} fechas omitidas por conflictos.`
    })

  } catch (error) {
    console.error('Error creating bulk schedules:', error)
    return NextResponse.json(
      { error: 'Error creando horarios masivos' },
      { status: 500 }
    )
  }
}
