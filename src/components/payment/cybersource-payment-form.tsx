'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  CreditCard,
  Lock,
  CheckCircle,
  AlertCircle,
  Globe,
  Shield,
  Building,
  Smartphone
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { 
  validateCardData, 
  detectCardType, 
  formatCardNumber, 
  formatExpiryDate,
  CYBERSOURCE_CONFIG 
} from '@/lib/cybersource'

interface CyberSourcePaymentFormProps {
  reservationId: string
  amount: number
  currency: 'USD' | 'GTQ'
  onSuccess: () => void
  onCancel: () => void
}

export function CyberSourcePaymentForm({ 
  reservationId, 
  amount, 
  currency, 
  onSuccess, 
  onCancel 
}: CyberSourcePaymentFormProps) {
  const [loading, setLoading] = useState(false)
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    bankCode: ''
  })
  const [errors, setErrors] = useState<string[]>([])
  const [cardType, setCardType] = useState('')

  const handleCardNumberChange = (value: string) => {
    const formatted = formatCardNumber(value)
    setCardDetails({...cardDetails, cardNumber: formatted})
    setCardType(detectCardType(formatted))
  }

  const handleExpiryChange = (value: string) => {
    const formatted = formatExpiryDate(value)
    setCardDetails({...cardDetails, expiryDate: formatted})
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors([])

    // Validar datos de tarjeta
    const validation = validateCardData(cardDetails)
    if (!validation.isValid) {
      setErrors(validation.errors)
      setLoading(false)
      return
    }

    try {
      console.log('🏦 Processing payment with CyberSource/NeoNet...')
      
      // TODO: Aquí se integrará con la API real de CyberSource cuando la recibas
      // Por ahora, simular el procesamiento
      
      alert('🚧 Integración con CyberSource/NeoNet pendiente.\nCuando recibas las credenciales, esta funcionalidad estará lista para implementar.')
      
      // Simular delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setLoading(false)
      
    } catch (error) {
      console.error('Error processing CyberSource payment:', error)
      setErrors(['Error de conexión al procesar pago'])
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header de CyberSource */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building className="h-5 w-5 text-blue-600" />
            <span>CyberSource by NeoNet</span>
          </CardTitle>
          <p className="text-sm text-gray-600">
            Procesamiento seguro de tarjetas locales e internacionales para Guatemala
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
                <p className="text-xs text-blue-600 mt-1">
                  Procesado por CyberSource/NeoNet
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-2 text-sm text-blue-600">
                  <Shield className="h-4 w-4" />
                  <span>Pago Seguro</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-blue-600 mt-1">
                  <Building className="h-4 w-4" />
                  <span>NeoNet Guatemala</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formulario de Tarjeta */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Información de la Tarjeta</span>
            {cardType && (
              <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {cardType}
              </span>
            )}
          </CardTitle>
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
                onChange={(e) => handleCardNumberChange(e.target.value)}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                🇬🇹 Tarjetas locales e internacionales aceptadas
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vencimiento <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={cardDetails.expiryDate}
                  onChange={(e) => handleExpiryChange(e.target.value)}
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
                Banco Emisor (Opcional)
              </label>
              <select
                value={cardDetails.bankCode}
                onChange={(e) => setCardDetails({...cardDetails, bankCode: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Detectar automáticamente</option>
                {CYBERSOURCE_CONFIG.localBanks.map((bank) => (
                  <option key={bank.code} value={bank.code}>
                    {bank.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Errores */}
            {errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-800 font-medium">Error en los datos:</p>
                    <ul className="text-red-700 text-sm mt-1">
                      {errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Información de Seguridad */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-3">🔒 Seguridad CyberSource/NeoNet</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-green-800">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>Encriptación de Grado Bancario</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Lock className="h-4 w-4" />
                  <span>PCI DSS Level 1</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>3D Secure 2.0</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Building className="h-4 w-4" />
                  <span>Regulado por SIB Guatemala</span>
                </div>
              </div>
            </div>

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
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Procesando...
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

      {/* Información de Bancos Soportados */}
      <Card>
        <CardContent className="p-4">
          <div className="text-sm text-gray-600">
            <h4 className="font-medium text-gray-900 mb-3">🏦 Bancos Guatemaltecos Soportados:</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {CYBERSOURCE_CONFIG.localBanks.map((bank) => (
                <div key={bank.code} className="flex items-center space-x-2">
                  <Building className="h-3 w-3 text-blue-500" />
                  <span className="text-xs">{bank.name}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-gray-200">
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <Globe className="h-3 w-3" />
                  <span>Tarjetas Internacionales</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Smartphone className="h-3 w-3" />
                  <span>Procesado por NeoNet</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Shield className="h-3 w-3" />
                  <span>Regulado por SIB</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Nota de Integración Pendiente */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-medium mb-1">🚧 Integración en Preparación</p>
              <p>
                El formulario está listo para conectarse con la API de CyberSource/NeoNet. 
                Una vez que recibas las credenciales y documentación de NeoNet, 
                la integración se completará en pocas horas.
              </p>
              <p className="mt-2 text-xs">
                <strong>Mientras tanto:</strong> Usa el sistema de pagos manuales para registrar 
                pagos con tarjeta procesados externamente.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
