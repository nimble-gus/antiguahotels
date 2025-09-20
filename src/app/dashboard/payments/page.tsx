'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Plus, 
  DollarSign,
  CreditCard,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Search,
  Filter,
  Eye,
  FileText,
  Download,
  Calendar,
  TrendingUp,
  Users,
  Banknote,
  X
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { PaymentForm } from '@/components/forms/payment-form'

interface Payment {
  id: string
  reservationId: string
  paymentIntentId?: string
  provider: string
  status: 'INITIATED' | 'PROCESSING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'CANCELLED'
  paymentMethod: 'CREDIT_CARD' | 'DEBIT_CARD' | 'PAYPAL' | 'BANK_TRANSFER' | 'CASH'
  amount: string
  currency: string
  txnRef?: string
  processedAt?: string
  notes?: string
  createdAt: string
  reservation: {
    id: string
    confirmationNumber: string
    status: string
    paymentStatus: string
    totalAmount: string
    guest: {
      id: string
      firstName: string
      lastName: string
      email?: string
      phone?: string
    }
  }
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [methodFilter, setMethodFilter] = useState('')
  const [providerFilter, setProviderFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState<any>(null)
  const [stats, setStats] = useState({
    totalRevenue: '0',
    pendingAmount: '0',
    paidToday: '0',
    totalTransactions: 0
  })

  useEffect(() => {
    fetchPayments()
    fetchStats()
  }, [currentPage, searchTerm, statusFilter, methodFilter, providerFilter])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter }),
        ...(methodFilter && { paymentMethod: methodFilter }),
        ...(providerFilter && { provider: providerFilter }),
      })

      console.log('💳 Fetching payments...')
      const response = await fetch(`/api/payments?${params}`)
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Payments loaded:', data.payments?.length || 0)
        setPayments(data.payments || [])
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching payments:', error)
      alert('Error cargando pagos')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/payments/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching payment stats:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-green-100 text-green-800'
      case 'PROCESSING': return 'bg-yellow-100 text-yellow-800'
      case 'INITIATED': return 'bg-blue-100 text-blue-800'
      case 'FAILED': return 'bg-red-100 text-red-800'
      case 'REFUNDED': return 'bg-purple-100 text-purple-800'
      case 'CANCELLED': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PAID': return 'Pagado'
      case 'PROCESSING': return 'Procesando'
      case 'INITIATED': return 'Iniciado'
      case 'FAILED': return 'Fallido'
      case 'REFUNDED': return 'Reembolsado'
      case 'CANCELLED': return 'Cancelado'
      default: return status
    }
  }

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'CREDIT_CARD':
      case 'DEBIT_CARD':
        return <CreditCard className="h-4 w-4" />
      case 'CASH':
        return <Banknote className="h-4 w-4" />
      case 'BANK_TRANSFER':
        return <DollarSign className="h-4 w-4" />
      case 'PAYPAL':
        return <DollarSign className="h-4 w-4" />
      default:
        return <DollarSign className="h-4 w-4" />
    }
  }

  const getMethodLabel = (method: string) => {
    switch (method) {
      case 'CREDIT_CARD': return 'Tarjeta de Crédito'
      case 'DEBIT_CARD': return 'Tarjeta de Débito'
      case 'PAYPAL': return 'PayPal'
      case 'BANK_TRANSFER': return 'Transferencia Bancaria'
      case 'CASH': return 'Efectivo'
      default: return method
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Pagos</h1>
          <p className="text-gray-600">Control financiero y procesamiento de pagos</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Registrar Pago
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(parseFloat(stats.totalRevenue))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(parseFloat(stats.pendingAmount))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Hoy</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(parseFloat(stats.paidToday))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Transacciones</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTransactions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filtros</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Buscar
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Confirmación, cliente..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos</option>
                <option value="PAID">Pagado</option>
                <option value="PROCESSING">Procesando</option>
                <option value="INITIATED">Iniciado</option>
                <option value="FAILED">Fallido</option>
                <option value="REFUNDED">Reembolsado</option>
                <option value="CANCELLED">Cancelado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Método
              </label>
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos</option>
                <option value="CREDIT_CARD">Tarjeta de Crédito</option>
                <option value="DEBIT_CARD">Tarjeta de Débito</option>
                <option value="PAYPAL">PayPal</option>
                <option value="BANK_TRANSFER">Transferencia</option>
                <option value="CASH">Efectivo</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Proveedor
              </label>
              <select
                value={providerFilter}
                onChange={(e) => setProviderFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos</option>
                <option value="STRIPE">Stripe</option>
                <option value="PAYPAL">PayPal</option>
                <option value="MANUAL">Manual</option>
                <option value="BANK">Banco</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('')
                  setStatusFilter('')
                  setMethodFilter('')
                  setProviderFilter('')
                  setCurrentPage(1)
                }}
                className="w-full"
              >
                Limpiar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Pagos */}
      <div className="grid gap-4">
        {payments.map((payment) => (
          <Card key={payment.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Header del pago */}
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center border border-green-200">
                        {getMethodIcon(payment.paymentMethod)}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {formatCurrency(parseFloat(payment.amount))}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                          {getStatusLabel(payment.status)}
                        </span>
                        <span className="text-sm text-gray-500">
                          {payment.currency}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {payment.reservation.guest.firstName} {payment.reservation.guest.lastName}
                        </div>
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-1" />
                          {payment.reservation.confirmationNumber}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(payment.processedAt || payment.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Detalles del pago */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-blue-600 font-medium">💳 Método</p>
                      <p className="text-sm font-bold text-blue-900">
                        {getMethodLabel(payment.paymentMethod)}
                      </p>
                      <p className="text-xs text-blue-600">
                        {payment.provider}
                      </p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-sm text-green-600 font-medium">💰 Reservación</p>
                      <p className="text-sm font-bold text-green-900">
                        {formatCurrency(parseFloat(payment.reservation.totalAmount))}
                      </p>
                      <p className="text-xs text-green-600">
                        Estado: {payment.reservation.paymentStatus}
                      </p>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <p className="text-sm text-yellow-600 font-medium">🎫 Referencia</p>
                      <p className="text-sm font-bold text-yellow-900">
                        {payment.txnRef || 'N/A'}
                      </p>
                      <p className="text-xs text-yellow-600">
                        ID: {payment.id}
                      </p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <p className="text-sm text-purple-600 font-medium">📅 Procesado</p>
                      <p className="text-sm font-bold text-purple-900">
                        {payment.processedAt ? formatDate(payment.processedAt) : 'Pendiente'}
                      </p>
                      <p className="text-xs text-purple-600">
                        {payment.processedAt ? 'Completado' : 'En proceso'}
                      </p>
                    </div>
                  </div>

                  {/* Notas */}
                  {payment.notes && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">
                        <strong>Notas:</strong> {payment.notes}
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Acciones */}
                <div className="flex flex-col space-y-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => alert(`Vista detallada del pago ${payment.id} - Por implementar`)}
                    title="Ver detalles"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => alert(`Recibo del pago ${payment.id} - Por implementar`)}
                    title="Generar recibo"
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                  {payment.status === 'PAID' && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => alert(`Reembolso del pago ${payment.id} - Por implementar`)}
                      title="Procesar reembolso"
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Paginación */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Mostrando {((currentPage - 1) * pagination.limit) + 1} a {Math.min(currentPage * pagination.limit, pagination.total)} de {pagination.total} pagos
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            <span className="flex items-center px-3 py-1 text-sm">
              Página {currentPage} de {pagination.pages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === pagination.pages}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}

      {/* Mensaje cuando no hay pagos */}
      {!loading && payments.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <DollarSign className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay pagos registrados</h3>
            <p className="text-gray-500 mb-6">
              Los pagos aparecerán aquí cuando se procesen las reservaciones
            </p>
            <Button onClick={() => alert('Registrar primer pago - Por implementar')}>
              <Plus className="h-4 w-4 mr-2" />
              Registrar Primer Pago
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Formulario de registrar/editar pago */}
      {(showCreateForm || editingPayment) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingPayment ? 'Editar Pago' : 'Registrar Nuevo Pago'}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowCreateForm(false)
                    setEditingPayment(null)
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="p-6">
              <PaymentForm
                payment={editingPayment}
                onClose={() => {
                  setShowCreateForm(false)
                  setEditingPayment(null)
                }}
                onSave={() => {
                  fetchPayments()
                  fetchStats()
                  setShowCreateForm(false)
                  setEditingPayment(null)
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
