'use client'

import { Shield, FileText, AlertTriangle } from 'lucide-react'
import PublicLayout from '@/components/layout/public-layout'

export default function TermsPage() {
  return (
    <PublicLayout>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-antigua-purple to-purple-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Términos y Condiciones
            </h1>
            <p className="text-xl md:text-2xl text-purple-100 leading-relaxed">
              Información importante sobre nuestros servicios y políticas
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
                <FileText className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  <strong>Última actualización:</strong> {new Date().toLocaleDateString('es-ES')}
                </p>
              </div>
            </div>
          </div>

          {/* Terms Content */}
          <div className="bg-white rounded-lg shadow-lg p-8 space-y-8">
            
            {/* 1. Aceptación de Términos */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Shield className="h-6 w-6 text-antigua-purple mr-3" />
                1. Aceptación de los Términos
              </h2>
              <div className="text-gray-700 space-y-4">
                <p>
                  Al acceder y utilizar los servicios de Antigua Hotels Tours, usted acepta estar sujeto a estos 
                  términos y condiciones. Si no está de acuerdo con alguna parte de estos términos, no debe 
                  utilizar nuestros servicios.
                </p>
                <p>
                  Estos términos se aplican a todos los usuarios de nuestro sitio web, incluyendo visitantes, 
                  clientes, y cualquier persona que acceda o use nuestros servicios.
                </p>
              </div>
            </section>

            {/* 2. Servicios Ofrecidos */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <FileText className="h-6 w-6 text-antigua-purple mr-3" />
                2. Servicios Ofrecidos
              </h2>
              <div className="text-gray-700 space-y-4">
                <p>
                  Antigua Hotels Tours ofrece los siguientes servicios:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Tours y actividades culturales y de aventura</li>
                  <li>Reservaciones de alojamiento</li>
                  <li>Paquetes turísticos personalizados</li>
                  <li>Servicios de transporte</li>
                  <li>Asesoría turística y planificación de viajes</li>
                </ul>
                <p>
                  Nos reservamos el derecho de modificar, suspender o discontinuar cualquier servicio 
                  en cualquier momento sin previo aviso.
                </p>
              </div>
            </section>

            {/* 3. Reservaciones y Pagos */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <FileText className="h-6 w-6 text-antigua-purple mr-3" />
                3. Reservaciones y Pagos
              </h2>
              <div className="text-gray-700 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">3.1 Proceso de Reservación</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Las reservaciones pueden realizarse a través de nuestro sitio web, por teléfono, o en persona</li>
                  <li>Todas las reservaciones están sujetas a disponibilidad</li>
                  <li>Se requiere información precisa y completa para procesar las reservaciones</li>
                  <li>Las reservaciones se confirman mediante email o mensaje de texto</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-900">3.2 Políticas de Pago</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Los precios están en dólares estadounidenses (USD) a menos que se especifique lo contrario</li>
                  <li>Se requiere pago completo o depósito para confirmar la reservación</li>
                  <li>Aceptamos tarjetas de crédito, transferencias bancarias, y pagos en efectivo</li>
                  <li>Los precios pueden cambiar sin previo aviso hasta que se confirme la reservación</li>
                </ul>
              </div>
            </section>

            {/* 4. Cancelaciones y Reembolsos */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <AlertTriangle className="h-6 w-6 text-antigua-purple mr-3" />
                4. Cancelaciones y Reembolsos
              </h2>
              <div className="text-gray-700 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">4.1 Política de Cancelación</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Tours de un día:</strong> Cancelación gratuita hasta 24 horas antes</li>
                  <li><strong>Paquetes de múltiples días:</strong> Cancelación gratuita hasta 48 horas antes</li>
                  <li><strong>Cancelaciones de último momento:</strong> Se aplicará una penalidad del 50%</li>
                  <li><strong>No show:</strong> No hay reembolso disponible</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-900">4.2 Reembolsos</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Los reembolsos se procesan en un plazo de 5-10 días hábiles</li>
                  <li>Los reembolsos se realizan al método de pago original</li>
                  <li>Pueden aplicarse cargos por procesamiento de reembolso</li>
                  <li>No se reembolsan servicios ya utilizados</li>
                </ul>
              </div>
            </section>

            {/* 5. Responsabilidades del Cliente */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Shield className="h-6 w-6 text-antigua-purple mr-3" />
                5. Responsabilidades del Cliente
              </h2>
              <div className="text-gray-700 space-y-4">
                <p>El cliente se compromete a:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Proporcionar información veraz y actualizada</li>
                  <li>Cumplir con los horarios y lugares de encuentro establecidos</li>
                  <li>Seguir las instrucciones de seguridad proporcionadas por nuestros guías</li>
                  <li>Respetar las reglas y regulaciones de los sitios visitados</li>
                  <li>Informar sobre cualquier condición médica o restricción que pueda afectar la participación</li>
                  <li>Mantener un comportamiento respetuoso hacia otros participantes y el personal</li>
                </ul>
              </div>
            </section>

            {/* 6. Limitación de Responsabilidad */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <AlertTriangle className="h-6 w-6 text-antigua-purple mr-3" />
                6. Limitación de Responsabilidad
              </h2>
              <div className="text-gray-700 space-y-4">
                <p>
                  Antigua Hotels Tours no será responsable por:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Retrasos o cancelaciones debido a condiciones climáticas adversas</li>
                  <li>Pérdida o daño de equipaje personal</li>
                  <li>Lesiones o accidentes que resulten de la negligencia del cliente</li>
                  <li>Cambios en itinerarios debido a circunstancias fuera de nuestro control</li>
                  <li>Gastos adicionales incurridos por el cliente fuera de los servicios incluidos</li>
                </ul>
                <p>
                  Nuestra responsabilidad máxima se limita al monto pagado por el servicio específico.
                </p>
              </div>
            </section>

            {/* 7. Seguridad y Seguros */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Shield className="h-6 w-6 text-antigua-purple mr-3" />
                7. Seguridad y Seguros
              </h2>
              <div className="text-gray-700 space-y-4">
                <p>
                  Recomendamos encarecidamente que todos los clientes contraten un seguro de viaje 
                  que cubra:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Gastos médicos y evacuación de emergencia</li>
                  <li>Cancelación de viaje</li>
                  <li>Pérdida o daño de equipaje</li>
                  <li>Actividades de aventura (si aplica)</li>
                </ul>
                <p>
                  Antigua Hotels Tours mantiene seguros de responsabilidad civil, pero no cubre 
                  gastos médicos personales de los clientes.
                </p>
              </div>
            </section>

            {/* 8. Privacidad y Protección de Datos */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <FileText className="h-6 w-6 text-antigua-purple mr-3" />
                8. Privacidad y Protección de Datos
              </h2>
              <div className="text-gray-700 space-y-4">
                <p>
                  Respetamos su privacidad y protegemos su información personal de acuerdo con 
                  nuestra Política de Privacidad. Al utilizar nuestros servicios, usted consiente 
                  la recopilación y uso de su información según se describe en dicha política.
                </p>
                <p>
                  No compartimos su información personal con terceros, excepto cuando sea necesario 
                  para proporcionar los servicios solicitados o cuando la ley lo requiera.
                </p>
              </div>
            </section>

            {/* 9. Modificaciones */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <FileText className="h-6 w-6 text-antigua-purple mr-3" />
                9. Modificaciones de los Términos
              </h2>
              <div className="text-gray-700 space-y-4">
                <p>
                  Nos reservamos el derecho de modificar estos términos y condiciones en cualquier 
                  momento. Las modificaciones entrarán en vigor inmediatamente después de su 
                  publicación en nuestro sitio web.
                </p>
                <p>
                  Es responsabilidad del usuario revisar periódicamente estos términos. El uso 
                  continuado de nuestros servicios después de cualquier modificación constituye 
                  la aceptación de los nuevos términos.
                </p>
              </div>
            </section>

            {/* 10. Ley Aplicable */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Shield className="h-6 w-6 text-antigua-purple mr-3" />
                10. Ley Aplicable y Jurisdicción
              </h2>
              <div className="text-gray-700 space-y-4">
                <p>
                  Estos términos y condiciones se rigen por las leyes de la República de Guatemala. 
                  Cualquier disputa que surja de estos términos será resuelta en los tribunales 
                  competentes de Antigua Guatemala, Sacatepéquez, Guatemala.
                </p>
                <p>
                  Si alguna disposición de estos términos es considerada inválida o inaplicable, 
                  las demás disposiciones permanecerán en pleno vigor y efecto.
                </p>
              </div>
            </section>

            {/* Contact Information */}
            <section className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Información de Contacto</h2>
              <div className="text-gray-700 space-y-2">
                <p><strong>Antigua Hotels Tours</strong></p>
                <p>Antigua Guatemala, Sacatepéquez, Guatemala</p>
                <p>Teléfono: +502 1234-5678</p>
                <p>Email: info@antiguahotelstours.com</p>
                <p>Website: www.antiguahotelstours.com</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
