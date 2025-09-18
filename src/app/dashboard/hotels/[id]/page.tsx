'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ImageManager } from '@/components/image-manager'
import { RoomForm } from '@/components/forms/room-form'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Bed, 
  Users,
  DollarSign,
  ArrowLeft,
  Building,
  Hash,
  MapPin,
  Star,
  Image as ImageIcon,
  AlertCircle
} from 'lucide-react'

interface Hotel {
  id: string
  name: string
  code?: string
  city?: string
  address?: string
  totalRooms: number
}

interface RoomType {
  id: string
  name: string
  description?: string
  occupancy: number
  maxAdults: number
  maxChildren: number
  bedConfiguration?: string
  roomSizeSqm?: number
  baseRate: string
  currency: string
  isActive: boolean
  _count: {
    rooms: number
  }
}

interface Room {
  id: string
  code: string
  floorNumber?: number
  isActive: boolean
  roomType: {
    name: string
    baseRate: string
    occupancy: number
    bedConfiguration?: string
  }
}

export default function HotelDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const hotelId = params.id as string

  const [hotel, setHotel] = useState<Hotel | null>(null)
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'room-types' | 'rooms' | 'images'>('room-types')
  const [showRoomTypeForm, setShowRoomTypeForm] = useState(false)
  const [showRoomForm, setShowRoomForm] = useState(false)
  const [editingRoomType, setEditingRoomType] = useState<RoomType | null>(null)
  const [editingRoom, setEditingRoom] = useState<Room | null>(null)
  const [selectedRoomType, setSelectedRoomType] = useState<RoomType | null>(null)

  useEffect(() => {
    fetchHotelData()
  }, [hotelId])

  const fetchHotelData = async () => {
    try {
      const [hotelResponse, roomTypesResponse, roomsResponse] = await Promise.all([
        fetch(`/api/hotels?id=${hotelId}`),
        fetch(`/api/hotels/${hotelId}/room-types`),
        fetch(`/api/hotels/${hotelId}/rooms`)
      ])

      if (hotelResponse.ok) {
        const hotelData = await hotelResponse.json()
        setHotel(hotelData.hotels[0] || null)
      }

      if (roomTypesResponse.ok) {
        const roomTypesData = await roomTypesResponse.json()
        console.log('🏠 Room types API response:', roomTypesData)
        console.log('🏠 Room types array:', roomTypesData.roomTypes)
        setRoomTypes(roomTypesData.roomTypes || [])
      } else {
        console.error('❌ Room types API error:', roomTypesResponse.status)
        setRoomTypes([])
      }

      if (roomsResponse.ok) {
        const roomsData = await roomsResponse.json()
        setRooms(roomsData)
      }

    } catch (error) {
      console.error('Error fetching hotel data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditRoom = (room: Room) => {
    setEditingRoom(room)
    setShowRoomForm(true)
  }

  const handleDeleteRoom = async (room: Room) => {
    if (!confirm(`¿Estás seguro de eliminar la habitación "${room.code}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/hotels/${hotelId}/rooms?id=${room.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchHotelData()
      } else {
        const error = await response.json()
        alert(error.error || 'Error eliminando habitación')
      }
    } catch (error) {
      console.error('Error deleting room:', error)
      alert('Error de conexión')
    }
  }

  const handleDeleteRoomType = async (roomType: RoomType) => {
    if (!confirm(`¿Estás seguro de eliminar el tipo de habitación "${roomType.name}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/hotels/${hotelId}/room-types?id=${roomType.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchHotelData()
      } else {
        const error = await response.json()
        alert(error.error || 'Error eliminando tipo de habitación')
      }
    } catch (error) {
      console.error('Error deleting room type:', error)
      alert('Error de conexión')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!hotel) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Hotel no encontrado</h2>
        <Button onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Regresar
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{hotel.name}</h1>
            <p className="text-gray-600">
              {hotel.city} • {hotel.totalRooms} habitaciones
            </p>
          </div>
        </div>
      </div>

      {/* Hotel Info Card */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Building className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-600">Código: {hotel.code || 'N/A'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-600">{hotel.address}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Bed className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-600">{roomTypes.length} tipos de habitación</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('room-types')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'room-types'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Tipos de Habitación ({roomTypes.length})
          </button>
          <button
            onClick={() => setActiveTab('rooms')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'rooms'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Habitaciones ({rooms.length})
          </button>
          <button
            onClick={() => setActiveTab('images')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'images'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Imágenes
          </button>
        </nav>
      </div>

      {/* Room Types Tab */}
      {activeTab === 'room-types' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Tipos de Habitación</h2>
            <Button onClick={() => setShowRoomTypeForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Tipo
            </Button>
          </div>

          <div className="grid gap-4">
            {roomTypes && Array.isArray(roomTypes) ? roomTypes.map((roomType) => (
              <Card key={roomType.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{roomType.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          roomType.isActive 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {roomType.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                      
                      {roomType.description && (
                        <p className="text-gray-600 mb-3">{roomType.description}</p>
                      )}
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-green-500" />
                          <span>${roomType.baseRate}/{roomType.currency}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-blue-500" />
                          <span>{roomType.occupancy} huéspedes</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Bed className="h-4 w-4 text-purple-500" />
                          <span>{roomType.bedConfiguration || 'N/A'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Hash className="h-4 w-4 text-gray-500" />
                          <span>{roomType._count.rooms} habitaciones</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          // Abrir gestión de imágenes para este tipo de habitación
                          window.open(`/dashboard/room-types/${roomType.id}/images`, '_blank')
                        }}
                        title="Gestionar imágenes de este tipo de habitación"
                      >
                        <ImageIcon className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          console.log('🏠 Edit room type clicked:', roomType)
                          setEditingRoomType(roomType)
                          setShowRoomTypeForm(true)
                          console.log('✅ Room type form should open')
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteRoomType(roomType)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Error cargando tipos de habitación</h3>
                  <p className="text-gray-500 mb-4">
                    Hubo un problema al cargar los tipos de habitación.
                  </p>
                  <Button onClick={fetchHotelData}>
                    Reintentar
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {roomTypes && roomTypes.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center">
                <Bed className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay tipos de habitación</h3>
                <p className="text-gray-500 mb-4">
                  Comienza creando los tipos de habitación para este hotel.
                </p>
                <Button onClick={() => setShowRoomTypeForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primer Tipo
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Rooms Tab */}
      {activeTab === 'rooms' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Habitaciones</h2>
            {roomTypes.length > 0 ? (
              <Button onClick={() => setShowRoomForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Habitación
              </Button>
            ) : (
              <p className="text-sm text-gray-500">
                Primero crea tipos de habitación
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map((room) => (
              <Card key={room.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Habitación {room.code}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      room.isActive 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {room.isActive ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><strong>Tipo:</strong> {room.roomType.name}</p>
                    <p><strong>Precio:</strong> ${room.roomType.baseRate}/noche</p>
                    <p><strong>Capacidad:</strong> {room.roomType.occupancy} huéspedes</p>
                    {room.floorNumber && (
                      <p><strong>Piso:</strong> {room.floorNumber}</p>
                    )}
                    {room.roomType.bedConfiguration && (
                      <p><strong>Camas:</strong> {room.roomType.bedConfiguration}</p>
                    )}
                  </div>
                  
                  <div className="flex space-x-2 mt-4">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleEditRoom(room)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        // Abrir gestión de imágenes para esta habitación específica
                        window.open(`/dashboard/rooms/${room.id}/images`, '_blank')
                      }}
                      title="Gestionar imágenes de esta habitación"
                    >
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-600"
                      onClick={() => handleDeleteRoom(room)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {rooms.length === 0 && roomTypes.length > 0 && (
            <Card>
              <CardContent className="p-6 text-center">
                <Bed className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay habitaciones</h3>
                <p className="text-gray-500 mb-4">
                  Comienza agregando habitaciones para este hotel.
                </p>
                <Button onClick={() => setShowRoomForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primera Habitación
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Room Type Form Modal */}
      {showRoomTypeForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>
                {editingRoomType ? 'Editar Tipo de Habitación' : 'Crear Nuevo Tipo de Habitación'}
              </CardTitle>
              <CardDescription>
                Define las características de este tipo de habitación
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RoomTypeForm 
                hotelId={hotelId}
                roomType={editingRoomType}
                onClose={() => {
                  setShowRoomTypeForm(false)
                  setEditingRoomType(null)
                }}
                onSave={() => {
                  fetchHotelData()
                  setShowRoomTypeForm(false)
                  setEditingRoomType(null)
                }}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Room Form Modal */}
      {showRoomForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>
                {editingRoom ? 'Editar Habitación' : 'Crear Nueva Habitación'}
              </CardTitle>
              <CardDescription>
                {editingRoom ? 'Modifica los datos de la habitación' : 'Asigna una habitación específica a un tipo'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RoomForm 
                hotelId={hotelId}
                roomTypes={roomTypes}
                room={editingRoom}
                onClose={() => {
                  setShowRoomForm(false)
                  setEditingRoom(null)
                }}
                onSave={() => {
                  fetchHotelData()
                  setShowRoomForm(false)
                  setEditingRoom(null)
                }}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

// Componente para formulario de tipo de habitación
function RoomTypeForm({ 
  hotelId, 
  roomType, 
  onClose, 
  onSave 
}: { 
  hotelId: string
  roomType?: RoomType | null
  onClose: () => void
  onSave: () => void 
}) {
  const [formData, setFormData] = useState({
    name: roomType?.name || '',
    description: roomType?.description || '',
    occupancy: roomType?.occupancy || 2,
    maxAdults: roomType?.maxAdults || 2,
    maxChildren: roomType?.maxChildren || 0,
    bedConfiguration: roomType?.bedConfiguration || '',
    roomSizeSqm: roomType?.roomSizeSqm || '',
    baseRate: roomType?.baseRate || '',
    currency: roomType?.currency || 'USD',
    isActive: roomType?.isActive ?? true,
  })

  const [loading, setLoading] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = roomType 
        ? `/api/hotels/${hotelId}/room-types?id=${roomType.id}`
        : `/api/hotels/${hotelId}/room-types`
      
      const method = roomType ? 'PUT' : 'POST'

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
        alert(error.error || 'Error procesando solicitud')
      }
    } catch (error) {
      console.error('Error saving room type:', error)
      alert('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre del Tipo *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Standard Double"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Precio Base *
          </label>
          <div className="flex">
            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
              $
            </span>
            <input
              type="number"
              step="0.01"
              name="baseRate"
              value={formData.baseRate}
              onChange={handleInputChange}
              required
              className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="85.00"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ocupación Máxima *
          </label>
          <input
            type="number"
            name="occupancy"
            value={formData.occupancy}
            onChange={handleInputChange}
            required
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Adultos Máximos *
          </label>
          <input
            type="number"
            name="maxAdults"
            value={formData.maxAdults}
            onChange={handleInputChange}
            required
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Niños Máximos
          </label>
          <input
            type="number"
            name="maxChildren"
            value={formData.maxChildren}
            onChange={handleInputChange}
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tamaño (m²)
          </label>
          <input
            type="number"
            name="roomSizeSqm"
            value={formData.roomSizeSqm}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="25"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Configuración de Camas
        </label>
        <input
          type="text"
          name="bedConfiguration"
          value={formData.bedConfiguration}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="1 Double Bed"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Descripción
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Describe las características de este tipo de habitación..."
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          name="isActive"
          checked={formData.isActive}
          onChange={handleInputChange}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label className="ml-2 block text-sm text-gray-900">
          Tipo de habitación activo
        </label>
      </div>

      <div className="flex space-x-2 pt-4">
        <Button
          type="submit"
          disabled={loading}
          className="flex items-center"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          ) : (
            <Plus className="h-4 w-4 mr-2" />
          )}
          {roomType ? 'Actualizar' : 'Crear Tipo'}
        </Button>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}

