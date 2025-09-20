'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Save, 
  X, 
  DollarSign,
  CreditCard,
  Banknote,
  Users,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { CyberSourcePaymentForm } from '@/components/payment/cybersource-payment-form'

interface PaymentFormProps {
  payment?: any
  reservationId?: string
  onClose: () => void
  onSave: () => void
}

interface Reservation {
  id: string
  confirmationNumber: string
  totalAmount: string
  paymentStatus: string
  guest: {
    firstName: string
    lastName: string
    email?: string
  }
  payments: {
    id: string
    amount: string
    status: string
  }[]
}

export function PaymentForm({ payment, reservationId, onClose, onSave }: PaymentFormProps) {
  const [loading, setLoading] = useState(false)
  const [showCyberSourceForm, setShowCyberSourceForm] = useState(false)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [formData, setFormData] = useState({
    reservationId: reservationId || payment?.reservationId || '',
    provider: payment?.provider || 'MANUAL',
    paymentMethod: payment?.paymentMethod || 'CASH',
    amount: payment?.amount || '',
    currency: payment?.currency || 'USD',
    txnRef: payment?.txnRef || '',
    notes: payment?.notes || '',
    processedAt: payment?.processedAt ? payment.processedAt.split('T')[0] : new Date().toISOString().split('T')[0],
  })

  useEffect(() => {
    if (!reservationId) {
      fetchReservations()
    }
    if (formData.reservationId) {
      fetchReservationDetails(formData.reservationId)
    }
  }, [formData.reservationId])

  const fetchReservations = async () => {
    try {
      const response = await fetch('/api/reservations?limit=100')
      
      if (response.ok) {
        const data = await response.json()
        
        // Filtrar solo reservaciones que pueden recibir pagos
        const payableReservations = (data.reservations || []).filter((res: any) => 
          ['PENDING', 'CONFIRMED'].includes(res.status) && 
          ['PENDING', 'PARTIAL'].includes(res.paymentStatus)
        )
        
        setReservations(payableReservations)
      }
    } catch (error) {
      console.error('Error fetching reservations:', error)
    }
  }

  const fetchReservationDetails = async (resId: string) => {
    try {
      const response = await fetch(`/api/reservations/${resId}`)
      if (response.ok) {
        const data = await response.json()
        setSelectedReservation(data)
      }
    } catch (error) {
      console.error('Error fetching reservation details:', error)
    }
  }

  const calculatePendingAmount = () => {
    if (!selectedReservation) return 0
    
    const totalAmount = parseFloat(selectedReservation.totalAmount)
    const paidAmount = selectedReservation.payments
      .filter(p => p.status === 'PAID')
      .reduce((sum, p) => sum + parseFloat(p.amount), 0)
    
    return totalAmount - paidAmount
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = payment ? `/api/payments/${payment.id}` : '/api/payments'
      const method = payment ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        onSave()
      } else {
        const error = await response.json()
        alert(error.error || 'Error guardando pago')
      }
    } catch (error) {
      console.error('Error saving payment:', error)
      alert('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const pendingAmount = calculatePendingAmount()
  const maxAmount = pendingAmount

  // Si se muestra el formulario de CyberSource
  if (showCyberSourceForm && selectedReservation) {
    return (
      <CyberSourcePaymentForm
        reservationId={selectedReservation.id}
        amount={pendingAmount}
        currency={formData.currency as 'USD' | 'GTQ'}
        onSuccess={() => {
          onSave()
          setShowCyberSourceForm(false)
        }}
        onCancel={() => setShowCyberSourceForm(false)}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Selector de Método de Pago */}
      {selectedReservation && pendingAmount > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>💳 ¿Cómo deseas procesar el pago?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCyberSourceForm(true)}
                className="h-20 flex flex-col items-center justify-center space-y-2 border-blue-200 hover:bg-blue-50"
              >
                <CreditCard className="h-8 w-8 text-blue-600" />
                <div className="text-center">
                  <p className="font-medium">💳 Pago con Tarjeta</p>
                  <p className="text-xs text-gray-600">CyberSource/NeoNet</p>
                </div>
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => {}} // Continúa con formulario manual
                className="h-20 flex flex-col items-center justify-center space-y-2 border-green-200 hover:bg-green-50"
              >
                <Banknote className="h-8 w-8 text-green-600" />
                <div className="text-center">
                  <p className="font-medium">💵 Pago Manual</p>
                  <p className="text-xs text-gray-600">Efectivo, transferencia</p>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
      {/* Selección de Reservación */}
      {!reservationId && (
        <Card>
          <CardHeader>
            <CardTitle>Seleccionar Reservación</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reservación <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.reservationId}
                onChange={(e) => setFormData({...formData, reservationId: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">
                  {reservations.length === 0 ? 'Cargando reservaciones...' : 'Seleccionar reservación...'}
                </option>
                {reservations.map((reservation) => (
                  <option key={reservation.id} value={reservation.id}>
                    {reservation.confirmationNumber} - {reservation.guest.firstName} {reservation.guest.lastName} 
                    ({formatCurrency(parseFloat(reservation.totalAmount))} - {reservation.paymentStatus})
                  </option>
                ))}
              </select>
              {reservations.length === 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  {loading ? 'Cargando reservaciones...' : 'No hay reservaciones pendientes de pago'}
                </p>
              )}
              {reservations.length > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  Se muestran solo reservaciones con pagos pendientes o parciales
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Información de la Reservación */}
      {selectedReservation && (
        <Card>
          <CardHeader>
            <CardTitle>📋 Información de la Reservación</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-blue-600">Cliente</p>
                  <p className="font-medium">
                    {selectedReservation.guest.firstName} {selectedReservation.guest.lastName}
                  </p>
                  <p className="text-xs text-gray-600">{selectedReservation.guest.email}</p>
                </div>
                <div>
                  <p className="text-sm text-blue-600">Confirmación</p>
                  <p className="font-medium">{selectedReservation.confirmationNumber}</p>
                  <p className="text-xs text-gray-600">Estado: {selectedReservation.paymentStatus}</p>
                </div>
                <div>
                  <p className="text-sm text-blue-600">Total de la Reservación</p>
                  <p className="text-lg font-bold text-blue-900">
                    {formatCurrency(parseFloat(selectedReservation.totalAmount))}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-blue-600">Monto Pendiente</p>
                  <p className="text-lg font-bold text-green-900">
                    {formatCurrency(pendingAmount)}
                  </p>
                </div>
              </div>

              {/* Pagos existentes */}
              {selectedReservation.payments.length > 0 && (
                <div className="mt-4 pt-4 border-t border-blue-200">
                  <p className="text-sm text-blue-600 mb-2">Pagos Anteriores:</p>
                  <div className="space-y-2">
                    {selectedReservation.payments.map((p, index) => (
                      <div key={p.id} className="flex items-center justify-between text-sm">
                        <span>Pago #{index + 1}</span>
                        <span className="font-medium">
                          {formatCurrency(parseFloat(p.amount))} 
                          <span className={`ml-2 px-2 py-1 rounded text-xs ${
                            p.status === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {p.status}
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detalles del Pago */}
      <Card>
        <CardHeader>
          <CardTitle>💳 Detalles del Pago</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monto <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={maxAmount}
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  placeholder="0.00"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              {maxAmount > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  Máximo: {formatCurrency(maxAmount)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Moneda
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({...formData, currency: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="USD">USD - Dólar Americano</option>
                <option value="GTQ">GTQ - Quetzal Guatemalteco</option>
                <option value="EUR">EUR - Euro</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Método de Pago <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="CASH">💵 Efectivo</option>
                <option value="CREDIT_CARD">💳 Tarjeta de Crédito</option>
                <option value="DEBIT_CARD">💳 Tarjeta de Débito</option>
                <option value="BANK_TRANSFER">🏦 Transferencia Bancaria</option>
                <option value="PAYPAL">💰 PayPal</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Proveedor <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.provider}
                onChange={(e) => setFormData({...formData, provider: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="MANUAL">Manual (Admin)</option>
                <option value="STRIPE">Stripe</option>
                <option value="PAYPAL">PayPal</option>
                <option value="BANK">Banco Local</option>
                <option value="CASH">Efectivo</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Referencia de Transacción
              </label>
              <input
                type="text"
                value={formData.txnRef}
                onChange={(e) => setFormData({...formData, txnRef: e.target.value})}
                placeholder="Ej: TXN123456, Depósito #789"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Procesamiento
              </label>
              <input
                type="date"
                value={formData.processedAt}
                onChange={(e) => setFormData({...formData, processedAt: e.target.value})}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Notas adicionales sobre el pago..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </CardContent>
      </Card>

      {/* Resumen del Pago */}
      {selectedReservation && formData.amount && (
        <Card>
          <CardHeader>
            <CardTitle>📊 Resumen del Pago</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm text-green-600">Total Reservación</p>
                  <p className="text-lg font-bold text-green-900">
                    {formatCurrency(parseFloat(selectedReservation.totalAmount))}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-green-600">Este Pago</p>
                  <p className="text-lg font-bold text-green-900">
                    {formatCurrency(parseFloat(formData.amount || '0'))}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-green-600">Restante</p>
                  <p className="text-lg font-bold text-green-900">
                    {formatCurrency(pendingAmount - parseFloat(formData.amount || '0'))}
                  </p>
                </div>
              </div>

              {/* Estado resultante */}
              <div className="mt-4 pt-4 border-t border-green-200 text-center">
                {(() => {
                  const newPending = pendingAmount - parseFloat(formData.amount || '0')
                  const total = parseFloat(selectedReservation.totalAmount)
                  
                  if (newPending <= 0) {
                    return (
                      <div className="flex items-center justify-center space-x-2 text-green-700">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-medium">✅ Pago Completo - Reservación se confirmará automáticamente</span>
                      </div>
                    )
                  } else if (parseFloat(formData.amount || '0') > 0) {
                    return (
                      <div className="flex items-center justify-center space-x-2 text-yellow-700">
                        <Clock className="h-5 w-5" />
                        <span className="font-medium">⏳ Pago Parcial - Quedará pendiente {formatCurrency(newPending)}</span>
                      </div>
                    )
                  } else {
                    return (
                      <div className="flex items-center justify-center space-x-2 text-gray-700">
                        <AlertCircle className="h-5 w-5" />
                        <span>Ingresa un monto para ver el resumen</span>
                      </div>
                    )
                  }
                })()}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Información Importante */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">💡 Información Importante:</p>
              <ul className="space-y-1 text-xs">
                <li>• Los pagos marcados como "PAID" actualizarán automáticamente el estado de la reservación</li>
                <li>• Si el pago completa el monto total, la reservación se confirmará automáticamente</li>
                <li>• Los pagos parciales mantienen la reservación en estado "PARTIAL"</li>
                <li>• Siempre incluye una referencia de transacción para facilitar la conciliación</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botones */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={loading || !formData.reservationId || !formData.amount}
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Registrando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {payment ? 'Actualizar Pago' : 'Registrar Pago'}
            </>
          )}
        </Button>
        </div>
      </form>
    </div>
  )
}
