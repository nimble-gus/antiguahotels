'use client'

import Image from 'next/image'
import { CheckCircle, Users, Globe, Award, Heart } from 'lucide-react'
import PublicLayout from '@/components/layout/public-layout'

export default function AboutPage() {
  return (
    <PublicLayout>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-antigua-purple to-purple-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Acerca de Nosotros
            </h1>
            <p className="text-xl md:text-2xl text-purple-100 leading-relaxed">
              Descubre la belleza de Guatemala con experiencias auténticas y memorables
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          
          {/* Our Story */}
          <section className="mb-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Nuestra Historia</h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>
                    Antigua Hotels Tours nació de la pasión por compartir la riqueza cultural y natural de Guatemala. 
                    Desde nuestros inicios, nos hemos dedicado a crear experiencias únicas que conecten a nuestros 
                    visitantes con la auténtica belleza de este país centroamericano.
                  </p>
                  <p>
                    Fundada en el corazón de Antigua Guatemala, una ciudad declarada Patrimonio de la Humanidad por la UNESCO, 
                    nuestra empresa ha crecido para convertirse en un referente en turismo sostenible y responsable.
                  </p>
                  <p>
                    Cada día trabajamos con comunidades locales, hoteles familiares y guías expertos para ofrecer 
                    experiencias que no solo entretienen, sino que también educan y preservan nuestro patrimonio cultural.
                  </p>
                </div>
              </div>
              <div className="relative">
                <Image
                  src="/logo.png"
                  alt="Antigua Hotels Tours"
                  width={500}
                  height={400}
                  className="rounded-lg shadow-lg"
                />
              </div>
            </div>
          </section>

          {/* Mission, Vision, Values */}
          <section className="mb-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-lg shadow-lg text-center">
                <div className="bg-antigua-purple/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-antigua-purple" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Nuestra Misión</h3>
                <p className="text-gray-700">
                  Conectar a nuestros huéspedes con la auténtica cultura guatemalteca a través de 
                  experiencias memorables, promoviendo el turismo sostenible y el desarrollo local.
                </p>
              </div>

              <div className="bg-white p-8 rounded-lg shadow-lg text-center">
                <div className="bg-antigua-purple/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="h-8 w-8 text-antigua-purple" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Nuestra Visión</h3>
                <p className="text-gray-700">
                  Ser la empresa líder en turismo cultural en Guatemala, reconocida por nuestra 
                  excelencia en servicio y compromiso con la preservación del patrimonio nacional.
                </p>
              </div>

              <div className="bg-white p-8 rounded-lg shadow-lg text-center">
                <div className="bg-antigua-purple/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-antigua-purple" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Nuestros Valores</h3>
                <p className="text-gray-700">
                  Autenticidad, sostenibilidad, excelencia en servicio, respeto por las comunidades 
                  locales y pasión por compartir la cultura guatemalteca.
                </p>
              </div>
            </div>
          </section>

          {/* Why Choose Us */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">¿Por Qué Elegirnos?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Experiencia Local Auténtica</h3>
                    <p className="text-gray-700">
                      Trabajamos directamente con comunidades locales para ofrecer experiencias genuinas 
                      que respetan y preservan la cultura guatemalteca.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Guías Expertos</h3>
                    <p className="text-gray-700">
                      Nuestros guías son profesionales certificados con amplio conocimiento de la historia, 
                      cultura y naturaleza de Guatemala.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Turismo Sostenible</h3>
                    <p className="text-gray-700">
                      Promovemos prácticas de turismo responsable que benefician a las comunidades locales 
                      y protegen el medio ambiente.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Atención Personalizada</h3>
                    <p className="text-gray-700">
                      Cada experiencia está diseñada según tus intereses y necesidades, garantizando 
                      un servicio único y memorable.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Seguridad Garantizada</h3>
                    <p className="text-gray-700">
                      Todos nuestros tours y actividades cumplen con los más altos estándares de seguridad 
                      y están completamente asegurados.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Precios Competitivos</h3>
                    <p className="text-gray-700">
                      Ofrecemos la mejor relación calidad-precio del mercado, con opciones para todos 
                      los presupuestos.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Team Section */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Nuestro Equipo</h2>
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <div className="text-center mb-8">
                <Users className="h-16 w-16 text-antigua-purple mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Profesionales Apasionados</h3>
                <p className="text-gray-700 max-w-2xl mx-auto">
                  Nuestro equipo está compuesto por guías certificados, especialistas en turismo cultural, 
                  y profesionales del sector hotelero que comparten una pasión común: mostrar la belleza 
                  y riqueza de Guatemala al mundo.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Guías Certificados</h4>
                  <p className="text-gray-700">
                    Profesionales con certificación oficial y amplia experiencia en turismo cultural.
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Especialistas Locales</h4>
                  <p className="text-gray-700">
                    Conocedores de las tradiciones, historia y secretos mejor guardados de cada región.
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Soporte 24/7</h4>
                  <p className="text-gray-700">
                    Equipo de soporte disponible para asistirte en cualquier momento durante tu viaje.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <section className="text-center">
            <div className="bg-gradient-to-r from-antigua-purple to-purple-600 text-white p-12 rounded-lg">
              <h2 className="text-3xl font-bold mb-4">¿Listo para tu Aventura?</h2>
              <p className="text-xl text-purple-100 mb-8">
                Únete a nosotros y descubre la magia de Guatemala
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/packages"
                  className="bg-white text-antigua-purple px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Ver Paquetes
                </a>
                <a
                  href="/contact"
                  className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-antigua-purple transition-colors"
                >
                  Contáctanos
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>
    </PublicLayout>
  )
}
