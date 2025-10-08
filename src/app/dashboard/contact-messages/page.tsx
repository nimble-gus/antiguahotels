'use client'

import { useState, useEffect } from 'react'
import { 
  Mail, 
  Phone, 
  Calendar, 
  Search, 
  Filter, 
  Eye, 
  Reply, 
  Archive,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle
} from 'lucide-react'

interface ContactMessage {
  id: string
  name: string
  email: string
  phone?: string
  subject: string
  message: string
  preferredContact: string
  status: 'NEW' | 'IN_PROGRESS' | 'RESPONDED' | 'CLOSED'
  isRead: boolean
  response?: string
  respondedAt?: string
  createdAt: string
  updatedAt: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

export default function ContactMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchMessages()
  }, [pagination.page, statusFilter, searchTerm])

  const fetchMessages = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(statusFilter && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm })
      })

      const response = await fetch(`/api/contact?${params}`)
      
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages)
        setPagination(data.pagination)
      } else {
        console.error('Error fetching messages')
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (messageId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/contact/${messageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        setMessages(prev => prev.map(msg => 
          msg.id === messageId ? { ...msg, status: newStatus as any } : msg
        ))
      }
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const handleMarkAsRead = async (messageId: string) => {
    try {
      const response = await fetch(`/api/contact/${messageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: true })
      })

      if (response.ok) {
        setMessages(prev => prev.map(msg => 
          msg.id === messageId ? { ...msg, isRead: true } : msg
        ))
      }
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'NEW':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'IN_PROGRESS':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'RESPONDED':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'CLOSED':
        return <XCircle className="h-4 w-4 text-gray-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW':
        return 'bg-red-100 text-red-800'
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800'
      case 'RESPONDED':
        return 'bg-green-100 text-green-800'
      case 'CLOSED':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-antigua-purple mr-3"></div>
        <span>Cargando mensajes...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mensajes de Contacto</h1>
          <p className="text-gray-600">Gestiona los mensajes enviados desde el formulario de contacto</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchMessages}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Actualizar
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre, email o asunto..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-antigua-purple focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-antigua-purple focus:border-transparent"
            >
              <option value="">Todos los estados</option>
              <option value="NEW">Nuevos</option>
              <option value="IN_PROGRESS">En Progreso</option>
              <option value="RESPONDED">Respondidos</option>
              <option value="CLOSED">Cerrados</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('')
                setStatusFilter('')
              }}
              className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200"
            >
              Limpiar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {messages.length === 0 ? (
          <div className="p-12 text-center">
            <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay mensajes</h3>
            <p className="text-gray-500">No se encontraron mensajes con los filtros aplicados.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contacto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Asunto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {messages.map((message) => (
                  <tr key={message.id} className={!message.isRead ? 'bg-blue-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-antigua-purple/10 flex items-center justify-center">
                            <Mail className="h-5 w-5 text-antigua-purple" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {message.name}
                            {!message.isRead && <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full inline-block"></span>}
                          </div>
                          <div className="text-sm text-gray-500">{message.email}</div>
                          {message.phone && (
                            <div className="text-sm text-gray-500 flex items-center">
                              <Phone className="h-3 w-3 mr-1" />
                              {message.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{message.subject}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {message.message.substring(0, 100)}...
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(message.status)}`}>
                        {getStatusIcon(message.status)}
                        <span className="ml-1">
                          {message.status === 'NEW' && 'Nuevo'}
                          {message.status === 'IN_PROGRESS' && 'En Progreso'}
                          {message.status === 'RESPONDED' && 'Respondido'}
                          {message.status === 'CLOSED' && 'Cerrado'}
                        </span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(message.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedMessage(message)
                            setShowModal(true)
                            if (!message.isRead) {
                              handleMarkAsRead(message.id)
                            }
                          }}
                          className="text-antigua-purple hover:text-purple-700"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        
                        <select
                          value={message.status}
                          onChange={(e) => handleStatusChange(message.id, e.target.value)}
                          className="text-xs border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="NEW">Nuevo</option>
                          <option value="IN_PROGRESS">En Progreso</option>
                          <option value="RESPONDED">Respondido</option>
                          <option value="CLOSED">Cerrado</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Mostrando {((pagination.page - 1) * pagination.limit) + 1} a {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} mensajes
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.pages}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* Message Detail Modal */}
      {showModal && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Detalle del Mensaje</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre</label>
                    <p className="text-sm text-gray-900">{selectedMessage.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="text-sm text-gray-900">{selectedMessage.email}</p>
                  </div>
                  {selectedMessage.phone && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                      <p className="text-sm text-gray-900">{selectedMessage.phone}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Preferencia de Contacto</label>
                    <p className="text-sm text-gray-900 capitalize">{selectedMessage.preferredContact}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Asunto</label>
                  <p className="text-sm text-gray-900">{selectedMessage.subject}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Mensaje</label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedMessage.message}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm text-gray-500">
                    Enviado el {formatDate(selectedMessage.createdAt)}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        window.location.href = `mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`
                      }}
                      className="px-4 py-2 text-sm font-medium text-white bg-antigua-purple rounded-lg hover:bg-purple-700 flex items-center"
                    >
                      <Reply className="h-4 w-4 mr-2" />
                      Responder
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

