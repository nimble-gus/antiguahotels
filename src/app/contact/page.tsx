'use client'

import PublicLayout from '@/components/layout/public-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send,
  MessageCircle,
  Globe,
  Facebook,
  Instagram,
  Twitter,
  Linkedin
} from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useState } from 'react'

interface ContactForm {
  name: string
  email: string
  phone: string
  subject: string
  message: string
  service: string
}

const services = [
  { value: '', label: 'Seleccionar servicio' },
  { value: 'hotels', label: 'Reservas de Hoteles' },
  { value: 'activities', label: 'Actividades y Tours' },
  { value: 'packages', label: 'Paquetes de Viaje' },
  { value: 'shuttle', label: 'Servicio de Shuttle' },
  { value: 'general', label: 'Consulta General' },
  { value: 'support', label: 'Soporte Técnico' }
]

export default function ContactPage() {
  const { t } = useLanguage()
  const [form, setForm] = useState<ContactForm>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    service: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // Aquí iría la lógica para enviar el formulario
      // Por ahora simulamos un envío exitoso
      await new Promise(resolve => setTimeout(resolve, 2000))
      setSubmitStatus('success')
      setForm({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        service: ''
      })
    } catch (error) {
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Contáctanos
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Estamos aquí para ayudarte a planificar tu experiencia perfecta en Antigua Guatemala
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Información de contacto */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Información de Contacto
                </h2>
                
                <div className="space-y-6">
                  {/* Dirección */}
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <MapPin className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        Oficina Principal
                      </h3>
                      <p className="text-gray-600">
                        5a Avenida Norte #25<br />
                        Antigua Guatemala, Sacatepéquez<br />
                        Guatemala, Centroamérica
                      </p>
                    </div>
                  </div>

                  {/* Teléfono */}
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <Phone className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        Teléfono
                      </h3>
                      <p className="text-gray-600">
                        <a href="tel:+50212345678" className="hover:text-blue-600 transition-colors">
                          +502 1234-5678
                        </a>
                      </p>
                      <p className="text-gray-600">
                        <a href="tel:+50287654321" className="hover:text-blue-600 transition-colors">
                          +502 8765-4321
                        </a>
                      </p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <Mail className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        Email
                      </h3>
                      <p className="text-gray-600">
                        <a href="mailto:info@antiguahotelstours.com" className="hover:text-blue-600 transition-colors">
                          info@antiguahotelstours.com
                        </a>
                      </p>
                      <p className="text-gray-600">
                        <a href="mailto:reservas@antiguahotelstours.com" className="hover:text-blue-600 transition-colors">
                          reservas@antiguahotelstours.com
                        </a>
                      </p>
                    </div>
                  </div>

                  {/* Horarios */}
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <Clock className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        Horarios de Atención
                      </h3>
                      <div className="text-gray-600 space-y-1">
                        <p>Lunes - Viernes: 8:00 AM - 6:00 PM</p>
                        <p>Sábados: 9:00 AM - 4:00 PM</p>
                        <p>Domingos: 10:00 AM - 2:00 PM</p>
                        <p className="text-sm text-gray-500 mt-2">
                          *Horario de Guatemala (GMT-6)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Redes sociales */}
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <Globe className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Síguenos
                      </h3>
                      <div className="flex space-x-4">
                        <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors">
                          <Facebook className="h-6 w-6" />
                        </a>
                        <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors">
                          <Instagram className="h-6 w-6" />
                        </a>
                        <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors">
                          <Twitter className="h-6 w-6" />
                        </a>
                        <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors">
                          <Linkedin className="h-6 w-6" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mapa */}
              <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <MapPin className="h-12 w-12 mx-auto mb-2" />
                  <p>Mapa interactivo</p>
                  <p className="text-sm">Antigua Guatemala, Sacatepéquez</p>
                </div>
              </div>
            </div>

            {/* Formulario de contacto */}
            <div>
              <div className="bg-white rounded-lg shadow-sm p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Envíanos un Mensaje
                </h2>
                
                {submitStatus === 'success' && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center">
                      <MessageCircle className="h-5 w-5 text-green-600 mr-2" />
                      <p className="text-green-800 font-medium">
                        ¡Mensaje enviado exitosamente! Te contactaremos pronto.
                      </p>
                    </div>
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center">
                      <MessageCircle className="h-5 w-5 text-red-600 mr-2" />
                      <p className="text-red-800 font-medium">
                        Error al enviar el mensaje. Por favor, inténtalo de nuevo.
                      </p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre completo *
                      </label>
                      <Input
                        type="text"
                        id="name"
                        name="name"
                        value={form.name}
                        onChange={handleInputChange}
                        required
                        className="w-full"
                        placeholder="Tu nombre completo"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <Input
                        type="email"
                        id="email"
                        name="email"
                        value={form.email}
                        onChange={handleInputChange}
                        required
                        className="w-full"
                        placeholder="tu@email.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                        Teléfono
                      </label>
                      <Input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={form.phone}
                        onChange={handleInputChange}
                        className="w-full"
                        placeholder="+502 1234-5678"
                      />
                    </div>

                    <div>
                      <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-2">
                        Servicio de interés
                      </label>
                      <select
                        id="service"
                        name="service"
                        value={form.service}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {services.map(service => (
                          <option key={service.value} value={service.value}>
                            {service.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      Asunto *
                    </label>
                    <Input
                      type="text"
                      id="subject"
                      name="subject"
                      value={form.subject}
                      onChange={handleInputChange}
                      required
                      className="w-full"
                      placeholder="¿En qué podemos ayudarte?"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Mensaje *
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      value={form.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className="w-full"
                      placeholder="Cuéntanos más detalles sobre tu consulta..."
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full"
                    size="lg"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5 mr-2" />
                        Enviar Mensaje
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </div>
          </div>

          {/* Información adicional */}
          <div className="mt-16 bg-blue-50 rounded-lg p-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                ¿Necesitas ayuda inmediata?
              </h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Nuestro equipo de atención al cliente está disponible para ayudarte con cualquier consulta o emergencia durante tu estadía en Antigua Guatemala.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="tel:+50212345678"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Phone className="h-5 w-5 mr-2" />
                  Llamar Ahora
                </a>
                <a
                  href="mailto:info@antiguahotelstours.com"
                  className="inline-flex items-center px-6 py-3 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <Mail className="h-5 w-5 mr-2" />
                  Enviar Email
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
