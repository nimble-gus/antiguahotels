'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Edit, Trash2, User, Eye, EyeOff, Save, X } from 'lucide-react'

interface AdminUser {
  id: string
  username: string
  email: string
  firstName: string
  lastName: string
  role: 'ADMIN' | 'SUPER_ADMIN'
  isActive: boolean
  createdAt: string
  lastLogin?: string
}

interface UserFormData {
  username: string
  email: string
  firstName: string
  lastName: string
  role: 'ADMIN' | 'SUPER_ADMIN'
  password: string
  isActive: boolean
}

export default function AdminUsersPage() {
  const { data: session } = useSession()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    role: 'ADMIN',
    password: '',
    isActive: true
  })

  useEffect(() => {
    fetchAdminUsers()
  }, [])

  const fetchAdminUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      } else {
        setMessage({ type: 'error', text: 'Error cargando usuarios' })
      }
    } catch (error) {
      console.error('Error fetching admin users:', error)
      setMessage({ type: 'error', text: 'Error de conexión' })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      firstName: '',
      lastName: '',
      role: 'ADMIN',
      password: '',
      isActive: true
    })
    setShowCreateForm(false)
    setEditingUser(null)
    setShowPassword(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)

    try {
      const url = '/api/admin/users'
      const method = editingUser ? 'PUT' : 'POST'
      const body = editingUser 
        ? { ...formData, id: editingUser.id }
        : formData

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: editingUser ? 'Usuario actualizado exitosamente' : 'Usuario creado exitosamente' 
        })
        await fetchAdminUsers()
        resetForm()
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: error.error || 'Error procesando solicitud' })
      }
    } catch (error) {
      console.error('Error saving user:', error)
      setMessage({ type: 'error', text: 'Error de conexión' })
    } finally {
      setFormLoading(false)
    }
  }

  const handleEdit = (user: AdminUser) => {
    setEditingUser(user)
    setFormData({
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      password: '', // No mostrar contraseña actual
      isActive: user.isActive
    })
    setShowCreateForm(true)
  }

  const handleDelete = async (user: AdminUser) => {
    if (!confirm(`¿Estás seguro de eliminar a ${user.firstName} ${user.lastName}?`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/users?id=${user.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Usuario eliminado exitosamente' })
        await fetchAdminUsers()
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: error.error || 'Error eliminando usuario' })
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      setMessage({ type: 'error', text: 'Error de conexión' })
    }
  }

  // Solo SUPER_ADMIN puede acceder
  if (session?.user?.role !== 'SUPER_ADMIN') {
    return (
      <div className="flex items-center justify-center h-64">
        <Card>
          <CardContent className="p-6">
            <p className="text-gray-600">No tienes permisos para acceder a esta página.</p>
          </CardContent>
        </Card>
      </div>
    )
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
          <h1 className="text-3xl font-bold text-gray-900">Usuarios Administradores</h1>
          <p className="text-gray-600">Gestiona los usuarios con acceso al dashboard</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Usuario
        </Button>
      </div>

      {/* Mensajes */}
      {message && (
        <div className={`p-4 rounded-md ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message.text}
          <button 
            onClick={() => setMessage(null)}
            className="ml-4 text-sm underline"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Formulario de crear/editar usuario */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingUser ? 'Editar Usuario Administrador' : 'Crear Nuevo Usuario Administrador'}
            </CardTitle>
            <CardDescription>
              {editingUser ? 'Modifica los datos del usuario' : 'Completa todos los campos para crear un nuevo usuario'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="usuario123"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="usuario@antiguahotels.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Juan"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Apellido
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Pérez"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rol
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="ADMIN">Administrador</option>
                    <option value="SUPER_ADMIN">Super Administrador</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {editingUser ? 'Nueva Contraseña (opcional)' : 'Contraseña'}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required={!editingUser}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={editingUser ? "Dejar vacío para mantener actual" : "••••••••"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
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
                  Usuario activo
                </label>
              </div>

              <div className="flex space-x-2 pt-4">
                <Button
                  type="submit"
                  disabled={formLoading}
                  className="flex items-center"
                >
                  {formLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {editingUser ? 'Actualizar' : 'Crear Usuario'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista de usuarios */}
      <div className="grid gap-4">
        {users.map((user) => (
          <Card key={user.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {user.firstName} {user.lastName}
                    </h3>
                    <p className="text-sm text-gray-600">@{user.username}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    {user.lastLogin && (
                      <p className="text-xs text-gray-400">
                        Último acceso: {new Date(user.lastLogin).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.role === 'SUPER_ADMIN' 
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {user.isActive ? (
                        <span className="text-green-600">● Activo</span>
                      ) : (
                        <span className="text-red-600">● Inactivo</span>
                      )}
                    </p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEdit(user)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {user.id !== session?.user?.id && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(user)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {users.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">No hay usuarios administradores registrados.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
