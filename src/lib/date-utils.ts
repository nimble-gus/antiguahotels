/**
 * Utilidades para manejo consistente de fechas
 * Evita problemas de zona horaria en el sistema de reservaciones
 */

export function createLocalDate(dateString: string): Date {
  // Crear fecha local sin problemas de zona horaria
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day) // month - 1 porque Date usa 0-11 para meses
}

export function formatDateForDB(date: Date): string {
  // Formato YYYY-MM-DD para base de datos
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function formatDateForDisplay(dateString: string): string {
  // Formato para mostrar al usuario
  const date = createLocalDate(dateString)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export function calculateNights(checkInString: string, checkOutString: string): number {
  const checkIn = createLocalDate(checkInString)
  const checkOut = createLocalDate(checkOutString)
  
  const diffTime = checkOut.getTime() - checkIn.getTime()
  const nights = Math.round(diffTime / (1000 * 60 * 60 * 24))
  
  console.log('📅 Date calculation:', {
    checkInString,
    checkOutString,
    checkIn: checkIn.toISOString(),
    checkOut: checkOut.toISOString(),
    diffTime,
    nights
  })
  
  return nights
}

export function isValidDateRange(checkInString: string, checkOutString: string): boolean {
  const checkIn = createLocalDate(checkInString)
  const checkOut = createLocalDate(checkOutString)
  const today = new Date()
  today.setHours(0, 0, 0, 0) // Resetear horas para comparación de solo fecha
  
  return checkIn >= today && checkOut > checkIn
}

export function getTodayString(): string {
  const today = new Date()
  return formatDateForDB(today)
}



