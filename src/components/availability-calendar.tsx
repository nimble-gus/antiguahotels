'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  AlertCircle
} from 'lucide-react'
import { formatDateForDB } from '@/lib/date-utils'

interface AvailabilityCalendarProps {
  roomTypeId?: string
  packageId?: string
  participants?: number
  mode?: 'accommodation' | 'package'
  onDateRangeSelect: (checkIn: string, checkOut?: string) => void
  selectedCheckIn?: string
  selectedCheckOut?: string
  minNights?: number
  maxNights?: number
}

interface DateAvailability {
  [date: string]: number // fecha -> número de habitaciones disponibles
}

export function AvailabilityCalendar({
  roomTypeId,
  packageId,
  participants = 1,
  mode = 'accommodation',
  onDateRangeSelect,
  selectedCheckIn,
  selectedCheckOut,
  minNights = 1,
  maxNights = 30
}: AvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [availability, setAvailability] = useState<DateAvailability>({})
  const [loading, setLoading] = useState(false)
  const [selectingCheckOut, setSelectingCheckOut] = useState(false)
  const [tempCheckIn, setTempCheckIn] = useState<string | null>(null)

  useEffect(() => {
    if ((mode === 'accommodation' && roomTypeId) || (mode === 'package' && packageId)) {
      fetchAvailability()
    }
  }, [roomTypeId, packageId, mode, currentMonth, participants])

  const fetchAvailability = async () => {
    setLoading(true)
    try {
      // Obtener disponibilidad para el mes actual y siguiente
      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
      const endOfNextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 2, 0)

      console.log(`📅 Fetching ${mode} availability for:`, {
        startDate: formatDateForDB(startOfMonth),
        endDate: formatDateForDB(endOfNextMonth),
        roomTypeId,
        packageId,
        participants
      })

      if (mode === 'package' && packageId) {
        // Para paquetes, usar nueva API optimizada que verifica el rango completo
        try {
          const response = await fetch(`/api/packages/${packageId}/availability/range`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              startDate: formatDateForDB(startOfMonth),
              endDate: formatDateForDB(endOfNextMonth),
              participants
            })
          })
          
          if (response.ok) {
            const data = await response.json()
            console.log('📦 Package availability data (optimized):', data.availability)
            setAvailability(data.availability || {})
          } else {
            console.error('❌ Error fetching package availability range:', response.status)
            setAvailability({})
          }
        } catch (error) {
          console.error('💥 Error fetching package availability range:', error)
          setAvailability({})
        }
        
      } else if (mode === 'accommodation' && roomTypeId) {
        // Modo accommodation (lógica original)
        const params = new URLSearchParams({
          roomTypeId,
          startDate: formatDateForDB(startOfMonth),
          endDate: formatDateForDB(endOfNextMonth),
        })

        const response = await fetch(`/api/availability?${params}`)
        if (response.ok) {
          const data = await response.json()
          console.log('🏨 Received accommodation availability data:', data.dateAvailability)
          setAvailability(data.dateAvailability || {})
        } else {
          console.error('❌ Error fetching accommodation availability:', response.status)
        }
      }
    } catch (error) {
      console.error('Error fetching availability:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Días del mes anterior (para completar la primera semana)
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i)
      const prevYear = prevDate.getFullYear()
      const prevMonth = prevDate.getMonth()
      const prevDay = prevDate.getDate()
      const dateString = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(prevDay).padStart(2, '0')}`
      days.push({
        date: prevDate,
        isCurrentMonth: false,
        dateString
      })
    }

    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      // Usar formato local para evitar problemas de zona horaria
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      days.push({
        date,
        isCurrentMonth: true,
        dateString
      })
    }

    // Días del mes siguiente (para completar la última semana)
    const remainingDays = 42 - days.length // 6 semanas × 7 días
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month + 1, day)
      const nextYear = nextDate.getFullYear()
      const nextMonth = nextDate.getMonth()
      const nextDay = nextDate.getDate()
      const dateString = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(nextDay).padStart(2, '0')}`
      days.push({
        date: nextDate,
        isCurrentMonth: false,
        dateString
      })
    }

    return days
  }

  const isDateAvailable = (dateString: string) => {
    const today = new Date()
    const todayString = formatDateForDB(today)
    
    if (dateString < todayString) return false
    
    const availableRooms = availability[dateString] || 0
    return availableRooms > 0
  }

  const isDateInRange = (dateString: string) => {
    if (!tempCheckIn || !selectingCheckOut) return false
    return dateString > tempCheckIn
  }

  const isDateSelected = (dateString: string) => {
    if (selectingCheckOut && tempCheckIn) {
      return dateString === tempCheckIn
    }
    return dateString === selectedCheckIn || dateString === selectedCheckOut
  }

  const handleDateClick = (dateString: string, isCurrentMonth: boolean) => {
    console.log(`🗓️ Date clicked (${mode} mode):`, dateString, 'isCurrentMonth:', isCurrentMonth)
    
    if (!isCurrentMonth || !isDateAvailable(dateString)) {
      console.log('❌ Date not selectable')
      return
    }

    if (mode === 'package') {
      // Modo paquete: solo selecciona fecha de inicio
      console.log('📦 Package mode - selecting start date:', dateString)
      onDateRangeSelect(dateString) // Solo pasa la fecha de inicio
      return
    }

    // Modo accommodation (lógica original)
    // Si hay fechas ya seleccionadas y se hace clic en una de ellas, deseleccionar
    if ((dateString === selectedCheckIn || dateString === selectedCheckOut) && !selectingCheckOut) {
      console.log('🔄 Deselecting current range')
      clearSelection()
      return
    }

    if (!selectingCheckOut) {
      // Seleccionando check-in
      console.log('✅ Setting check-in:', dateString)
      setTempCheckIn(dateString)
      setSelectingCheckOut(true)
    } else {
      // Seleccionando check-out
      if (tempCheckIn && dateString >= tempCheckIn) {
        const checkInDate = new Date(tempCheckIn + 'T00:00:00')
        const checkOutDate = new Date(dateString + 'T00:00:00')
        
        // Permitir seleccionar el mismo día (1 noche) o días posteriores
        let nights: number
        if (dateString === tempCheckIn) {
          // Mismo día = 1 noche (checkout al día siguiente)
          nights = 1
          const nextDay = new Date(checkInDate)
          nextDay.setDate(nextDay.getDate() + 1)
          const checkOutString = nextDay.toISOString().split('T')[0]
          
          console.log('📅 Single day selected (1 night):', {
            checkIn: tempCheckIn,
            checkOut: checkOutString,
            nights: 1
          })
          
          console.log('✅ Calling onDateRangeSelect with:', tempCheckIn, checkOutString)
          onDateRangeSelect(tempCheckIn, checkOutString)
          setSelectingCheckOut(false)
          setTempCheckIn(null)
        } else {
          // Múltiples días
          nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))
          
          console.log('📅 Date range selected:', {
            checkIn: tempCheckIn,
            checkOut: dateString,
            nights
          })

          if (nights >= minNights && nights <= maxNights) {
            console.log('✅ Calling onDateRangeSelect with:', tempCheckIn, dateString)
            onDateRangeSelect(tempCheckIn, dateString)
            setSelectingCheckOut(false)
            setTempCheckIn(null)
          } else {
            alert(`La estadía debe ser entre ${minNights} y ${maxNights} noches`)
          }
        }
      } else if (tempCheckIn && dateString < tempCheckIn) {
        // Si se selecciona una fecha anterior al check-in, reiniciar
        console.log('🔄 Resetting selection - new check-in:', dateString)
        setTempCheckIn(dateString)
      }
    }
  }

  const resetSelection = () => {
    setSelectingCheckOut(false)
    setTempCheckIn(null)
  }

  const clearSelection = () => {
    console.log('🧹 Clearing all selections')
    setSelectingCheckOut(false)
    setTempCheckIn(null)
    onDateRangeSelect('', '') // Limpiar las fechas seleccionadas
  }

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

  const days = getDaysInMonth(currentMonth)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Calendario de Disponibilidad
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            {selectingCheckOut && (
              <Button variant="outline" size="sm" onClick={resetSelection}>
                <X className="h-4 w-4 mr-2" />
                Cancelar Selección
              </Button>
            )}
            
            {(selectedCheckIn || selectedCheckOut) && !selectingCheckOut && (
              <Button variant="outline" size="sm" onClick={clearSelection}>
                <X className="h-4 w-4 mr-2" />
                Limpiar Fechas
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Navegación del mes */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <h3 className="text-lg font-semibold">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Leyenda */}
        <div className="flex items-center justify-center space-x-6 mb-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
            <span>Disponible</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
            <span>No disponible</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 border border-blue-600 rounded"></div>
            <span>Seleccionado</span>
          </div>
        </div>

        {/* Estado de selección */}
        {selectingCheckOut && tempCheckIn && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Check-in seleccionado:</strong> {new Date(tempCheckIn).toLocaleDateString()}
            </p>
            <p className="text-xs text-blue-600">
              Ahora selecciona la fecha de check-out (debe ser al menos {minNights} noche{minNights > 1 ? 's' : ''} después)
            </p>
          </div>
        )}

        {/* Grid del calendario */}
        <div className="grid grid-cols-7 gap-1">
          {/* Headers de días */}
          {dayNames.map((day) => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}

          {/* Días del calendario */}
          {days.map(({ date, isCurrentMonth, dateString }) => {
            const isAvailable = isDateAvailable(dateString)
            const isSelected = isDateSelected(dateString)
            const isInRange = isDateInRange(dateString)
            const isPast = dateString < new Date().toISOString().split('T')[0]
            const availableRooms = availability[dateString] || 0
            const isClickableSelected = isSelected && !selectingCheckOut // Fecha seleccionada clickeable para deseleccionar

            return (
              <div
                key={dateString}
                onClick={() => handleDateClick(dateString, isCurrentMonth)}
                className={`
                  relative p-2 text-center text-sm cursor-pointer transition-all duration-200 rounded
                  ${!isCurrentMonth 
                    ? 'text-gray-300' 
                    : isPast 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : isSelected
                        ? `bg-blue-500 text-white font-semibold border-2 border-blue-600 ${isClickableSelected ? 'hover:bg-blue-600 hover:shadow-lg' : ''}`
                        : isInRange && isAvailable
                          ? 'bg-blue-100 text-blue-700 border border-blue-300'
                          : isAvailable
                            ? 'bg-green-100 hover:bg-green-200 text-green-800 border border-green-300'
                            : 'bg-red-100 text-red-800 border border-red-300 cursor-not-allowed'
                  }
                `}
                title={
                  isPast ? 'Fecha pasada' :
                  !isAvailable ? 'No disponible' :
                  isClickableSelected ? 'Haz clic para deseleccionar' :
                  `${availableRooms} habitaciones disponibles`
                }
              >
                <div className="font-medium">{date.getDate()}</div>
                
                {/* Indicador de disponibilidad */}
                {isCurrentMonth && !isPast && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
                    {isAvailable ? (
                      <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                    ) : (
                      <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                    )}
                  </div>
                )}

                {/* Número de habitaciones disponibles */}
                {isCurrentMonth && !isPast && isAvailable && availableRooms > 0 && (
                  <div className="absolute top-0 right-0 w-4 h-4 bg-green-500 text-white text-xs rounded-full flex items-center justify-center">
                    {availableRooms > 9 ? '9+' : availableRooms}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Información adicional */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center">
              <Check className="h-4 w-4 text-green-500 mr-1" />
              <span>{Object.values(availability).filter(count => count > 0).length} días disponibles</span>
            </div>
            <div className="flex items-center">
              <X className="h-4 w-4 text-red-500 mr-1" />
              <span>{Object.values(availability).filter(count => count === 0).length} días ocupados</span>
            </div>
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 text-blue-500 mr-1" />
              <span>Estadía: {minNights}-{maxNights} noches</span>
            </div>
          </div>
        </div>

        {/* Instrucciones */}
        <div className="mt-4 text-center">
          {mode === 'package' ? (
            <div className="text-sm text-gray-600">
              <p className="mb-1">
                📦 Selecciona la <strong>fecha de inicio</strong> del paquete
              </p>
              <p className="text-xs text-purple-600">
                💡 El paquete incluye hoteles y actividades programadas automáticamente
              </p>
              {selectedCheckIn && (
                <p className="text-sm text-purple-700 mt-2 font-medium">
                  ✅ Fecha seleccionada: <strong>{selectedCheckIn}</strong>
                </p>
              )}
            </div>
          ) : !selectingCheckOut && !selectedCheckIn && !selectedCheckOut ? (
            <p className="text-sm text-gray-600">
              Selecciona la fecha de <strong>check-in</strong>
            </p>
          ) : !selectingCheckOut && (selectedCheckIn || selectedCheckOut) ? (
            <div className="text-sm text-gray-600">
              <p className="mb-1">
                ✅ Fechas seleccionadas: <strong>{selectedCheckIn}</strong> a <strong>{selectedCheckOut}</strong>
              </p>
              <p className="text-xs">
                Haz clic en una fecha seleccionada o usa "Limpiar Fechas" para deseleccionar
              </p>
            </div>
          ) : (
            <div className="text-sm text-gray-600">
              <p className="mb-1">
                Selecciona la fecha de <strong>check-out</strong>
              </p>
              <p className="text-xs text-blue-600">
                💡 Puedes hacer clic en la misma fecha para una estadía de <strong>1 noche</strong>
              </p>
            </div>
          )}
        </div>

        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
