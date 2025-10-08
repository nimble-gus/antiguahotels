// CyberSource de NeoNet - Configuración para Guatemala
// Este archivo será completado cuando recibas las credenciales de NeoNet

export interface CyberSourceConfig {
  // Credenciales (a completar cuando las recibas)
  merchantId?: string
  apiKey?: string
  secretKey?: string
  environment?: 'sandbox' | 'production'
  
  // URLs de NeoNet (a confirmar)
  baseUrl?: string
  webhookUrl?: string
}

// Configuración para Guatemala
export const CYBERSOURCE_CONFIG = {
  // Monedas soportadas por NeoNet Guatemala
  supportedCurrencies: ['USD', 'GTQ'],
  
  // Bancos locales soportados por CyberSource/NeoNet
  localBanks: [
    {
      code: 'GT_BAM',
      name: 'Banco Agromercantil (BAM)',
      type: 'credit_debit'
    },
    {
      code: 'GT_GTC',
      name: 'Banco G&T Continental',
      type: 'credit_debit'
    },
    {
      code: 'GT_BI',
      name: 'Banco Industrial',
      type: 'credit_debit'
    },
    {
      code: 'GT_BANRURAL',
      name: 'Banrural',
      type: 'credit_debit'
    },
    {
      code: 'GT_BANTRAB',
      name: 'Banco de los Trabajadores',
      type: 'credit_debit'
    },
    {
      code: 'GT_CHN',
      name: 'Banco CHN',
      type: 'credit_debit'
    },
    {
      code: 'GT_VIVIBANCO',
      name: 'Vivibanco',
      type: 'credit_debit'
    },
    {
      code: 'GT_BANTIGUA',
      name: 'Banco de Antigua',
      type: 'credit_debit'
    }
  ],
  
  // Métodos de pago disponibles
  paymentMethods: [
    'credit_card',
    'debit_card',
    'bank_transfer'
  ],
  
  // Configuración de seguridad
  security: {
    threeDSecure: true,
    tokenization: true,
    encryption: 'AES-256'
  }
}

// Función placeholder para crear transacción
export async function createCyberSourceTransaction({
  amount,
  currency = 'USD',
  reservationId,
  customerEmail,
  description,
  metadata = {}
}: {
  amount: number
  currency?: 'USD' | 'GTQ'
  reservationId: string
  customerEmail?: string
  description: string
  metadata?: Record<string, string>
}) {
  console.log('🏦 CyberSource transaction (placeholder):', {
    amount,
    currency,
    reservationId,
    description
  })

  // TODO: Implementar cuando recibas credenciales de NeoNet
  // Esta función se conectará con la API de CyberSource
  
  return {
    success: false,
    message: 'CyberSource integration pending - awaiting NeoNet credentials',
    transactionId: null,
    status: 'pending_integration'
  }
}

// Función placeholder para confirmar pago
export async function confirmCyberSourcePayment(transactionId: string) {
  console.log('🏦 Confirming CyberSource payment (placeholder):', transactionId)

  // TODO: Implementar confirmación con CyberSource
  
  return {
    success: false,
    status: 'pending_integration',
    amount: 0,
    currency: 'USD'
  }
}

// Función para validar datos de tarjeta (independiente del gateway)
export function validateCardData(cardData: {
  cardNumber: string
  expiryDate: string
  cvv: string
  cardholderName: string
}) {
  const errors: string[] = []

  // Validar número de tarjeta (algoritmo de Luhn básico)
  const cardNumber = cardData.cardNumber.replace(/\s/g, '')
  if (!/^\d{13,19}$/.test(cardNumber)) {
    errors.push('Número de tarjeta inválido')
  }

  // Validar fecha de vencimiento
  const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/
  if (!expiryRegex.test(cardData.expiryDate)) {
    errors.push('Fecha de vencimiento inválida (MM/YY)')
  } else {
    const [month, year] = cardData.expiryDate.split('/')
    const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1)
    if (expiry < new Date()) {
      errors.push('Tarjeta vencida')
    }
  }

  // Validar CVV
  if (!/^\d{3,4}$/.test(cardData.cvv)) {
    errors.push('CVV inválido')
  }

  // Validar nombre
  if (!cardData.cardholderName.trim()) {
    errors.push('Nombre del tarjetahabiente requerido')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Función para detectar tipo de tarjeta
export function detectCardType(cardNumber: string): string {
  const number = cardNumber.replace(/\s/g, '')
  
  if (/^4/.test(number)) return 'Visa'
  if (/^5[1-5]/.test(number)) return 'Mastercard'
  if (/^3[47]/.test(number)) return 'American Express'
  if (/^6/.test(number)) return 'Discover'
  
  return 'Unknown'
}

// Función para formatear número de tarjeta
export function formatCardNumber(value: string): string {
  return value
    .replace(/\s/g, '')
    .replace(/(.{4})/g, '$1 ')
    .trim()
    .substring(0, 19)
}

// Función para formatear fecha de vencimiento
export function formatExpiryDate(value: string): string {
  return value
    .replace(/\D/g, '')
    .replace(/(.{2})/, '$1/')
    .substring(0, 5)
}





