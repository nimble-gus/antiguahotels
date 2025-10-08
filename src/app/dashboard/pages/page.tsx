'use client'

import { useState, useEffect } from 'react'
import { 
  FileText, 
  Edit, 
  Save, 
  Eye, 
  Plus, 
  Search, 
  Filter,
  Globe,
  Settings,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

interface PageContent {
  id: string
  pageKey: string
  pageTitle: string
  pageDescription?: string
  content: any
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function PagesManagementPage() {
  const [pages, setPages] = useState<PageContent[]>([])
  const [loading, setLoading] = useState(true)
  const [editingPage, setEditingPage] = useState<PageContent | null>(null)
  const [showEditor, setShowEditor] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchPages()
  }, [])

  const fetchPages = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/pages')
      
      if (response.ok) {
        const data = await response.json()
        setPages(data.pages)
      } else {
        console.error('Error fetching pages')
      }
    } catch (error) {
      console.error('Error fetching pages:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (page: PageContent) => {
    setEditingPage(page)
    setShowEditor(true)
  }

  const handleSave = async () => {
    if (!editingPage) return

    try {
      setSaving(true)
      const response = await fetch('/api/pages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingPage.id,
          pageKey: editingPage.pageKey,
          pageTitle: editingPage.pageTitle,
          pageDescription: editingPage.pageDescription,
          content: editingPage.content,
          isActive: editingPage.isActive
        })
      })

      if (response.ok) {
        await fetchPages()
        setShowEditor(false)
        setEditingPage(null)
        alert('Página actualizada exitosamente')
      } else {
        alert('Error actualizando página')
      }
    } catch (error) {
      console.error('Error saving page:', error)
      alert('Error guardando página')
    } finally {
      setSaving(false)
    }
  }

  const handleContentChange = (key: string, value: any) => {
    if (!editingPage) return
    
    setEditingPage({
      ...editingPage,
      content: {
        ...editingPage.content,
        [key]: value
      }
    })
  }

  const getPageIcon = (pageKey: string) => {
    switch (pageKey) {
      case 'about_us':
        return <Globe className="h-5 w-5" />
      case 'faq':
        return <AlertCircle className="h-5 w-5" />
      case 'terms':
        return <FileText className="h-5 w-5" />
      case 'privacy':
        return <Settings className="h-5 w-5" />
      default:
        return <FileText className="h-5 w-5" />
    }
  }

  const getPageTitle = (pageKey: string) => {
    switch (pageKey) {
      case 'about_us':
        return 'Acerca de Nosotros'
      case 'faq':
        return 'Preguntas Frecuentes'
      case 'terms':
        return 'Términos y Condiciones'
      case 'privacy':
        return 'Política de Privacidad'
      default:
        return pageKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    }
  }

  const getPageUrl = (pageKey: string) => {
    switch (pageKey) {
      case 'about_us':
        return '/about'
      case 'faq':
        return '/faq'
      case 'terms':
        return '/terms'
      case 'privacy':
        return '/privacy'
      default:
        return `/${pageKey.replace('_', '-')}`
    }
  }

  const filteredPages = pages.filter(page =>
    page.pageTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.pageKey.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-antigua-purple mr-3"></div>
        <span>Cargando páginas...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Páginas</h1>
          <p className="text-gray-600">Gestiona el contenido de las páginas estáticas del sitio</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchPages}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Actualizar
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar páginas..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-antigua-purple focus:border-transparent"
          />
        </div>
      </div>

      {/* Pages List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPages.map((page) => (
          <div key={page.id} className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                {getPageIcon(page.pageKey)}
                <h3 className="text-lg font-semibold text-gray-900">
                  {getPageTitle(page.pageKey)}
                </h3>
              </div>
              <div className="flex items-center space-x-2">
                {page.isActive ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
                <span className={`text-xs px-2 py-1 rounded-full ${
                  page.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {page.isActive ? 'Activa' : 'Inactiva'}
                </span>
              </div>
            </div>

            <p className="text-gray-600 text-sm mb-4">
              {page.pageDescription || 'Sin descripción'}
            </p>

            <div className="text-xs text-gray-500 mb-4">
              <div>Última actualización: {new Date(page.updatedAt).toLocaleDateString('es-ES')}</div>
              <div>Clave: {page.pageKey}</div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => handleEdit(page)}
                className="flex-1 bg-antigua-purple text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors flex items-center justify-center"
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </button>
              <a
                href={getPageUrl(page.pageKey)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center"
              >
                <Eye className="h-4 w-4 mr-2" />
                Ver
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Editor Modal */}
      {showEditor && editingPage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Editando: {getPageTitle(editingPage.pageKey)}
                </h3>
                <button
                  onClick={() => setShowEditor(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <AlertCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Título de la Página
                    </label>
                    <input
                      type="text"
                      value={editingPage.pageTitle}
                      onChange={(e) => setEditingPage({
                        ...editingPage,
                        pageTitle: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-antigua-purple focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estado
                    </label>
                    <select
                      value={editingPage.isActive ? 'active' : 'inactive'}
                      onChange={(e) => setEditingPage({
                        ...editingPage,
                        isActive: e.target.value === 'active'
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-antigua-purple focus:border-transparent"
                    >
                      <option value="active">Activa</option>
                      <option value="inactive">Inactiva</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={editingPage.pageDescription || ''}
                    onChange={(e) => setEditingPage({
                      ...editingPage,
                      pageDescription: e.target.value
                    })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-antigua-purple focus:border-transparent"
                  />
                </div>

                {/* Content Fields */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900">Contenido de la Página</h4>
                  
                  {Object.entries(editingPage.content).map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </label>
                      {typeof value === 'string' && value.length > 100 ? (
                        <textarea
                          value={value}
                          onChange={(e) => handleContentChange(key, e.target.value)}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-antigua-purple focus:border-transparent"
                        />
                      ) : (
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => handleContentChange(key, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-antigua-purple focus:border-transparent"
                        />
                      )}
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-6 border-t">
                  <button
                    onClick={() => setShowEditor(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 text-sm font-medium text-white bg-antigua-purple rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center"
                  >
                    {saving ? (
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
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
