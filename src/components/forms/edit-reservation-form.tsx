'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X, Save, AlertCircle } from 'lucide-react'

interface EditReservationFormProps {
  reservation: any
  onClose: () => void
  onSave: () => void
}

export function EditReservationForm({ reservation, onClose, onSave }: EditReservationFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    status: reservation.status || 'PENDING',
    specialRequests: reservation.specialRequests || '',
    notes: reservation.notes || ''
  })

  const statusOptions = [
    { value: 'PENDING', label: 'Pendiente', color: 'text-yellow-600' },
    { value: 'CONFIRMED', label: 'Confirmada', color: 'text-green-600' },
    { value: 'CANCELLED', label: 'Cancelada', color: 'text-red-600' },
    { value: 'NO_SHOW', label: 'No Show', color: 'text-gray-600' },
    { value: 'COMPLETED', label: 'Completada', color: 'text-blue-600' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/reservations/${reservation.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        console.log('✅ Reservation updated successfully')
        onSave()
      } else {
        const error = await response.json()
        alert(`Error actualizando reservación: ${error.error || 'Error desconocido'}`)
      }
    } catch (error) {
      console.error('Error updating reservation:', error)
      alert('Error de conexión al actualizar reservación')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Editar Reservación</CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              {reservation.confirmationNumber} • {reservation.guest.firstName} {reservation.guest.lastName}
            </p>
          </div>
          <Button variant="ghost" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información de la reservación (solo lectura) */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <h3 className="font-medium text-gray-900">Información de la Reservación</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Huésped:</span>
                <p className="font-medium">{reservation.guest.firstName} {reservation.guest.lastName}</p>
              </div>
              <div>
                <span className="text-gray-500">Email:</span>
                <p className="font-medium">{reservation.guest.email || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-500">Fechas:</span>
                <p className="font-medium">
                  {reservation.checkin?.split('T')[0]} a {reservation.checkout?.split('T')[0]}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Total:</span>
                <p className="font-medium">${reservation.totalAmount}</p>
              </div>
            </div>
            
            {/* Items de la reservación */}
            <div>
              <span className="text-gray-500">Servicios:</span>
              <div className="mt-1 space-y-1">
                {reservation.reservationItems.map((item: any) => (
                  <p key={item.id} className="text-sm font-medium">
                    • {item.title} - ${item.amount}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Campos editables */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado de la Reservación
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Solicitudes Especiales
              </label>
              <textarea
                value={formData.specialRequests}
                onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                placeholder="Cama extra, vista al mar, etc..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas Internas
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Notas para el personal del hotel..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Advertencia para reservaciones confirmadas */}
          {reservation.status === 'CONFIRMED' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800">Reservación Confirmada</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Esta reservación está confirmada. Solo puedes modificar solicitudes especiales y notas.
                    Para cambios mayores, contacta al huésped directamente.
                  </p>
                </div>
              </div>
            </div>
          )}

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
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}





