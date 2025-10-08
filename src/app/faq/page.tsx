'use client'

import { ChevronDown, HelpCircle } from 'lucide-react'
import PublicLayout from '@/components/layout/public-layout'

export default function FAQPage() {
  const faqs = [
    {
      category: "Reservaciones",
      questions: [
        {
          question: "¿Cómo puedo hacer una reservación?",
          answer: "Puedes hacer tu reservación de varias maneras: a través de nuestro sitio web, llamando a nuestro número de teléfono, enviando un email, o visitando nuestras oficinas en Antigua Guatemala. Nuestro proceso de reservación es simple y seguro."
        },
        {
          question: "¿Cuál es la política de cancelación?",
          answer: "Ofrecemos diferentes políticas de cancelación según el tipo de servicio. Para la mayoría de nuestros tours y actividades, puedes cancelar hasta 24 horas antes sin costo. Para paquetes de múltiples días, la cancelación debe ser con 48 horas de anticipación. Los detalles específicos se proporcionan al momento de la reservación."
        },
        {
          question: "¿Puedo modificar mi reservación?",
          answer: "Sí, puedes modificar tu reservación hasta 24 horas antes de la fecha programada, sujeto a disponibilidad. Los cambios pueden incluir fechas, número de participantes, o actividades específicas. Te recomendamos contactarnos lo antes posible para asegurar la disponibilidad."
        },
        {
          question: "¿Qué información necesito para reservar?",
          answer: "Para hacer una reservación necesitamos: nombres completos de todos los participantes, fechas de viaje, número de personas, información de contacto (email y teléfono), y cualquier requerimiento especial o restricción alimentaria que puedas tener."
        }
      ]
    },
    {
      category: "Pagos",
      questions: [
        {
          question: "¿Qué métodos de pago aceptan?",
          answer: "Aceptamos pagos con tarjeta de crédito (Visa, MasterCard, American Express), transferencias bancarias, PayPal, y pagos en efectivo en nuestras oficinas. Para reservaciones en línea, el pago se procesa de forma segura a través de nuestro sistema de pagos encriptado."
        },
        {
          question: "¿Es seguro pagar en línea?",
          answer: "Absolutamente. Utilizamos tecnología de encriptación SSL y procesadores de pago certificados para garantizar que tu información financiera esté completamente protegida. Nunca almacenamos información de tarjetas de crédito en nuestros servidores."
        },
        {
          question: "¿Puedo pagar en cuotas?",
          answer: "Para paquetes de múltiples días, ofrecemos opciones de pago en cuotas. El pago inicial es del 50% al momento de la reservación, y el saldo restante se puede pagar hasta 7 días antes del inicio del viaje. Consulta con nuestro equipo para más detalles."
        },
        {
          question: "¿Qué incluye el precio?",
          answer: "Nuestros precios incluyen: guía profesional, transporte (cuando aplique), entradas a sitios turísticos, equipos necesarios, y en algunos casos comidas. Los precios no incluyen: propinas, gastos personales, bebidas alcohólicas, o actividades opcionales no especificadas en el itinerario."
        }
      ]
    },
    {
      category: "Tours y Actividades",
      questions: [
        {
          question: "¿Qué nivel de dificultad tienen los tours?",
          answer: "Ofrecemos tours para todos los niveles de condición física. Nuestros tours están clasificados como: Fácil (caminatas cortas, terreno plano), Moderado (caminatas de 2-4 horas, terreno variado), y Desafiante (caminatas largas, terreno montañoso). Siempre indicamos el nivel de dificultad en cada tour."
        },
        {
          question: "¿Qué debo llevar a los tours?",
          answer: "Recomendamos llevar: ropa cómoda y apropiada para el clima, zapatos cerrados y cómodos, protector solar, gorra o sombrero, agua, cámara, y documentos de identidad. Para tours específicos, te enviaremos una lista detallada de qué llevar."
        },
        {
          question: "¿Los tours se cancelan por mal tiempo?",
          answer: "La seguridad es nuestra prioridad. Si las condiciones climáticas representan un riesgo, cancelaremos o reprogramaremos el tour. En caso de cancelación por mal tiempo, ofrecemos reembolso completo o reprogramación sin costo adicional."
        },
        {
          question: "¿Puedo hacer tours privados?",
          answer: "Sí, ofrecemos tours privados para grupos pequeños y familias. Los tours privados incluyen guía dedicado, horarios flexibles, y la posibilidad de personalizar el itinerario según tus intereses específicos. Los precios varían según el tamaño del grupo y la duración."
        }
      ]
    },
    {
      category: "Alojamiento",
      questions: [
        {
          question: "¿Qué tipos de alojamiento ofrecen?",
          answer: "Trabajamos con una variedad de alojamientos: hoteles boutique en Antigua, eco-lodges en áreas naturales, hoteles familiares, y opciones de lujo. Todos nuestros alojamientos son cuidadosamente seleccionados por su calidad, ubicación, y compromiso con el turismo sostenible."
        },
        {
          question: "¿Incluyen desayuno los alojamientos?",
          answer: "La mayoría de nuestros alojamientos incluyen desayuno continental o tradicional guatemalteco. Los detalles específicos de las comidas incluidas se especifican en cada paquete. Si tienes restricciones alimentarias, por favor infórmanos al momento de la reservación."
        },
        {
          question: "¿Puedo elegir mi alojamiento?",
          answer: "Sí, puedes elegir entre nuestras opciones de alojamiento disponibles. Te proporcionamos descripciones detalladas, fotos, y ubicaciones para que puedas tomar la mejor decisión según tus preferencias y presupuesto."
        }
      ]
    },
    {
      category: "Transporte",
      questions: [
        {
          question: "¿Incluyen transporte desde el aeropuerto?",
          answer: "Sí, ofrecemos servicio de traslado desde y hacia el aeropuerto de Guatemala City. El servicio está disponible las 24 horas y se puede reservar por separado o como parte de nuestros paquetes. Los vehículos son modernos, cómodos y conducidos por choferes profesionales."
        },
        {
          question: "¿Qué tipo de vehículos utilizan?",
          answer: "Utilizamos una flota moderna que incluye: vans de 8-15 pasajeros para grupos pequeños, buses de 25-50 pasajeros para grupos grandes, y vehículos 4x4 para tours de aventura. Todos nuestros vehículos están equipados con aire acondicionado y son mantenidos regularmente."
        },
        {
          question: "¿Puedo alquilar un vehículo?",
          answer: "No ofrecemos alquiler de vehículos directamente, pero podemos ayudarte a coordinar el alquiler con empresas confiables. También ofrecemos servicios de chofer privado para mayor comodidad y seguridad durante tu estadía."
        }
      ]
    },
    {
      category: "General",
      questions: [
        {
          question: "¿Necesito visa para visitar Guatemala?",
          answer: "Los ciudadanos de la mayoría de países de América del Norte, Europa, y algunos países de América Latina no necesitan visa para visitas turísticas de hasta 90 días. Sin embargo, te recomendamos verificar los requisitos específicos según tu nacionalidad en el consulado guatemalteco de tu país."
        },
        {
          question: "¿Es seguro viajar a Guatemala?",
          answer: "Guatemala es un país hermoso y seguro para los turistas, especialmente en las áreas turísticas como Antigua Guatemala. Trabajamos con guías locales experimentados y seguimos protocolos de seguridad estrictos. Te proporcionamos consejos de seguridad y te mantenemos informado sobre las mejores prácticas."
        },
        {
          question: "¿Qué idiomas hablan los guías?",
          answer: "Nuestros guías hablan español e inglés fluidamente. Algunos también hablan francés, alemán, e italiano. Si necesitas un guía en un idioma específico, por favor infórmanos al momento de la reservación y haremos nuestro mejor esfuerzo para acomodarte."
        },
        {
          question: "¿Ofrecen seguros de viaje?",
          answer: "Recomendamos encarecidamente contratar un seguro de viaje que cubra gastos médicos, cancelación de viaje, y equipaje. Aunque no vendemos seguros directamente, podemos recomendarte compañías confiables que ofrecen cobertura específica para Guatemala."
        }
      ]
    }
  ]

  return (
    <PublicLayout>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-antigua-purple to-purple-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Preguntas Frecuentes
            </h1>
            <p className="text-xl md:text-2xl text-purple-100 leading-relaxed">
              Encuentra respuestas a las preguntas más comunes sobre nuestros servicios
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          
          {/* Search Box */}
          <div className="mb-12">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar en las preguntas frecuentes..."
                className="w-full px-6 py-4 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-antigua-purple focus:border-transparent"
              />
              <HelpCircle className="absolute right-4 top-4 h-6 w-6 text-gray-400" />
            </div>
          </div>

          {/* FAQ Categories */}
          <div className="space-y-12">
            {faqs.map((category, categoryIndex) => (
              <div key={categoryIndex} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="bg-antigua-purple text-white px-6 py-4">
                  <h2 className="text-2xl font-bold">{category.category}</h2>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {category.questions.map((faq, faqIndex) => (
                    <div key={faqIndex} className="p-6">
                      <button className="w-full text-left flex items-center justify-between group">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-antigua-purple transition-colors">
                          {faq.question}
                        </h3>
                        <ChevronDown className="h-5 w-5 text-gray-500 group-hover:text-antigua-purple transition-colors" />
                      </button>
                      <div className="mt-4 text-gray-700 leading-relaxed">
                        {faq.answer}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Contact Section */}
          <div className="mt-16 bg-gradient-to-r from-antigua-purple to-purple-600 text-white p-8 rounded-lg text-center">
            <h2 className="text-2xl font-bold mb-4">¿No encontraste lo que buscabas?</h2>
            <p className="text-lg text-purple-100 mb-6">
              Nuestro equipo está aquí para ayudarte con cualquier pregunta
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="bg-white text-antigua-purple px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Contáctanos
              </a>
              <a
                href="tel:+50212345678"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-antigua-purple transition-colors"
              >
                Llamar Ahora
              </a>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
