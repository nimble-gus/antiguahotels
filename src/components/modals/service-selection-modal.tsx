'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Hotel, 
  MapPin, 
  Package, 
  Car,
  Calendar,
  Star,
  ArrowRight,
  Clock,
  Users,
  Navigation
} from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import Link from 'next/link'

interface ServiceSelectionModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ServiceSelectionModal({ isOpen, onClose }: ServiceSelectionModalProps) {
  const { t } = useLanguage()

  const services = [
    {
      id: 'accommodations',
      title: 'Alojamiento',
      description: 'Habitaciones de hotel con fechas de estadía',
      icon: Hotel,
      href: '/accommodations',
      color: 'blue',
      features: ['Check-in y Check-out', 'Selección de habitación', 'Múltiples noches'],
      popular: true
    },
    {
      id: 'activities',
      title: 'Actividades',
      description: 'Experiencias turísticas en horarios específicos',
      icon: MapPin,
      href: '/activities',
      color: 'green',
      features: ['Horarios específicos', 'Control de cupos', 'Experiencias únicas']
    },
    {
      id: 'packages',
      title: 'Paquetes',
      description: 'Paquetes completos con hoteles y actividades incluidas',
      icon: Package,
      href: '/packages',
      color: 'purple',
      features: ['Precio fijo total', 'Hoteles incluidos', 'Actividades incluidas'],
      popular: true
    },
    {
      id: 'shuttle',
      title: 'Shuttle',
      description: 'Transporte entre aeropuerto y hotel',
      icon: Car,
      href: '/shuttle',
      color: 'orange',
      features: ['Transporte cómodo', 'Horarios flexibles', 'Precios accesibles']
    }
  ]

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return {
          card: 'hover:ring-2 hover:ring-blue-500 hover:bg-blue-50',
          icon: 'text-blue-500',
          button: 'bg-blue-500 hover:bg-blue-600 text-white'
        }
      case 'green':
        return {
          card: 'hover:ring-2 hover:ring-green-500 hover:bg-green-50',
          icon: 'text-green-500',
          button: 'bg-green-500 hover:bg-green-600 text-white'
        }
      case 'purple':
        return {
          card: 'hover:ring-2 hover:ring-purple-500 hover:bg-purple-50',
          icon: 'text-purple-500',
          button: 'bg-purple-500 hover:bg-purple-600 text-white'
        }
      case 'orange':
        return {
          card: 'hover:ring-2 hover:ring-orange-500 hover:bg-orange-50',
          icon: 'text-orange-500',
          button: 'bg-orange-500 hover:bg-orange-600 text-white'
        }
      default:
        return {
          card: 'hover:ring-2 hover:ring-gray-500 hover:bg-gray-50',
          icon: 'text-gray-500',
          button: 'bg-gray-500 hover:bg-gray-600 text-white'
        }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-gray-900">
            ¿Qué te gustaría reservar?
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600">
            Selecciona el tipo de servicio que mejor se adapte a tus necesidades
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          {/* Servicios principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {services.map((service) => {
              const Icon = service.icon
              const colorClasses = getColorClasses(service.color)
              
              return (
                <Card 
                  key={service.id}
                  className={`cursor-pointer transition-all duration-200 ${colorClasses.card} ${
                    service.popular ? 'ring-2 ring-antigua-purple bg-antigua-purple/5' : ''
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg bg-gray-100 ${colorClasses.icon}`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div>
                          <CardTitle className="text-lg font-semibold text-gray-900">
                            {service.title}
                          </CardTitle>
                          {service.popular && (
                            <div className="flex items-center mt-1">
                              <Star className="h-3 w-3 text-yellow-400 fill-current" />
                              <span className="text-xs text-yellow-600 ml-1 font-medium">Popular</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <CardDescription className="text-gray-600 mt-2">
                      {service.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    {/* Características */}
                    <div className="mb-4">
                      <ul className="space-y-1">
                        {service.features.map((feature, index) => (
                          <li key={index} className="flex items-center text-sm text-gray-600">
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></div>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Botón de acción */}
                    <Link href={service.href} onClick={onClose}>
                      <Button 
                        className={`w-full ${colorClasses.button}`}
                        size="lg"
                      >
                        Ver {service.title}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Información adicional */}
          <div className="mt-8 p-6 bg-gray-50 rounded-lg">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                ¿Necesitas ayuda para decidir?
              </h3>
              <p className="text-gray-600 mb-4">
                Nuestro equipo está aquí para ayudarte a planificar tu viaje perfecto
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="outline" asChild>
                  <Link href="/contact">
                    <Clock className="h-4 w-4 mr-2" />
                    Contactar Asesor
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/packages">
                    <Star className="h-4 w-4 mr-2" />
                    Ver Paquetes Recomendados
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
