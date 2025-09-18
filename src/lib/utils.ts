import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

export function formatDate(date: Date | string) {
  if (!date) return ''
  
  // Si es un string ISO, extraer solo la parte de la fecha para evitar problemas de zona horaria
  if (typeof date === 'string') {
    const dateOnly = date.split('T')[0] // Obtener solo YYYY-MM-DD
    const [year, month, day] = dateOnly.split('-').map(Number)
    const localDate = new Date(year, month - 1, day) // Crear fecha local
    
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(localDate)
  }
  
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

export function formatDateTime(date: Date | string) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function generateConfirmationNumber(): string {
  const today = new Date()
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '')
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `AH${dateStr}${randomStr}`
}

export function getStatusColor(status: string): string {
  switch (status.toUpperCase()) {
    case 'CONFIRMED':
      return 'text-green-600 bg-green-50'
    case 'PENDING':
      return 'text-yellow-600 bg-yellow-50'
    case 'CANCELLED':
      return 'text-red-600 bg-red-50'
    case 'NO_SHOW':
      return 'text-gray-600 bg-gray-50'
    case 'COMPLETED':
      return 'text-blue-600 bg-blue-50'
    default:
      return 'text-gray-600 bg-gray-50'
  }
}

export function calculateNights(checkIn: Date, checkOut: Date): number {
  const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}
