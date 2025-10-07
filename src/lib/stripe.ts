import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined in environment variables')
}

// Configuración de Stripe
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
  typescript: true,
})

// Configuración para Guatemala
export const STRIPE_CONFIG = {
  // Monedas soportadas
  supportedCurrencies: ['usd', 'gtq'],
  
  // Métodos de pago para Guatemala
  paymentMethods: [
    'card', // Tarjetas internacionales y locales
    'bancontact', // Transferencias bancarias
    'sepa_debit', // Débito SEPA (para europeos)
  ],
  
  // Bancos locales de Guatemala (a través de tarjetas)
  localBanks: [
    'Banco de Guatemala',
    'Banco G&T Continental', 
    'Banco Industrial',
    'Banrural',
    'Banco Agromercantil (BAM)',
    'Banco de Antigua',
    'Banco Inmobiliario',
    'Vivibanco',
    'Banco de los Trabajadores',
    'Banco CHN'
  ],
  
  // Configuración para tarjetas internacionales
  international: {
    // Principales redes
    networks: ['visa', 'mastercard', 'amex', 'discover'],
    
    // Países prioritarios (turistas frecuentes a Guatemala)
    priorityCountries: [
      'US', // Estados Unidos
      'CA', // Canadá  
      'MX', // México
      'ES', // España
      'DE', // Alemania
      'FR', // Francia
      'IT', // Italia
      'GB', // Reino Unido
      'NL', // Países Bajos
      'SV', // El Salvador
      'HN', // Honduras
      'CR', // Costa Rica
      'PA', // Panamá
    ],
    
    // Configuración 3D Secure
    threeDSecure: {
      enabled: true,
      version: '2.2'
    }
  }
}

// Función para crear Payment Intent
export async function createPaymentIntent({
  amount,
  currency = 'usd',
  reservationId,
  guestEmail,
  description,
  metadata = {}
}: {
  amount: number
  currency?: 'usd' | 'gtq'
  reservationId: string
  guestEmail?: string
  description: string
  metadata?: Record<string, string>
}) {
  try {
    console.log('💳 Creating Stripe Payment Intent:', {
      amount,
      currency,
      reservationId,
      description
    })

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe usa centavos
      currency: currency.toLowerCase(),
      description,
      receipt_email: guestEmail,
      metadata: {
        reservationId,
        source: 'antigua_hotels_website',
        ...metadata
      },
      // Configuración para Guatemala
      payment_method_options: {
        card: {
          request_three_d_secure: 'automatic', // 3D Secure automático
          setup_future_usage: 'off_session' // Para pagos futuros
        }
      },
      // Configuración automática de métodos de pago
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never' // Solo tarjetas directas
      }
    })

    console.log('✅ Payment Intent created:', paymentIntent.id)

    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency
    }

  } catch (error) {
    console.error('❌ Error creating Payment Intent:', error)
    throw new Error(`Error creating payment: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Función para confirmar pago
export async function confirmPaymentIntent(paymentIntentId: string) {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
    
    console.log('💳 Payment Intent status:', {
      id: paymentIntentId,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency
    })

    return {
      success: paymentIntent.status === 'succeeded',
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100, // Convertir de centavos
      currency: paymentIntent.currency,
      paymentMethod: paymentIntent.payment_method,
      charges: paymentIntent.charges.data
    }

  } catch (error) {
    console.error('❌ Error confirming payment:', error)
    throw new Error(`Error confirming payment: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Función para procesar reembolsos
export async function createRefund({
  paymentIntentId,
  amount,
  reason = 'requested_by_customer'
}: {
  paymentIntentId: string
  amount?: number
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer'
}) {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined, // undefined = reembolso completo
      reason
    })

    console.log('💰 Refund created:', refund.id)

    return {
      success: true,
      refundId: refund.id,
      amount: refund.amount / 100,
      status: refund.status
    }

  } catch (error) {
    console.error('❌ Error creating refund:', error)
    throw new Error(`Error creating refund: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Función para obtener tipos de cambio (para conversión GTQ/USD)
export async function getExchangeRates() {
  try {
    // En producción, usar un servicio de tipos de cambio real
    // Por ahora, valores aproximados
    return {
      USD_TO_GTQ: 7.85,
      GTQ_TO_USD: 0.127,
      lastUpdated: new Date().toISOString()
    }
  } catch (error) {
    console.error('Error fetching exchange rates:', error)
    // Valores de fallback
    return {
      USD_TO_GTQ: 7.80,
      GTQ_TO_USD: 0.128,
      lastUpdated: new Date().toISOString()
    }
  }
}



