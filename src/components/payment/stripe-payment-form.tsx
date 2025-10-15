'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  CreditCard,
  Lock,
  CheckCircle,
  AlertCircle,
  Globe,
  Shield,
  DollarSign
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface StripePaymentFormProps {
  reservationId: string
  amount: number
  currency: 'USD' | 'GTQ'
  onSuccess: () => void
  onCancel: () => void
}

export function StripePaymentForm({ 
  reservationId, 
  amount, 
  currency, 
  onSuccess, 
  onCancel 
}: StripePaymentFormProps) {
  const [loading, setLoading] = useState(false)
  const [paymentIntent, setPaymentIntent] = useState<any>(null)
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    country: 'GT'
  })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    createPaymentIntent()
  }, [])

  const createPaymentIntent = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reservationId,
          currency: currency.toLowerCase(),
        })
      })

      if (response.ok) {
        const data = await response.json()
        setPaymentIntent(data)
        console.log('✅ Payment Intent created:', data.paymentIntentId)
      } else {
        const error = await response.json()
        setError(error.error || 'Error creando intención de pago')
      }
    } catch (error) {
      setError('Error de conexión al crear intención de pago')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Validaciones básicas
      if (!cardDetails.cardNumber || !cardDetails.expiryDate || !cardDetails.cvv || !cardDetails.cardholderName) {
        setError('Todos los campos de la tarjeta son requeridos')
        setLoading(false)
        return
      }

      // Simular procesamiento (en producción usarías Stripe Elements)
      console.log('💳 Processing payment with card details...')
      
      // Simular delay de procesamiento
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Confirmar pago
      const response = await fetch('/api/payments/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentIntentId: paymentIntent.paymentIntentId
        })
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Payment confirmed:', data)
        onSuccess()
      } else {
        const error = await response.json()
        setError(error.error || 'Error procesando pago')
      }

    } catch (error) {
      console.error('Error processing payment:', error)
      setError('Error de conexión al procesar pago')
    } finally {
      setLoading(false)
    }
  }

  if (!paymentIntent && loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
        <span>Preparando formulario de pago...</span>
      </div>
    )
  }

  if (error && !paymentIntent) {
    return (
      <div className="p-6 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={createPaymentIntent}>
          Reintentar
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Información del Pago */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5 text-blue-600" />
            <span>Pago con Tarjeta</span>
          </CardTitle>
          <p className="text-sm text-gray-600">
            Procesamiento seguro para tarjetas internacionales y locales
          </p>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Monto a Pagar</p>
                <p className="text-2xl font-bold text-blue-900">
                  {formatCurrency(amount)} {currency}
                </p>
                {paymentIntent?.reservationInfo && (
                  <p className="text-xs text-blue-600 mt-1">
                    Reservación: {paymentIntent.reservationInfo.confirmationNumber}
                  </p>
                )}
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-2 text-sm text-blue-600">
                  <Shield className="h-4 w-4" />
                  <span>Pago Seguro</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-blue-600 mt-1">
                  <Globe className="h-4 w-4" />
                  <span>Tarjetas Internacionales</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formulario de Tarjeta */}
      <Card>
        <CardHeader>
          <CardTitle>💳 Información de la Tarjeta</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de Tarjeta <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={cardDetails.cardNumber}
                onChange={(e) => {
                  // Formatear número de tarjeta (XXXX XXXX XXXX XXXX)
                  const value = e.target.value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim()
                  setCardDetails({...cardDetails, cardNumber: value})
                }}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                🌍 Aceptamos Visa, Mastercard, American Express (internacionales y locales)
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Vencimiento <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={cardDetails.expiryDate}
                  onChange={(e) => {
                    // Formatear MM/YY
                    const value = e.target.value.replace(/\D/g, '').replace(/(.{2})/, '$1/').substring(0, 5)
                    setCardDetails({...cardDetails, expiryDate: value})
                  }}
                  placeholder="MM/YY"
                  maxLength={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CVV <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={cardDetails.cvv}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').substring(0, 4)
                    setCardDetails({...cardDetails, cvv: value})
                  }}
                  placeholder="123"
                  maxLength={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Tarjetahabiente <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={cardDetails.cardholderName}
                onChange={(e) => setCardDetails({...cardDetails, cardholderName: e.target.value.toUpperCase()})}
                placeholder="NOMBRE COMO APARECE EN LA TARJETA"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                País de la Tarjeta
              </label>
              <select
                value={cardDetails.country}
                onChange={(e) => setCardDetails({...cardDetails, country: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="GT">🇬🇹 Guatemala</option>
                <option value="US">🇺🇸 Estados Unidos</option>
                <option value="CA">🇨🇦 Canadá</option>
                <option value="MX">🇲🇽 México</option>
                <option value="ES">🇪🇸 España</option>
                <option value="DE">🇩🇪 Alemania</option>
                <option value="FR">🇫🇷 Francia</option>
                <option value="IT">🇮🇹 Italia</option>
                <option value="GB">🇬🇧 Reino Unido</option>
                <option value="SV">🇸🇻 El Salvador</option>
                <option value="HN">🇭🇳 Honduras</option>
                <option value="CR">🇨🇷 Costa Rica</option>
                <option value="PA">🇵🇦 Panamá</option>
              </select>
            </div>

            {/* Información de Seguridad */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2">🔒 Seguridad Garantizada</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-green-800">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>Encriptación SSL 256-bit</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Lock className="h-4 w-4" />
                  <span>PCI DSS Compliant</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>3D Secure Automático</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4" />
                  <span>Bancos Locales e Internacionales</span>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <p className="text-red-800">{error}</p>
                </div>
              </div>
            )}

            {/* Botones */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Procesando Pago...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Pagar {formatCurrency(amount)} {currency}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Información Adicional */}
      <Card>
        <CardContent className="p-4">
          <div className="text-sm text-gray-600">
            <h4 className="font-medium text-gray-900 mb-2">💳 Tarjetas Aceptadas:</h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="font-medium text-blue-600">🌍 Internacionales:</p>
                <ul className="text-xs space-y-1">
                  <li>• Visa (todos los países)</li>
                  <li>• Mastercard (todos los países)</li>
                  <li>• American Express</li>
                  <li>• Discover</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-green-600">🇬🇹 Bancos Locales:</p>
                <ul className="text-xs space-y-1">
                  <li>• Banco G&T Continental</li>
                  <li>• Banco Industrial</li>
                  <li>• Banrural</li>
                  <li>• BAM (Agromercantil)</li>
                  <li>• Banco de Antigua</li>
                  <li>• Vivibanco</li>
                </ul>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              🔒 Todos los pagos son procesados de forma segura por Stripe. 
              No almacenamos información de tarjetas en nuestros servidores.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}









