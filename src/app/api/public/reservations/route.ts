import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createLocalDate, calculateNights, isValidDateRange } from '@/lib/date-utils'
import { onReservationCreated } from '@/lib/notifications/triggers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      itemType,
      guestInfo,
      // Campos para alojamiento
      hotelId,
      roomTypeId,
      checkInDate,
      checkOutDate,
      adults,
      children,
      specialRequests,
      guestName,
      // Campos para actividades
      activityId,
      scheduleId,
      participants,
      participantNames,
      emergencyContact,
      emergencyPhone,
      // Campos para paquetes
      packageId,
      startDate,
      endDate,
      // Campos para shuttle
      shuttleRouteId,
      date,
      departureTime,
      passengers
    } = body

    console.log('🎯 Public reservation request:', { itemType, guestInfo })

    // Validaciones básicas
    if (!guestInfo || !itemType) {
      return NextResponse.json(
        { error: 'Información del huésped y tipo de reservación son requeridos' },
        { status: 400 }
      )
    }

    // Validar información del huésped
    const { firstName, lastName, email, phone } = guestInfo
    if (!firstName || !lastName || !email || !phone) {
      return NextResponse.json(
        { error: 'Información del huésped incompleta' },
        { status: 400 }
      )
    }

    // Crear o encontrar huésped
    let guest = await prisma.guest.findFirst({
      where: { email: guestInfo.email }
    })

    if (!guest) {
      guest = await prisma.guest.create({
        data: {
          firstName: guestInfo.firstName,
          lastName: guestInfo.lastName,
          email: guestInfo.email,
          phone: guestInfo.phone,
          nationality: guestInfo.nationality || 'Guatemala',
          country: guestInfo.nationality || 'Guatemala'
        }
      })
      console.log('✅ Guest created:', guest.id.toString())
    } else {
      // Actualizar información del huésped existente
      guest = await prisma.guest.update({
        where: { id: guest.id },
        data: {
          firstName: guestInfo.firstName,
          lastName: guestInfo.lastName,
          phone: guestInfo.phone,
          nationality: guestInfo.nationality || guest.nationality,
          country: guestInfo.nationality || guest.country
        }
      })
      console.log('✅ Guest updated:', guest.id.toString())
    }

    // Generar número de confirmación
    const confirmationNumber = `ANT-${Date.now().toString().slice(-8)}`

    // Validaciones específicas por tipo
    if (itemType === 'ACCOMMODATION') {
      if (!hotelId || !roomTypeId || !checkInDate || !checkOutDate || !adults) {
        return NextResponse.json(
          { error: 'Datos de alojamiento requeridos: hotel, tipo de habitación, fechas y adultos' },
          { status: 400 }
        )
      }

      // Validar fechas
      if (!isValidDateRange(checkInDate, checkOutDate)) {
        return NextResponse.json(
          { error: 'Rango de fechas inválido' },
          { status: 400 }
        )
      }

      // Crear fechas locales
      const checkIn = createLocalDate(checkInDate)
      const checkOut = createLocalDate(checkOutDate)
      const nights = calculateNights(checkInDate, checkOutDate)

      // Obtener información del hotel y tipo de habitación
      const [hotel, roomType] = await Promise.all([
        prisma.hotel.findUnique({
          where: { id: BigInt(hotelId) }
        }),
        prisma.roomType.findUnique({
          where: { id: BigInt(roomTypeId) }
        })
      ])

      if (!hotel) {
        return NextResponse.json(
          { error: 'Hotel no encontrado' },
          { status: 404 }
        )
      }

      if (!roomType) {
        return NextResponse.json(
          { error: 'Tipo de habitación no encontrado' },
          { status: 404 }
        )
      }

      // Calcular precio total (por noche, no por huésped)
      const totalAmount = parseFloat(roomType.baseRate.toString()) * nights

      // Crear reservación
      const reservation = await prisma.reservation.create({
        data: {
          guestId: guest.id,
          checkin: checkIn,
          checkout: checkOut,
          totalAmount: totalAmount,
          currency: 'USD',
          status: 'CONFIRMED',
          paymentStatus: 'PENDING',
          confirmationNumber,
          specialRequests: specialRequests || null,
          notes: `Reserva de alojamiento - ${hotel.name} - ${roomType.name}`,
          source: 'PUBLIC_WEBSITE'
        }
      })

      // Crear item de reservación
      await prisma.reservationItem.create({
        data: {
          reservationId: reservation.id,
          itemType: 'ACCOMMODATION',
          title: `${hotel.name} - ${roomType.name}`,
          quantity: adults,
          unitPrice: parseFloat(roomType.baseRate.toString()),
          amount: totalAmount,
          meta: {
            hotelId: hotelId,
            roomTypeId: roomTypeId,
            hotelName: hotel.name,
            roomTypeName: roomType.name,
            adults: adults,
            children: children || 0,
            nights: nights,
            checkIn: checkInDate,
            checkOut: checkOutDate
          } as any
        }
      })

      // Disparar notificaciones por correo
      try {
        await onReservationCreated(reservation.id)
        console.log('✅ Email notifications triggered for reservation:', reservation.id.toString())
      } catch (emailError) {
        console.error('❌ Error sending email notifications:', emailError)
        // No fallar la reservación si fallan los emails
      }

      return NextResponse.json({
        success: true,
        reservationId: reservation.id.toString(),
        confirmationNumber,
        message: 'Reservación de alojamiento creada exitosamente'
      })

    } else if (itemType === 'ACTIVITY') {
      if (!activityId || !scheduleId || !participants) {
        return NextResponse.json(
          { error: 'Datos de actividad requeridos: actividad, horario y participantes' },
          { status: 400 }
        )
      }

      // Obtener información de la actividad y el horario
      const [activity, schedule] = await Promise.all([
        prisma.activity.findUnique({
          where: { id: BigInt(activityId) }
        }),
        prisma.activitySchedule.findUnique({
          where: { id: BigInt(scheduleId) }
        })
      ])

      if (!activity) {
        return NextResponse.json(
          { error: 'Actividad no encontrada' },
          { status: 404 }
        )
      }

      if (!schedule) {
        return NextResponse.json(
          { error: 'Horario no encontrado' },
          { status: 404 }
        )
      }

      // Calcular precio total
      const totalAmount = parseFloat(activity.basePrice.toString()) * participants

      // Crear reservación
      const reservation = await prisma.reservation.create({
        data: {
          guestId: guest.id,
          checkin: schedule.date,
          checkout: schedule.date, // Para actividades, check-in y check-out son el mismo día
          totalAmount: totalAmount,
          currency: activity.currency,
          status: 'CONFIRMED',
          paymentStatus: 'PENDING',
          confirmationNumber,
          specialRequests: specialRequests || null,
          notes: `Reserva de actividad - ${activity.name}`,
          source: 'PUBLIC_WEBSITE'
        }
      })

      // Crear item de reservación
      const reservationItem = await prisma.reservationItem.create({
        data: {
          reservationId: reservation.id,
          itemType: 'ACTIVITY',
          title: `${activity.name} - ${schedule.date.toISOString().split('T')[0]}`,
          quantity: participants,
          unitPrice: parseFloat(activity.basePrice.toString()),
          amount: totalAmount,
          meta: {
            activityId: activityId,
            scheduleId: scheduleId,
            participants: participants,
            participantNames: participantNames || `${firstName} ${lastName}`,
            emergencyContact: emergencyContact || null,
            emergencyPhone: emergencyPhone || null
          } as any
        }
      })

      // Crear detalle de actividad (como en el dashboard)
      await prisma.activityBooking.create({
        data: {
          reservationItemId: reservationItem.id,
          activityId: BigInt(activityId),
          scheduleId: BigInt(scheduleId),
          activityDate: schedule.date,
          startTime: schedule.startTime,
          participants: participants,
          participantNames: participantNames || `${firstName} ${lastName}`,
          emergencyContact: emergencyContact || null,
          emergencyPhone: emergencyPhone || null,
        }
      })

      // Actualizar disponibilidad del horario
      await prisma.activitySchedule.update({
        where: { id: BigInt(scheduleId) },
        data: {
          availableSpots: {
            decrement: participants
          }
        }
      })

      // Disparar notificaciones por correo
      try {
        await onReservationCreated(reservation.id)
        console.log('✅ Email notifications triggered for reservation:', reservation.id.toString())
      } catch (emailError) {
        console.error('❌ Error sending email notifications:', emailError)
        // No fallar la reservación si fallan los emails
      }

      return NextResponse.json({
        success: true,
        reservationId: reservation.id.toString(),
        confirmationNumber,
        message: 'Reservación de actividad creada exitosamente'
      })

    } else if (itemType === 'PACKAGE') {
      if (!packageId || !startDate || !endDate || !participants) {
        return NextResponse.json(
          { error: 'Datos de paquete requeridos: paquete, fechas de inicio y fin, y participantes' },
          { status: 400 }
        )
      }

      // Obtener información completa del paquete con sus componentes
      const packageData = await prisma.package.findUnique({
        where: { id: BigInt(packageId) },
        include: {
          packageHotels: {
            include: {
              hotel: true,
              roomType: true
            }
          },
          packageActivities: {
            include: {
              activity: true
            }
          }
        }
      })

      if (!packageData) {
        return NextResponse.json(
          { error: 'Paquete no encontrado' },
          { status: 404 }
        )
      }

      // Validar disponibilidad de componentes del paquete
      const startDateObj = new Date(startDate)
      const endDateObj = new Date(endDate)
      const nights = Math.ceil((endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24))

      // Verificar disponibilidad de habitaciones
      for (const packageHotel of packageData.packageHotels) {
        const checkInDate = new Date(startDateObj)
        checkInDate.setDate(checkInDate.getDate() + packageHotel.checkInDay - 1)
        
        const checkOutDate = new Date(checkInDate)
        checkOutDate.setDate(checkOutDate.getDate() + packageHotel.nights)

        // Verificar disponibilidad de habitaciones (simplificado - en producción usar lógica más robusta)
        const existingBookings = await prisma.accommodationStay.count({
          where: {
            hotelId: packageHotel.hotelId,
            roomTypeId: packageHotel.roomTypeId,
            OR: [
              {
                checkInDate: { lte: checkInDate },
                checkOutDate: { gt: checkInDate }
              },
              {
                checkInDate: { lt: checkOutDate },
                checkOutDate: { gte: checkOutDate }
              },
              {
                checkInDate: { gte: checkInDate },
                checkOutDate: { lte: checkOutDate }
              }
            ]
          }
        })

        // Verificar capacidad del hotel (simplificado)
        const hotelCapacity = await prisma.room.count({
          where: {
            hotelId: packageHotel.hotelId,
            roomTypeId: packageHotel.roomTypeId
          }
        })

        if (existingBookings >= hotelCapacity) {
          return NextResponse.json(
            { error: `No hay disponibilidad en ${packageHotel.hotel.name} para las fechas seleccionadas` },
            { status: 400 }
          )
        }
      }

      // Calcular precio total del paquete
      const totalAmount = parseFloat(packageData.basePrice.toString()) * participants

      // Crear reservación principal
      const reservation = await prisma.reservation.create({
        data: {
          guestId: guest.id,
          checkin: startDateObj,
          checkout: endDateObj,
          totalAmount: totalAmount,
          currency: packageData.currency,
          status: 'CONFIRMED',
          paymentStatus: 'PENDING',
          confirmationNumber,
          specialRequests: specialRequests || null,
          notes: `Reserva de paquete - ${packageData.name}`,
          source: 'PUBLIC_WEBSITE'
        }
      })
      console.log('✅ Package reservation created:', reservation.id.toString())

      // Crear item principal del paquete
      const packageReservationItem = await prisma.reservationItem.create({
        data: {
          reservationId: reservation.id,
          itemType: 'PACKAGE',
          title: packageData.name,
          quantity: 1,
          unitPrice: parseFloat(packageData.basePrice.toString()),
          amount: totalAmount,
          meta: {
            packageId: packageId,
            participants: participants,
            participantNames: participantNames || `${guestInfo.firstName} ${guestInfo.lastName}`,
            startDate: startDate,
            endDate: endDate,
            durationDays: packageData.durationDays
          } as any
        }
      })
      console.log('✅ Package reservation item created:', packageReservationItem.id.toString())

      // Crear detalle de paquete
      await prisma.packageBooking.create({
        data: {
          reservationItemId: packageReservationItem.id,
          packageId: BigInt(packageId),
          startTs: startDateObj,
          endTs: endDateObj,
          pax: participants,
          participantNames: participantNames || `${guestInfo.firstName} ${guestInfo.lastName}`,
        }
      })
      console.log('✅ Package booking detail created.')

      // Crear items de reservación para cada componente del paquete
      let totalComponentAmount = 0

      // Items de alojamiento
      for (const packageHotel of packageData.packageHotels) {
        const checkInDate = new Date(startDateObj)
        checkInDate.setDate(checkInDate.getDate() + packageHotel.checkInDay - 1)
        
        const checkOutDate = new Date(checkInDate)
        checkOutDate.setDate(checkOutDate.getDate() + packageHotel.nights)

        const roomRate = parseFloat(packageHotel.roomType.baseRate.toString())
        const accommodationAmount = roomRate * packageHotel.nights * participants

        const accommodationItem = await prisma.reservationItem.create({
          data: {
            reservationId: reservation.id,
            itemType: 'ACCOMMODATION',
            title: `${packageHotel.hotel.name} - ${packageHotel.roomType.name}`,
            quantity: participants,
            unitPrice: roomRate * packageHotel.nights,
            amount: accommodationAmount,
            meta: {
              hotelId: packageHotel.hotelId.toString(),
              roomTypeId: packageHotel.roomTypeId.toString(),
              hotelName: packageHotel.hotel.name,
              roomTypeName: packageHotel.roomType.name,
              checkIn: checkInDate.toISOString().split('T')[0],
              checkOut: checkOutDate.toISOString().split('T')[0],
              nights: packageHotel.nights,
              adults: participants,
              children: 0
            } as any
          }
        })

        // Crear accommodation stay
        await prisma.accommodationStay.create({
          data: {
            reservationItemId: accommodationItem.id,
            hotelId: packageHotel.hotelId,
            roomTypeId: packageHotel.roomTypeId,
            checkInDate: checkInDate,
            checkOutDate: checkOutDate,
            nights: packageHotel.nights,
            guestName: participantNames || `${guestInfo.firstName} ${guestInfo.lastName}`,
          }
        })

        totalComponentAmount += accommodationAmount
        console.log('✅ Accommodation item created for package')
      }

      // Items de actividades
      for (const packageActivity of packageData.packageActivities) {
        const activityAmount = parseFloat(packageActivity.activity.basePrice.toString()) * participants

        const activityItem = await prisma.reservationItem.create({
          data: {
            reservationId: reservation.id,
            itemType: 'ACTIVITY',
            title: `${packageActivity.activity.name} (Día ${packageActivity.dayNumber})`,
            quantity: participants,
            unitPrice: parseFloat(packageActivity.activity.basePrice.toString()),
            amount: activityAmount,
            meta: {
              activityId: packageActivity.activityId.toString(),
              activityName: packageActivity.activity.name,
              dayNumber: packageActivity.dayNumber,
              participants: participants,
              participantNames: participantNames || `${guestInfo.firstName} ${guestInfo.lastName}`,
              includedInPackage: true
            } as any
          }
        })

        totalComponentAmount += activityAmount
        console.log('✅ Activity item created for package')
      }

      // Actualizar el monto total con los componentes desglosados
      await prisma.reservation.update({
        where: { id: reservation.id },
        data: {
          totalAmount: totalComponentAmount
        }
      })

      // Actualizar el item principal del paquete
      await prisma.reservationItem.update({
        where: { id: packageReservationItem.id },
        data: {
          amount: totalComponentAmount
        }
      })

      // Disparar notificaciones por correo
      try {
        await onReservationCreated(reservation.id)
        console.log('✅ Email notifications triggered for reservation:', reservation.id.toString())
      } catch (emailError) {
        console.error('❌ Error sending email notifications:', emailError)
        // No fallar la reservación si fallan los emails
      }

      return NextResponse.json({
        success: true,
        reservationId: reservation.id.toString(),
        confirmationNumber,
        message: 'Reservación de paquete creada exitosamente',
        components: {
          accommodations: packageData.packageHotels.length,
          activities: packageData.packageActivities.length,
          totalAmount: totalComponentAmount
        }
      })

    } else if (itemType === 'SHUTTLE') {
      if (!shuttleRouteId || !date || !departureTime || !passengers) {
        return NextResponse.json(
          { error: 'Datos de shuttle requeridos: ruta, fecha, hora y pasajeros' },
          { status: 400 }
        )
      }

      // Obtener información de la ruta de shuttle
      const shuttleRoute = await prisma.shuttleRoute.findUnique({
        where: { id: BigInt(shuttleRouteId) },
        include: {
          fromAirport: true,
          toHotel: true
        }
      })

      if (!shuttleRoute) {
        return NextResponse.json(
          { error: 'Ruta de shuttle no encontrada' },
          { status: 404 }
        )
      }

      // Validar capacidad máxima
      if (passengers > shuttleRoute.maxPassengers) {
        return NextResponse.json(
          { error: `Máximo ${shuttleRoute.maxPassengers} pasajeros permitidos` },
          { status: 400 }
        )
      }

      // Calcular precio total (usando precio base por ahora)
      const pricePerPerson = parseFloat(shuttleRoute.basePrice.toString())
      const totalAmount = pricePerPerson * passengers

      // Crear reservación
      const reservation = await prisma.reservation.create({
        data: {
          guestId: guest.id,
          checkin: new Date(date),
          checkout: new Date(date), // Para shuttle, check-in y check-out son el mismo día
          totalAmount: totalAmount,
          currency: shuttleRoute.currency,
          status: 'CONFIRMED',
          paymentStatus: 'PENDING',
          confirmationNumber,
          specialRequests: specialRequests || null,
          notes: `Reserva de shuttle - ${shuttleRoute.name}`,
          source: 'PUBLIC_WEBSITE'
        }
      })

      // Crear item de reservación
      const reservationItem = await prisma.reservationItem.create({
        data: {
          reservationId: reservation.id,
          itemType: 'SHUTTLE',
          title: `${shuttleRoute.name} - ${date} ${departureTime}`,
          quantity: passengers,
          unitPrice: pricePerPerson,
          amount: totalAmount,
          meta: {
            shuttleRouteId: shuttleRouteId,
            date: date,
            departureTime: departureTime,
            passengers: passengers,
            passengerNames: participantNames || `${firstName} ${lastName}`,
            fromAirportId: shuttleRoute.fromAirportId.toString(),
            toHotelId: shuttleRoute.toHotelId.toString(),
            direction: shuttleRoute.direction
          } as any
        }
      })

      // Nota: La actualización de disponibilidad se implementará cuando se agreguen los modelos de ShuttleAvailability

      // Disparar notificaciones por correo
      try {
        await onReservationCreated(reservation.id)
        console.log('✅ Email notifications triggered for reservation:', reservation.id.toString())
      } catch (emailError) {
        console.error('❌ Error sending email notifications:', emailError)
        // No fallar la reservación si fallan los emails
      }

      return NextResponse.json({
        success: true,
        reservationId: reservation.id.toString(),
        confirmationNumber,
        message: 'Reservación de shuttle creada exitosamente'
      })

    } else {
      return NextResponse.json(
        { error: 'Tipo de reservación no válido' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Error creating public reservation:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
