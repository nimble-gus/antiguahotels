'use client'

import PublicLayout from '@/components/layout/public-layout'
import HeroSection from '@/components/ui/hero-section'
import ServiceCard from '@/components/ui/service-card'
import SearchBar from '@/components/search-bar'
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
  Shield,
  Plane
} from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import { useState, useEffect, useMemo } from 'react'

// Componente que obtiene las actividades destacadas
async function getFeaturedActivities() {
  try {
    // Usar la URL actual en lugar de una variable de entorno
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    
    const response = await fetch(`${baseUrl}/api/public/featured-activities`, {
      cache: 'no-store' // Para obtener siempre las actividades más recientes
    })
    
    if (response.ok) {
      const data = await response.json()
      console.log('🎯 Featured activities data:', data)
      console.log('📊 Data source:', data.source)
      console.log('📊 Activities count:', data.totalCount)
      return data.activities
    }
  } catch (error) {
    console.error('Error fetching featured activities:', error)
  }
  
  // Fallback activities si hay error
  return []
}

// Componente que obtiene las imágenes dinámicamente
async function getHeroImages() {
  try {
    // Usar la URL actual en lugar de una variable de entorno
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    
    const response = await fetch(`${baseUrl}/api/public/website-images?pageType=home&pageSection=hero`, {
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

export default function HomePage() {
  const { t } = useLanguage()
  const [heroImages, setHeroImages] = useState<any[]>([])
  const [featuredActivities, setFeaturedActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Función para traducir actividades
  const translateActivity = (activity: any) => {
    const activityKey = activity.title.toLowerCase()
    
    // Mapeo de actividades conocidas a sus claves de traducción
    if (activityKey.includes('volcán') || activityKey.includes('volcano')) {
      return {
        ...activity,
        title: t('activity.volcano_tour'),
        description: t('activity.volcano_desc'),
        location: t('activity.pacaya_location'),
        badge: t('activity.adventure_badge'),
        duration: activity.duration?.replace('horas', t('activity.hours')).replace('hours', t('activity.hours')).replace('heures', t('activity.hours')).replace('Stunden', t('activity.hours')),
        participants: activity.participants?.replace('personas', t('activity.people')).replace('people', t('activity.people')).replace('personnes', t('activity.people')).replace('Personen', t('activity.people'))
      }
    } else if (activityKey.includes('city') || activityKey.includes('ciudad')) {
      return {
        ...activity,
        title: t('activity.city_tour'),
        description: t('activity.city_desc'),
        location: t('activity.antigua_location'),
        badge: t('activity.cultural_badge'),
        duration: activity.duration?.replace('horas', t('activity.hours')).replace('hours', t('activity.hours')).replace('heures', t('activity.hours')).replace('Stunden', t('activity.hours')),
        participants: activity.participants?.replace('personas', t('activity.people')).replace('people', t('activity.people')).replace('personnes', t('activity.people')).replace('Personen', t('activity.people'))
      }
    } else if (activityKey.includes('cocina') || activityKey.includes('cooking') || activityKey.includes('cuisine')) {
      return {
        ...activity,
        title: t('activity.cooking_class'),
        description: t('activity.cooking_desc'),
        location: t('activity.antigua_location'),
        badge: t('activity.culinary_badge'),
        duration: activity.duration?.replace('horas', t('activity.hours')).replace('hours', t('activity.hours')).replace('heures', t('activity.hours')).replace('Stunden', t('activity.hours')),
        participants: activity.participants?.replace('personas', t('activity.people')).replace('people', t('activity.people')).replace('personnes', t('activity.people')).replace('Personen', t('activity.people'))
      }
    }
    
    // Si no se encuentra una traducción específica, solo traducir las palabras comunes
    return {
      ...activity,
      duration: activity.duration?.replace('horas', t('activity.hours')).replace('hours', t('activity.hours')).replace('heures', t('activity.hours')).replace('Stunden', t('activity.hours')),
      participants: activity.participants?.replace('personas', t('activity.people')).replace('people', t('activity.people')).replace('personnes', t('activity.people')).replace('Personen', t('activity.people'))
    }
  }

  // Cargar datos al montar el componente
  useEffect(() => {
    const loadData = async () => {
      try {
        const [heroImagesData, featuredActivitiesData] = await Promise.all([
          getHeroImages(),
          getFeaturedActivities()
        ])
        setHeroImages(heroImagesData)
        setFeaturedActivities(featuredActivitiesData)
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Traducir actividades usando useMemo
  const translatedActivities = useMemo(() => {
    return featuredActivities.map(translateActivity)
  }, [featuredActivities, t])
  
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
      title: t('home.why_choose.experience'),
      description: t('home.why_choose.experience_desc')
    },
    {
      icon: Star,
      title: t('home.why_choose.quality'),
      description: t('home.why_choose.quality_desc')
    },
    {
      icon: Users,
      title: t('home.why_choose.attention'),
      description: t('home.why_choose.attention_desc')
    },
    {
      icon: Shield,
      title: t('home.why_choose.security'),
      description: t('home.why_choose.security_desc')
    }
  ]

  return (
    <PublicLayout>
      {/* Search Bar */}
      <SearchBar />

      {/* Hero Section */}
      <HeroSection
        title={t('home.hero.title')}
        subtitle={t('home.hero.subtitle')}
        description={t('home.hero.description')}
        primaryButton={{
          text: t('home.hero.explore_services'),
          href: '/accommodations'
        }}
        secondaryButton={{
          text: t('home.hero.view_packages'),
          href: '/packages'
        }}
        images={heroImages}
        autoSlide={true}
        slideInterval={5000}
      />

      {/* Featured Services */}
      <section className="pt-12 sm:pt-16 lg:pt-20 pb-12 sm:pb-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              {t('home.featured.title')}
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
              {t('home.featured.description')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12">
            {translatedActivities.length > 0 ? (
              translatedActivities.map((activity: any, index: number) => (
                <ServiceCard
                  key={activity.id}
                  {...activity}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="text-gray-500 mb-4">
                  <Plane className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg">{t('home.featured.no_activities')}</p>
                  <p className="text-sm">{t('home.featured.configure')}</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="text-center">
            <Button asChild size="lg" className="bg-antigua-purple hover:bg-antigua-purple-dark">
              <Link href="/activities">
                {t('home.featured.view_all')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              {t('home.why_choose.title')}
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
              {t('home.why_choose.description')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {whyChooseUs.map((item, index) => (
              <div key={index} className="text-center px-2">
                <div className="bg-purple-100 w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <item.icon className="h-6 w-6 sm:h-8 sm:w-8 text-antigua-purple" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              {t('home.testimonials.title')}
            </h2>
            <p className="text-base sm:text-lg text-gray-600 px-4">
              {t('home.testimonials.description')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 p-4 sm:p-6 rounded-xl">
                <div className="flex items-center mb-3 sm:mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <Quote className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-400 mb-3 sm:mb-4" />
                <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4 italic">
                  &quot;{testimonial.text}&quot;
                </p>
                <div>
                  {/* Nombre y nacionalidad removidos */}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Modern & Impactful */}
      <section className="relative py-12 sm:py-16 md:py-20 lg:py-24 overflow-hidden">
        {/* Background with animated gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-antigua-purple via-purple-600 to-antigua-pink">
          <div className="absolute inset-0 bg-black/10"></div>
          {/* Animated background elements */}
          <div className="absolute top-0 left-1/4 w-32 h-32 sm:w-64 sm:h-64 md:w-96 md:h-96 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-24 h-24 sm:w-48 sm:h-48 md:w-80 md:h-80 bg-yellow-300/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 sm:px-6 text-center">
          {/* Main content with glass morphism effect */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12 max-w-5xl mx-auto border border-white/20 shadow-2xl">
            {/* Title with enhanced typography */}
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-bold mb-3 sm:mb-4 md:mb-6 text-white leading-tight">
              <span className="bg-gradient-to-r from-white via-yellow-200 to-white bg-clip-text text-transparent">
                {t('home.cta.title')}
              </span>
            </h2>
            
            {/* Description with better spacing */}
            <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl mb-6 sm:mb-8 md:mb-12 max-w-4xl mx-auto text-white/90 leading-relaxed font-light px-1 sm:px-2">
              {t('home.cta.description')}
            </p>
            
            {/* Modern buttons with enhanced styling */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-6 justify-center items-center px-2">
              {/* Primary CTA Button */}
              <Button 
                asChild
                size="lg"
                className="group relative bg-white text-antigua-purple hover:bg-yellow-300 hover:text-antigua-purple transform hover:scale-105 transition-all duration-300 shadow-2xl border-0 px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 text-sm sm:text-base md:text-lg font-semibold rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden w-full sm:w-auto min-w-[200px] sm:min-w-0"
              >
                <Link href="/booking" className="flex items-center justify-center">
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  
                  <Calendar className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 transition-transform duration-300 group-hover:rotate-12" />
                  {t('home.cta.book_now')}
                  <ArrowRight className="ml-2 sm:ml-3 h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Button>
              
              {/* Secondary CTA Button */}
              <Button 
                asChild
                variant="outline"
                size="lg"
                className="group relative border-2 border-white text-white hover:bg-white hover:text-antigua-purple transform hover:scale-105 transition-all duration-300 backdrop-blur-sm px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 text-sm sm:text-base md:text-lg font-semibold rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden bg-white/5 hover:bg-white w-full sm:w-auto min-w-[200px] sm:min-w-0"
              >
                <Link href="/contact" className="flex items-center justify-center">
                  {/* Shimmer effect for secondary button */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  
                  <Phone className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 transition-transform duration-300 group-hover:scale-110" />
                  {t('home.cta.contact')}
                </Link>
              </Button>
            </div>
            
            {/* Trust indicators */}
            <div className="mt-6 sm:mt-8 md:mt-12 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 md:gap-6 lg:gap-8 text-white/70 text-xs sm:text-sm">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Shield className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                <span className="text-xs sm:text-sm">{t('home.cta.trust.secure')}</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                <span className="text-xs sm:text-sm">{t('home.cta.trust.flexible')}</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Star className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-yellow-300" />
                <span className="text-xs sm:text-sm">{t('home.cta.trust.reviews')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}



