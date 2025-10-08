'use client'

import { Shield, Lock, Eye, Database, Mail } from 'lucide-react'
import PublicLayout from '@/components/layout/public-layout'

export default function PrivacyPage() {
  return (
    <PublicLayout>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-antigua-purple to-purple-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Política de Privacidad
            </h1>
            <p className="text-xl md:text-2xl text-purple-100 leading-relaxed">
              Tu privacidad es importante para nosotros
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          
          {/* Last Updated */}
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <Shield className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  <strong>Última actualización:</strong> {new Date().toLocaleDateString('es-ES')}
                </p>
              </div>
            </div>
          </div>

          {/* Privacy Content */}
          <div className="bg-white rounded-lg shadow-lg p-8 space-y-8">
            
            {/* 1. Introducción */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Shield className="h-6 w-6 text-antigua-purple mr-3" />
                1. Introducción
              </h2>
              <div className="text-gray-700 space-y-4">
                <p>
                  En Antigua Hotels Tours, valoramos y respetamos su privacidad. Esta Política de 
                  Privacidad explica cómo recopilamos, utilizamos, almacenamos y protegemos su 
                  información personal cuando utiliza nuestros servicios.
                </p>
                <p>
                  Al utilizar nuestro sitio web, servicios o proporcionar información personal, 
                  usted acepta las prácticas descritas en esta política de privacidad.
                </p>
              </div>
            </section>

            {/* 2. Información que Recopilamos */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Database className="h-6 w-6 text-antigua-purple mr-3" />
                2. Información que Recopilamos
              </h2>
              <div className="text-gray-700 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">2.1 Información Personal</h3>
                <p>Recopilamos la siguiente información personal cuando usted:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Hace una reservación: nombre, dirección de email, número de teléfono, fecha de nacimiento</li>
                  <li>Se registra en nuestro sitio: nombre de usuario, contraseña, información de perfil</li>
                  <li>Se comunica con nosotros: contenido de mensajes, información de contacto</li>
                  <li>Participa en encuestas o promociones: respuestas y preferencias</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-900">2.2 Información de Viaje</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Itinerarios de viaje y preferencias</li>
                  <li>Información de pasaportes y documentos de identidad</li>
                  <li>Restricciones alimentarias y médicas</li>
                  <li>Información de emergencia de contacto</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-900">2.3 Información Técnica</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Dirección IP y ubicación geográfica</li>
                  <li>Tipo de navegador y dispositivo</li>
                  <li>Páginas visitadas y tiempo de permanencia</li>
                  <li>Cookies y tecnologías similares</li>
                </ul>
              </div>
            </section>

            {/* 3. Cómo Utilizamos su Información */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Eye className="h-6 w-6 text-antigua-purple mr-3" />
                3. Cómo Utilizamos su Información
              </h2>
              <div className="text-gray-700 space-y-4">
                <p>Utilizamos su información personal para:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Procesar y confirmar sus reservaciones</li>
                  <li>Proporcionar servicios de atención al cliente</li>
                  <li>Enviar confirmaciones, actualizaciones y recordatorios</li>
                  <li>Personalizar su experiencia y recomendaciones</li>
                  <li>Procesar pagos y prevenir fraudes</li>
                  <li>Cumplir con obligaciones legales y regulatorias</li>
                  <li>Mejorar nuestros servicios y desarrollar nuevos productos</li>
                  <li>Enviar comunicaciones de marketing (con su consentimiento)</li>
                </ul>
              </div>
            </section>

            {/* 4. Compartir Información */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Lock className="h-6 w-6 text-antigua-purple mr-3" />
                4. Compartir su Información
              </h2>
              <div className="text-gray-700 space-y-4">
                <p>No vendemos, alquilamos ni compartimos su información personal, excepto en las siguientes circunstancias:</p>
                
                <h3 className="text-lg font-semibold text-gray-900">4.1 Proveedores de Servicios</h3>
                <p>Compartimos información con terceros que nos ayudan a operar nuestro negocio:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Procesadores de pagos</li>
                  <li>Proveedores de servicios de email</li>
                  <li>Servicios de hosting y almacenamiento</li>
                  <li>Proveedores de servicios de análisis</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-900">4.2 Socios de Viaje</h3>
                <p>Compartimos información necesaria con:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Hoteles y alojamientos</li>
                  <li>Guías turísticos y operadores</li>
                  <li>Proveedores de transporte</li>
                  <li>Restaurantes y proveedores de actividades</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-900">4.3 Requisitos Legales</h3>
                <p>Podemos divulgar información cuando sea requerido por ley o para:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Cumplir con procesos legales</li>
                  <li>Proteger nuestros derechos y propiedad</li>
                  <li>Proteger la seguridad de nuestros usuarios</li>
                  <li>Prevenir fraudes o actividades ilegales</li>
                </ul>
              </div>
            </section>

            {/* 5. Seguridad de Datos */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Lock className="h-6 w-6 text-antigua-purple mr-3" />
                5. Seguridad de sus Datos
              </h2>
              <div className="text-gray-700 space-y-4">
                <p>Implementamos medidas de seguridad técnicas y organizacionales para proteger su información:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Encriptación SSL/TLS para transmisión de datos</li>
                  <li>Almacenamiento seguro en servidores protegidos</li>
                  <li>Acceso restringido a información personal</li>
                  <li>Monitoreo regular de sistemas de seguridad</li>
                  <li>Capacitación del personal en protección de datos</li>
                  <li>Copias de seguridad regulares y seguras</li>
                </ul>
                <p>
                  Aunque implementamos medidas de seguridad robustas, ningún método de transmisión 
                  o almacenamiento es 100% seguro. No podemos garantizar la seguridad absoluta 
                  de su información.
                </p>
              </div>
            </section>

            {/* 6. Cookies y Tecnologías Similares */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Database className="h-6 w-6 text-antigua-purple mr-3" />
                6. Cookies y Tecnologías Similares
              </h2>
              <div className="text-gray-700 space-y-4">
                <p>Utilizamos cookies y tecnologías similares para:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Recordar sus preferencias y configuraciones</li>
                  <li>Mejorar la funcionalidad del sitio web</li>
                  <li>Analizar el tráfico y uso del sitio</li>
                  <li>Personalizar contenido y anuncios</li>
                  <li>Proporcionar funciones de redes sociales</li>
                </ul>
                <p>
                  Puede controlar el uso de cookies a través de la configuración de su navegador. 
                  Sin embargo, deshabilitar ciertas cookies puede afectar la funcionalidad del sitio.
                </p>
              </div>
            </section>

            {/* 7. Sus Derechos */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Shield className="h-6 w-6 text-antigua-purple mr-3" />
                7. Sus Derechos
              </h2>
              <div className="text-gray-700 space-y-4">
                <p>Usted tiene los siguientes derechos respecto a su información personal:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Acceso:</strong> Solicitar una copia de su información personal</li>
                  <li><strong>Rectificación:</strong> Corregir información inexacta o incompleta</li>
                  <li><strong>Eliminación:</strong> Solicitar la eliminación de su información personal</li>
                  <li><strong>Limitación:</strong> Restringir el procesamiento de su información</li>
                  <li><strong>Portabilidad:</strong> Recibir su información en un formato estructurado</li>
                  <li><strong>Oposición:</strong> Oponerse al procesamiento de su información</li>
                  <li><strong>Retiro de consentimiento:</strong> Retirar su consentimiento en cualquier momento</li>
                </ul>
                <p>
                  Para ejercer estos derechos, contáctenos utilizando la información proporcionada 
                  al final de esta política.
                </p>
              </div>
            </section>

            {/* 8. Retención de Datos */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Database className="h-6 w-6 text-antigua-purple mr-3" />
                8. Retención de Datos
              </h2>
              <div className="text-gray-700 space-y-4">
                <p>Conservamos su información personal durante el tiempo necesario para:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Cumplir con los propósitos para los cuales fue recopilada</li>
                  <li>Satisfacer requisitos legales, contables o de reporte</li>
                  <li>Resolver disputas y hacer cumplir acuerdos</li>
                </ul>
                <p>
                  Los períodos de retención típicos son:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Información de reservaciones: 7 años</li>
                  <li>Información de marketing: hasta que retire su consentimiento</li>
                  <li>Información de cookies: según la configuración del navegador</li>
                  <li>Información de soporte: 3 años</li>
                </ul>
              </div>
            </section>

            {/* 9. Transferencias Internacionales */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Eye className="h-6 w-6 text-antigua-purple mr-3" />
                9. Transferencias Internacionales
              </h2>
              <div className="text-gray-700 space-y-4">
                <p>
                  Su información personal puede ser transferida y procesada en países fuera de 
                  Guatemala. Cuando esto ocurra, nos aseguramos de que existan salvaguardas 
                  apropiadas para proteger su información.
                </p>
                <p>
                  Utilizamos cláusulas contractuales estándar y otras medidas de protección 
                  apropiadas para garantizar que su información reciba un nivel adecuado de 
                  protección.
                </p>
              </div>
            </section>

            {/* 10. Menores de Edad */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Shield className="h-6 w-6 text-antigua-purple mr-3" />
                10. Menores de Edad
              </h2>
              <div className="text-gray-700 space-y-4">
                <p>
                  Nuestros servicios no están dirigidos a menores de 18 años. No recopilamos 
                  intencionalmente información personal de menores de edad sin el consentimiento 
                  verificable de sus padres o tutores.
                </p>
                <p>
                  Si descubrimos que hemos recopilado información de un menor sin el consentimiento 
                  apropiado, tomaremos medidas para eliminar dicha información de nuestros sistemas.
                </p>
              </div>
            </section>

            {/* 11. Cambios a esta Política */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Shield className="h-6 w-6 text-antigua-purple mr-3" />
                11. Cambios a esta Política
              </h2>
              <div className="text-gray-700 space-y-4">
                <p>
                  Podemos actualizar esta Política de Privacidad ocasionalmente. Le notificaremos 
                  sobre cambios significativos mediante:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Publicación de la política actualizada en nuestro sitio web</li>
                  <li>Envío de notificación por email</li>
                  <li>Notificación prominente en nuestro sitio web</li>
                </ul>
                <p>
                  Le recomendamos revisar esta política periódicamente para mantenerse informado 
                  sobre cómo protegemos su información.
                </p>
              </div>
            </section>

            {/* Contact Information */}
            <section className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Mail className="h-6 w-6 text-antigua-purple mr-3" />
                Información de Contacto
              </h2>
              <div className="text-gray-700 space-y-2">
                <p>Si tiene preguntas sobre esta Política de Privacidad, contáctenos:</p>
                <div className="mt-4 space-y-2">
                  <p><strong>Antigua Hotels Tours</strong></p>
                  <p>Antigua Guatemala, Sacatepéquez, Guatemala</p>
                  <p>Teléfono: +502 1234-5678</p>
                  <p>Email: privacy@antiguahotelstours.com</p>
                  <p>Website: www.antiguahotelstours.com</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
