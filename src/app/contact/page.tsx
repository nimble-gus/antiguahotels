'use client'

import { useState } from 'react'
import { Metadata } from 'next'
import { Phone, Mail, MapPin, Clock, Send, CheckCircle, AlertCircle } from 'lucide-react'
import PublicLayout from '@/components/layout/public-layout'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    preferredContact: 'email'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setSubmitStatus('success')
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
          preferredContact: 'email'
        })
      } else {
        setSubmitStatus('error')
      }
    } catch (error) {
      console.error('Error submitting contact form:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <PublicLayout>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-antigua-purple to-purple-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Contáctanos
            </h1>
            <p className="text-xl md:text-2xl text-purple-100 leading-relaxed">
              Estamos aquí para ayudarte a planificar tu aventura en Guatemala
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Información de Contacto</h2>
                <p className="text-gray-700 text-lg leading-relaxed">
                  ¿Tienes preguntas sobre nuestros tours, necesitas ayuda con una reservación, 
                  o quieres personalizar tu experiencia? Nuestro equipo está listo para ayudarte.
                </p>
              </div>

              {/* Contact Details */}
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-antigua-purple/10 p-3 rounded-lg">
                    <Phone className="h-6 w-6 text-antigua-purple" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Teléfono</h3>
                    <p className="text-gray-700">+502 1234-5678</p>
                    <p className="text-sm text-gray-500">Lunes - Viernes 8:00 - 18:00</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-antigua-purple/10 p-3 rounded-lg">
                    <Mail className="h-6 w-6 text-antigua-purple" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Email</h3>
                    <p className="text-gray-700">info@antiguahotelstours.com</p>
                    <p className="text-sm text-gray-500">Respuesta dentro de 24 horas</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-antigua-purple/10 p-3 rounded-lg">
                    <MapPin className="h-6 w-6 text-antigua-purple" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Ubicación</h3>
                    <p className="text-gray-700">Antigua Guatemala</p>
                    <p className="text-sm text-gray-500">Sacatepéquez, Guatemala</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-antigua-purple/10 p-3 rounded-lg">
                    <Clock className="h-6 w-6 text-antigua-purple" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Horarios</h3>
                    <p className="text-gray-700">Lunes - Viernes: 8:00 - 18:00</p>
                    <p className="text-gray-700">Sábados: 9:00 - 15:00</p>
                    <p className="text-sm text-gray-500">Domingos: Cerrado</p>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Enlaces Rápidos</h3>
                <div className="space-y-2">
                  <a href="/packages" className="block text-antigua-purple hover:text-purple-700 transition-colors">
                    Ver Paquetes Disponibles
                  </a>
                  <a href="/activities" className="block text-antigua-purple hover:text-purple-700 transition-colors">
                    Explorar Actividades
                  </a>
                  <a href="/faq" className="block text-antigua-purple hover:text-purple-700 transition-colors">
                    Preguntas Frecuentes
                  </a>
                  <a href="/about" className="block text-antigua-purple hover:text-purple-700 transition-colors">
                    Acerca de Nosotros
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Envíanos un Mensaje</h2>
              
              {submitStatus === 'success' && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <p className="text-green-700">¡Mensaje enviado exitosamente! Te contactaremos pronto.</p>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <p className="text-red-700">Error al enviar el mensaje. Por favor, inténtalo de nuevo.</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-antigua-purple focus:border-transparent"
                      placeholder="Tu nombre completo"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-antigua-purple focus:border-transparent"
                      placeholder="tu@email.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-antigua-purple focus:border-transparent"
                      placeholder="+502 1234-5678"
                    />
                  </div>

                  <div>
                    <label htmlFor="preferredContact" className="block text-sm font-medium text-gray-700 mb-2">
                      Preferencia de Contacto
                    </label>
                    <select
                      id="preferredContact"
                      name="preferredContact"
                      value={formData.preferredContact}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-antigua-purple focus:border-transparent"
                    >
                      <option value="email">Email</option>
                      <option value="phone">Teléfono</option>
                      <option value="whatsapp">WhatsApp</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Asunto *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-antigua-purple focus:border-transparent"
                  >
                    <option value="">Selecciona un asunto</option>
                    <option value="reservation">Consulta sobre Reservación</option>
                    <option value="package">Información sobre Paquetes</option>
                    <option value="custom">Tour Personalizado</option>
                    <option value="group">Grupo o Evento</option>
                    <option value="support">Soporte Técnico</option>
                    <option value="other">Otro</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Mensaje *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-antigua-purple focus:border-transparent"
                    placeholder="Cuéntanos sobre tu consulta, fechas de viaje, número de personas, o cualquier información específica que necesites..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-antigua-purple text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      <span>Enviar Mensaje</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}