'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar,
  Building,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Edit,
  Trash2,
  Download,
  RefreshCw,
  Shield,
  Wrench,
  Users,
  Lock
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface AvailabilityBlock {
  id: string
  hotelId: string
  roomTypeId: string | null
  startDate: string
  endDate: string
  blockType: string
  reason: string | null
  description: string | null
  isActive: boolean
  createdBy: string
  createdAt: string
  updatedAt: string
  hotel: {
    id: string
    name: string
    code: string
  }
  roomType: {
    id: string
    name: string
  } | null
  adminUser: {
    id: string
    firstName: string
    lastName: string
  }
}

interface Hotel {
  id: string
  name: string
  code: string
}

interface RoomType {
  id: string
  name: string
  hotelId: string
}

export default function AvailabilityBlocksPage() {
  const [blocks, setBlocks] = useState<AvailabilityBlock[]>([])
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    hotelId: '',
    roomTypeId: '',
    blockType: '',
    startDate: '',
    endDate: ''
  })
  const [showFilters, setShowFilters] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedBlock, setSelectedBlock] = useState<AvailabilityBlock | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)

  // Formulario para crear bloque
  const [formData, setFormData] = useState({
    hotelId: '',
    roomTypeId: '',
    startDate: '',
    endDate: '',
    blockType: '',
    reason: '',
    description: ''
  })

  // Cargar hoteles
  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const response = await fetch('/api/hotels')
        if (response.ok) {
          const data = await response.json()
          setHotels(data.hotels || [])
        }
      } catch (error) {
        console.error('Error fetching hotels:', error)
      }
    }
    fetchHotels()
  }, [])

  // Cargar tipos de habitación cuando se selecciona un hotel
  useEffect(() => {
    if (formData.hotelId) {
      const fetchRoomTypes = async () => {
        try {
          const response = await fetch(`/api/hotels/${formData.hotelId}/room-types`)
          if (response.ok) {
            const data = await response.json()
            setRoomTypes(data.roomTypes || [])
          }
        } catch (error) {
          console.error('Error fetching room types:', error)
        }
      }
      fetchRoomTypes()
    } else {
      setRoomTypes([])
    }
  }, [formData.hotelId])

  // Cargar bloques de disponibilidad
  const fetchBlocks = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams(
        Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== ''))
      )

      const response = await fetch(`/api/availability-blocks?${params}`)
      if (response.ok) {
        const data = await response.json()
        setBlocks(data || [])
      }
    } catch (error) {
      console.error('Error fetching availability blocks:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBlocks()
  }, [filters])

  const getBlockTypeBadge = (blockType: string) => {
    const typeConfig = {
      MAINTENANCE: { color: 'bg-orange-100 text-orange-800', icon: Wrench },
      RENOVATION: { color: 'bg-purple-100 text-purple-800', icon: Wrench },
      PRIVATE_EVENT: { color: 'bg-blue-100 text-blue-800', icon: Users },
      OVERBOOKING: { color: 'bg-red-100 text-red-800', icon: AlertTriangle },
      SYSTEM_BLOCK: { color: 'bg-gray-100 text-gray-800', icon: Lock },
      MANUAL_BLOCK: { color: 'bg-yellow-100 text-yellow-800', icon: Shield }
    }

    const config = typeConfig[blockType as keyof typeof typeConfig] || typeConfig.MANUAL_BLOCK
    const IconComponent = config.icon

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <IconComponent className="h-3 w-3" />
        {blockType.replace('_', ' ')}
      </Badge>
    )
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleFormChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  const handleCreateBlock = async () => {
    try {
      const response = await fetch('/api/availability-blocks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setShowCreateDialog(false)
        setFormData({
          hotelId: '',
          roomTypeId: '',
          startDate: '',
          endDate: '',
          blockType: '',
          reason: '',
          description: ''
        })
        fetchBlocks()
      } else {
        const error = await response.json()
        alert(error.error || 'Error creando bloque de disponibilidad')
      }
    } catch (error) {
      console.error('Error creating availability block:', error)
      alert('Error creando bloque de disponibilidad')
    }
  }

  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bloques de Disponibilidad</h1>
          <p className="text-gray-600">Gestiona bloques de disponibilidad para evitar sobreventa</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filtros
          </Button>
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nuevo Bloque
          </Button>
        </div>
      </div>

      {/* Filtros */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="hotelId">Hotel</Label>
                <Select value={filters.hotelId} onValueChange={(value) => handleFilterChange('hotelId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los hoteles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos los hoteles</SelectItem>
                    {hotels.map((hotel) => (
                      <SelectItem key={hotel.id} value={hotel.id}>
                        {hotel.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="blockType">Tipo de Bloque</Label>
                <Select value={filters.blockType} onValueChange={(value) => handleFilterChange('blockType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos los tipos</SelectItem>
                    <SelectItem value="MAINTENANCE">Mantenimiento</SelectItem>
                    <SelectItem value="RENOVATION">Renovación</SelectItem>
                    <SelectItem value="PRIVATE_EVENT">Evento Privado</SelectItem>
                    <SelectItem value="OVERBOOKING">Sobreventa</SelectItem>
                    <SelectItem value="SYSTEM_BLOCK">Bloqueo del Sistema</SelectItem>
                    <SelectItem value="MANUAL_BLOCK">Bloqueo Manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="startDate">Fecha desde</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="endDate">Fecha hasta</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setFilters({
                    hotelId: '',
                    roomTypeId: '',
                    blockType: '',
                    startDate: '',
                    endDate: ''
                  })
                }}
              >
                Limpiar
              </Button>
              <Button onClick={fetchBlocks}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Aplicar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de bloques */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Bloques de Disponibilidad</CardTitle>
              <CardDescription>
                {blocks.length} bloques encontrados
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : blocks.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No se encontraron bloques de disponibilidad</p>
            </div>
          ) : (
            <div className="space-y-4">
              {blocks.map((block) => (
                <div
                  key={block.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getBlockTypeBadge(block.blockType)}
                        <Badge variant="outline">
                          {block.isActive ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </div>
                      
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {block.hotel.name}
                        {block.roomType && ` - ${block.roomType.name}`}
                      </h3>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(block.startDate).toLocaleDateString()} - {new Date(block.endDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {calculateDuration(block.startDate, block.endDate)} días
                        </div>
                        {block.reason && (
                          <div className="flex items-center gap-1">
                            <AlertTriangle className="h-4 w-4" />
                            {block.reason}
                          </div>
                        )}
                      </div>

                      {block.description && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                          {block.description}
                        </div>
                      )}

                      <div className="mt-2 text-xs text-gray-500">
                        Creado por: {block.adminUser.firstName} {block.adminUser.lastName} • 
                        {new Date(block.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedBlock(block)
                          setShowDetailsDialog(true)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog para crear bloque */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Crear Bloque de Disponibilidad</DialogTitle>
            <DialogDescription>
              Bloquea habitaciones para evitar reservaciones en fechas específicas
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="hotelId">Hotel *</Label>
                <Select value={formData.hotelId} onValueChange={(value) => handleFormChange('hotelId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar hotel" />
                  </SelectTrigger>
                  <SelectContent>
                    {hotels.map((hotel) => (
                      <SelectItem key={hotel.id} value={hotel.id}>
                        {hotel.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="roomTypeId">Tipo de Habitación</Label>
                <Select 
                  value={formData.roomTypeId} 
                  onValueChange={(value) => handleFormChange('roomTypeId', value)}
                  disabled={!formData.hotelId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las habitaciones" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas las habitaciones</SelectItem>
                    {roomTypes.map((roomType) => (
                      <SelectItem key={roomType.id} value={roomType.id}>
                        {roomType.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Fecha de Inicio *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleFormChange('startDate', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="endDate">Fecha de Fin *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleFormChange('endDate', e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="blockType">Tipo de Bloque *</Label>
              <Select value={formData.blockType} onValueChange={(value) => handleFormChange('blockType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MAINTENANCE">Mantenimiento</SelectItem>
                  <SelectItem value="RENOVATION">Renovación</SelectItem>
                  <SelectItem value="PRIVATE_EVENT">Evento Privado</SelectItem>
                  <SelectItem value="OVERBOOKING">Sobreventa</SelectItem>
                  <SelectItem value="SYSTEM_BLOCK">Bloqueo del Sistema</SelectItem>
                  <SelectItem value="MANUAL_BLOCK">Bloqueo Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="reason">Razón</Label>
              <Input
                id="reason"
                value={formData.reason}
                onChange={(e) => handleFormChange('reason', e.target.value)}
                placeholder="Ej: Mantenimiento de aire acondicionado"
              />
            </div>

            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
                placeholder="Descripción detallada del bloque..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateBlock}>
              Crear Bloque
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de detalles */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles del Bloque de Disponibilidad</DialogTitle>
            <DialogDescription>
              Información completa del bloque
            </DialogDescription>
          </DialogHeader>
          
          {selectedBlock && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Información del Bloque</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Hotel:</strong> {selectedBlock.hotel.name}</div>
                    {selectedBlock.roomType && (
                      <div><strong>Tipo de Habitación:</strong> {selectedBlock.roomType.name}</div>
                    )}
                    <div><strong>Tipo de Bloque:</strong> {selectedBlock.blockType}</div>
                    <div><strong>Estado:</strong> {selectedBlock.isActive ? 'Activo' : 'Inactivo'}</div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Fechas</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Inicio:</strong> {new Date(selectedBlock.startDate).toLocaleDateString()}</div>
                    <div><strong>Fin:</strong> {new Date(selectedBlock.endDate).toLocaleDateString()}</div>
                    <div><strong>Duración:</strong> {calculateDuration(selectedBlock.startDate, selectedBlock.endDate)} días</div>
                  </div>
                </div>
              </div>

              {selectedBlock.reason && (
                <div>
                  <h3 className="font-semibold mb-2">Razón</h3>
                  <div className="p-3 bg-yellow-50 rounded text-sm">
                    {selectedBlock.reason}
                  </div>
                </div>
              )}

              {selectedBlock.description && (
                <div>
                  <h3 className="font-semibold mb-2">Descripción</h3>
                  <div className="p-3 bg-gray-50 rounded text-sm">
                    {selectedBlock.description}
                  </div>
                </div>
              )}

              <div>
                <h3 className="font-semibold mb-2">Información del Sistema</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div><strong>Creado por:</strong> {selectedBlock.adminUser.firstName} {selectedBlock.adminUser.lastName}</div>
                  <div><strong>Fecha de creación:</strong> {new Date(selectedBlock.createdAt).toLocaleString()}</div>
                  <div><strong>Última actualización:</strong> {new Date(selectedBlock.updatedAt).toLocaleString()}</div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}






