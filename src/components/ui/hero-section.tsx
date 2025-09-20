'use client'

import { ReactNode, useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowRight, Play, ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'

interface HeroImage {
  id: string
  imageUrl: string
  title: string
  description?: string
}

interface HeroSectionProps {
  title: string
  subtitle?: string
  description?: string
  primaryButton?: {
    text: string
    href: string
    icon?: ReactNode
  }
  secondaryButton?: {
    text: string
    href: string
    icon?: ReactNode
  }
  images?: HeroImage[]
  backgroundImage?: string // Fallback para compatibilidad
  overlay?: boolean
  height?: 'sm' | 'md' | 'lg' | 'xl'
  autoSlide?: boolean
  slideInterval?: number
}

export default function HeroSection({
  title,
  subtitle,
  description,
  primaryButton,
  secondaryButton,
  images = [],
  backgroundImage,
  overlay = true,
  height = 'lg',
  autoSlide = true,
  slideInterval = 5000
}: HeroSectionProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(autoSlide)

  // Si no hay imágenes, usar backgroundImage como fallback
  const heroImages = images.length > 0 ? images : (backgroundImage ? [{
    id: '1',
    imageUrl: backgroundImage,
    title: title,
    description: description
  }] : [])

  const heightClasses = {
    sm: 'h-64 md:h-80',
    md: 'h-80 md:h-96',
    lg: 'h-96 md:h-[500px]',
    xl: 'h-[500px] md:h-[600px]'
  }

  // Auto-slide functionality
  useEffect(() => {
    if (!isAutoPlaying || heroImages.length <= 1) return

    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % heroImages.length)
    }, slideInterval)

    return () => clearInterval(interval)
  }, [isAutoPlaying, heroImages.length, slideInterval])

  const goToNextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % heroImages.length)
  }

  const goToPrevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + heroImages.length) % heroImages.length)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  if (heroImages.length === 0) {
    return (
      <section className={`relative ${heightClasses[height]} flex items-center justify-center bg-gradient-to-r from-antigua-purple to-antigua-pink`}>
        <div className="text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">{title}</h1>
          {description && <p className="text-xl">{description}</p>}
        </div>
      </section>
    )
  }

  // Calcular el offset para centrar la imagen activa
  const getCarouselOffset = () => {
    // Cada imagen ocupa 100vw de ancho conceptual
    // Queremos centrar la imagen activa
    return -currentSlide * 100
  }

  return (
    <section className="relative py-8">
      <style jsx>{`
        .carousel-container {
          transition: transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
      `}</style>
      
      <div className="relative overflow-hidden">
        {/* Physical Carousel Container */}
        <div 
          className="carousel-container flex items-center"
          style={{ 
            transform: `translateX(${getCarouselOffset()}vw)`,
            width: `${heroImages.length * 100}vw`
          }}
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(autoSlide)}
        >
          {heroImages.map((image, index) => {
            const isActive = index === currentSlide
            
            return (
              <div
                key={image.id}
                className="relative flex items-center justify-center"
                style={{ width: '100vw' }}
                onClick={() => !isActive && goToSlide(index)}
              >
                {/* Imagen Izquierda (Preview) */}
                <div className={`relative ${heightClasses[height]} flex-1 z-10 rounded-r-2xl md:rounded-r-3xl overflow-hidden shadow-xl opacity-70 hover:opacity-90 cursor-pointer`}>
                  <Image
                    src={heroImages[(index - 1 + heroImages.length) % heroImages.length].imageUrl}
                    alt={heroImages[(index - 1 + heroImages.length) % heroImages.length].title}
                    fill
                    sizes="25vw"
                    className="object-cover"
                  />
                  <div className="absolute bottom-4 left-4 right-4 text-white text-center">
                    <h3 className="text-xs md:text-sm font-semibold drop-shadow-lg">
                      {heroImages[(index - 1 + heroImages.length) % heroImages.length].title}
                    </h3>
                  </div>
                </div>

                {/* Imagen Central (Principal) */}
                <div className={`relative ${heightClasses[height]} w-[60vw] md:w-[55vw] lg:w-[50vw] z-20 mx-4 md:mx-6 rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl`}>
                  <Image
                    src={image.imageUrl}
                    alt={image.title}
                    fill
                    sizes="55vw"
                    className="object-cover"
                    priority={isActive}
                  />
                  
                  {/* Overlay on active image */}
                  {isActive && overlay && (
                    <div className="absolute inset-0 bg-black bg-opacity-40" />
                  )}
                  
                  {/* Content only on active image */}
                  {isActive && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center">
                      <div className="container mx-auto px-4 text-center text-white">
                        <div className="max-w-4xl mx-auto">
                          {subtitle && (
                            <p className="text-lg md:text-xl text-antigua-yellow font-medium mb-4">
                              {subtitle}
                            </p>
                          )}
                          
                          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight drop-shadow-lg">
                            {title}
                          </h1>
                          
                          {description && (
                            <p className="text-base md:text-lg lg:text-xl text-gray-200 mb-8 leading-relaxed drop-shadow-md">
                              {description}
                            </p>
                          )}
                          
                          {/* Action Buttons */}
                          {(primaryButton || secondaryButton) && (
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                              {primaryButton && (
                                <Button 
                                  asChild
                                  size="lg"
                                  className="bg-antigua-purple hover:bg-antigua-purple-dark text-white px-6 md:px-8 py-3 text-base md:text-lg shadow-lg"
                                >
                                  <a href={primaryButton.href}>
                                    {primaryButton.icon && (
                                      <span className="mr-2">{primaryButton.icon}</span>
                                    )}
                                    {primaryButton.text}
                                    <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
                                  </a>
                                </Button>
                              )}
                              
                              {secondaryButton && (
                                <Button 
                                  asChild
                                  variant="outline"
                                  size="lg"
                                  className="border-white text-white hover:bg-white hover:text-gray-900 px-6 md:px-8 py-3 text-base md:text-lg backdrop-blur-sm"
                                >
                                  <a href={secondaryButton.href}>
                                    {secondaryButton.icon && (
                                      <span className="mr-2">{secondaryButton.icon}</span>
                                    )}
                                    {secondaryButton.text}
                                  </a>
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Imagen Derecha (Preview) */}
                <div className={`relative ${heightClasses[height]} flex-1 z-10 rounded-l-2xl md:rounded-l-3xl overflow-hidden shadow-xl opacity-70 hover:opacity-90 cursor-pointer`}>
                  <Image
                    src={heroImages[(index + 1) % heroImages.length].imageUrl}
                    alt={heroImages[(index + 1) % heroImages.length].title}
                    fill
                    sizes="25vw"
                    className="object-cover"
                  />
                  <div className="absolute bottom-4 left-4 right-4 text-white text-center">
                    <h3 className="text-xs md:text-sm font-semibold drop-shadow-lg">
                      {heroImages[(index + 1) % heroImages.length].title}
                    </h3>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Navigation Arrows */}
        {heroImages.length > 1 && (
          <>
            <button
              onClick={goToPrevSlide}
              className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-30 bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm text-white p-2 md:p-3 rounded-full transition-all duration-200 shadow-lg"
            >
              <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
            </button>
            <button
              onClick={goToNextSlide}
              className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-30 bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm text-white p-2 md:p-3 rounded-full transition-all duration-200 shadow-lg"
            >
              <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
            </button>
          </>
        )}

        {/* Dots Indicator */}
        {heroImages.length > 1 && (
          <div className="flex justify-center mt-8 z-20">
            <div className="flex space-x-3 bg-black bg-opacity-20 backdrop-blur-sm px-4 py-2 rounded-full">
              {heroImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 ${
                    index === currentSlide 
                      ? 'bg-white scale-125 shadow-lg' 
                      : 'bg-white bg-opacity-50 hover:bg-opacity-75 hover:scale-110'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Slide Counter */}
        {heroImages.length > 1 && (
          <div className="absolute top-4 right-4 z-30 bg-black bg-opacity-30 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs md:text-sm font-medium">
            {currentSlide + 1} / {heroImages.length}
          </div>
        )}
      </div>
      
      {/* Scroll Indicator */}
      <div className="flex justify-center mt-8 text-gray-500">
        <div className="animate-bounce">
          <div className="w-5 h-8 md:w-6 md:h-10 border-2 border-gray-400 rounded-full flex justify-center">
            <div className="w-1 h-2 md:h-3 bg-gray-400 rounded-full mt-2"></div>
          </div>
        </div>
      </div>
    </section>
  )
}