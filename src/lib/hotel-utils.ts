import { prisma } from './prisma'

/**
 * Genera un código único para el hotel basado en el nombre y la ciudad
 * Formato: AH + iniciales del nombre + número secuencial
 * Ejemplo: "Hotel Casa Antigua" en "Antigua" = "AHCA001"
 */
export async function generateHotelCode(name: string, city: string): Promise<string> {
  try {
    // Extraer iniciales del nombre del hotel
    const nameWords = name
      .toUpperCase()
      .replace(/[^A-Z\s]/g, '') // Solo letras y espacios
      .split(' ')
      .filter(word => word.length > 0)

    // Tomar las primeras 2-3 letras más significativas
    let initials = ''
    if (nameWords.length === 1) {
      // Si es una sola palabra, tomar las primeras 2-3 letras
      initials = nameWords[0].substring(0, 3)
    } else {
      // Si son múltiples palabras, tomar primera letra de cada una
      initials = nameWords
        .slice(0, 3) // Máximo 3 palabras
        .map(word => word[0])
        .join('')
    }

    // Asegurar que tengamos al menos 2 caracteres
    if (initials.length < 2) {
      initials = name.toUpperCase().replace(/[^A-Z]/g, '').substring(0, 2)
    }

    // Prefijo base
    const baseCode = `AH${initials}`

    // Buscar el último número usado con este prefijo
    const existingHotels = await prisma.hotel.findMany({
      where: {
        code: {
          startsWith: baseCode
        }
      },
      select: {
        code: true
      },
      orderBy: {
        code: 'desc'
      }
    })

    // Determinar el siguiente número
    let nextNumber = 1
    if (existingHotels.length > 0) {
      const lastCode = existingHotels[0].code
      if (lastCode) {
        const numberPart = lastCode.replace(baseCode, '')
        const lastNumber = parseInt(numberPart) || 0
        nextNumber = lastNumber + 1
      }
    }

    // Formatear con ceros a la izquierda (3 dígitos)
    const formattedNumber = nextNumber.toString().padStart(3, '0')
    
    return `${baseCode}${formattedNumber}`

  } catch (error) {
    console.error('Error generating hotel code:', error)
    // Fallback: código basado en timestamp
    const timestamp = Date.now().toString().slice(-6)
    return `AH${timestamp}`
  }
}

/**
 * Ejemplos de códigos generados:
 * "Hotel Casa Antigua" → "AHCA001"
 * "Grand Palace Resort" → "AHGPR001" 
 * "Marriott" → "AHMAR001"
 * "Hotel Real InterContinental" → "AHRI001"
 * "Posada del Angel" → "AHPDA001"
 */








