import PublicLayout from '@/components/layout/public-layout'
import HeroSection from '@/components/ui/hero-section'
import ServiceCard from '@/components/ui/service-card'
import { Button } from '@/components/ui/button'
import { 
  MapPin, 
  Clock, 
  Users, 
  Star,
  CheckCircle,
  Quote,
  Calendar,
  Phone,
  Mail,
  ArrowRight,
  Shield
} from 'lucide-react'
import Link from 'next/link'

// Componente que obtiene las imágenes dinámicamente
async function getHeroImages() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/public/website-images?pageType=home&pageSection=hero`, {
      cache: 'no-store' // Para obtener siempre las imágenes más recientes
    })
    
    if (response.ok) {
      const data = await response.json()
      console.log('📸 Hero images data:', data)
      
      // Convertir a formato esperado por el componente
      const heroImages = data.images.map((img: any) => ({
        id: img.id,
        imageUrl: img.imageUrl,
        title: img.title,
        description: img.description
      }))
      
      console.log('🖼️ Processed hero images:', heroImages)
      return heroImages
    }
  } catch (error) {
    console.error('Error fetching hero images:', error)
  }
  
  // Fallback images
  return [
    {
      id: '1',
      imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop',
      title: 'Antigua Guatemala',
      description: 'Vista panorámica de la ciudad colonial'
    },
    {
      id: '2',
      imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1920&h=1080&fit=crop',
      title: 'Catedral de Antigua',
      description: 'Arquitectura colonial impresionante'
    },
    {
      id: '3',
      imageUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1920&h=1080&fit=crop',
      title: 'Volcán de Agua',
      description: 'Majestuosa vista del volcán'
    }
  ]
}

export default async function HomePage() {
  const heroImages = await getHeroImages()
  
  // Datos de ejemplo - estos vendrán de las APIs
  const featuredServices = [
    {
      title: 'Hotel Casa Antigua',
      description: 'Hotel boutique en el corazón de Antigua con vistas espectaculares al volcán.',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&h=300&fit=crop',
      location: 'Antigua Guatemala',
      duration: 'Desde 1 noche',
      participants: '2-4 personas',
      price: '85',
      currency: 'USD',
      rating: 4.8,
      reviews: 124,
      features: ['WiFi Gratis', 'Desayuno Incluido', 'Vista al Volcán'],
      href: '/accommodations/hotel-casa-antigua'
    },
    {
      title: 'Tour Volcán Pacaya',
      description: 'Aventura única al volcán activo con guía experto y equipamiento incluido.',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop',
      location: 'Volcán Pacaya',
      duration: '6 horas',
      participants: '4-12 personas',
      price: '45',
      currency: 'USD',
      rating: 4.9,
      reviews: 89,
      features: ['Guía Certificado', 'Equipamiento', 'Transporte'],
      href: '/activities/tour-volcan-pacaya'
    },
    {
      title: 'Paquete Aventura Completa',
      description: '3 días de experiencias únicas incluyendo alojamiento, tours y transporte.',
      image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=500&h=300&fit=crop',
      location: 'Antigua Guatemala',
      duration: '3 días',
      participants: '2-6 personas',
      price: '299',
      currency: 'USD',
      rating: 4.7,
      reviews: 56,
      features: ['Alojamiento', '3 Tours', 'Transporte'],
      href: '/packages/aventura-completa'
    }
  ]

  const testimonials = [
    {
      name: 'María González',
      location: 'México',
      rating: 5,
      text: 'Una experiencia increíble. El hotel era perfecto y el tour al volcán Pacaya fue espectacular. Definitivamente regresaré.'
    },
    {
      name: 'John Smith',
      location: 'Estados Unidos',
      rating: 5,
      text: 'El personal fue muy amable y profesional. Las actividades estaban bien organizadas y todo salió perfecto.'
    },
    {
      name: 'Ana Rodríguez',
      location: 'España',
      rating: 5,
      text: 'Guatemala es un país hermoso y con Antigua Hotels Tours pudimos disfrutarlo al máximo. Altamente recomendado.'
    }
  ]

  const whyChooseUs = [
    {
      icon: CheckCircle,
      title: 'Experiencia Garantizada',
      description: 'Más de 10 años creando experiencias únicas en Guatemala'
    },
    {
      icon: Star,
      title: 'Calidad Premium',
      description: 'Hoteles y servicios cuidadosamente seleccionados'
    },
    {
      icon: Users,
      title: 'Atención Personalizada',
      description: 'Guías locales expertos y servicio 24/7'
    },
    {
      icon: Shield,
      title: 'Reservas Seguras',
      description: 'Pagos seguros y cancelación flexible'
    }
  ]

  return (
    <PublicLayout>
      {/* Hero Section */}
      <HeroSection
        title="Descubre la Magia de Guatemala"
        subtitle="Experiencias Auténticas en Antigua"
        description="Sumérgete en la rica cultura guatemalteca con nuestros hoteles boutique, tours únicos y aventuras inolvidables en el corazón de Antigua Guatemala."
        primaryButton={{
          text: 'Explorar Servicios',
          href: '/accommodations'
        }}
        secondaryButton={{
          text: 'Ver Paquetes',
          href: '/packages'
        }}
        images={heroImages}
        autoSlide={true}
        slideInterval={5000}
      />

      {/* Featured Services */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Servicios Destacados
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Descubre nuestras experiencias más populares, cuidadosamente seleccionadas 
              para ofrecerte lo mejor de Guatemala.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {featuredServices.map((service, index) => (
              <ServiceCard
                key={index}
                {...service}
              />
            ))}
          </div>
          
          <div className="text-center">
            <Button asChild size="lg" className="bg-antigua-purple hover:bg-antigua-purple-dark">
              <Link href="/accommodations">
                Ver Todos los Servicios
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              ¿Por Qué Elegirnos?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Somos más que un servicio de turismo, somos tus guías locales 
              para descubrir la verdadera esencia de Guatemala.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyChooseUs.map((item, index) => (
              <div key={index} className="text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <item.icon className="h-8 w-8 text-antigua-purple" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Lo Que Dicen Nuestros Huéspedes
            </h2>
            <p className="text-lg text-gray-600">
              Miles de viajeros han confiado en nosotros para sus aventuras en Guatemala
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <Quote className="h-8 w-8 text-yellow-400 mb-4" />
                <p className="text-gray-700 mb-4 italic">
                  "{testimonial.text}"
                </p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-gray-600 text-sm">{testimonial.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-antigua-purple to-antigua-pink text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            ¿Listo para tu Aventura?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Reserva ahora y obtén el 10% de descuento en tu primera experiencia con nosotros
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              asChild
              size="lg"
              className="bg-white text-antigua-purple hover:bg-gray-100"
            >
              <Link href="/booking">
                <Calendar className="mr-2 h-5 w-5" />
                Reservar Ahora
              </Link>
            </Button>
            <Button 
              asChild
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white hover:text-antigua-purple"
            >
              <Link href="/contact">
                <Phone className="mr-2 h-5 w-5" />
                Contáctanos
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}