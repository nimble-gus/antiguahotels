import { ReactNode } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { 
  MapPin, 
  Clock, 
  Users, 
  Star, 
  ArrowRight,
  Calendar,
  DollarSign
} from 'lucide-react'

interface ServiceCardProps {
  title: string
  description: string
  image?: string
  location?: string
  duration?: string
  participants?: string
  price?: string
  currency?: string
  rating?: number
  reviews?: number
  features?: string[]
  href: string
  buttonText?: string
  badge?: string
  className?: string
}

export default function ServiceCard({
  title,
  description,
  image,
  location,
  duration,
  participants,
  price,
  currency = 'USD',
  rating,
  reviews,
  features = [],
  href,
  buttonText = 'Ver Detalles',
  badge,
  className = ''
}: ServiceCardProps) {
  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group ${className}`}>
      {/* Image */}
      {image && (
        <div className="relative h-48 overflow-hidden">
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {badge && (
            <div className="absolute top-4 left-4">
              <span className="bg-antigua-purple text-white px-3 py-1 rounded-full text-sm font-medium">
                {badge}
              </span>
            </div>
          )}
        </div>
      )}
      
      {/* Content */}
      <div className="p-6">
        {/* Title and Rating */}
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-antigua-purple transition-colors duration-200">
            {title}
          </h3>
          {rating && (
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-sm text-gray-600">
                {rating} {reviews && `(${reviews})`}
              </span>
            </div>
          )}
        </div>
        
        {/* Description */}
        <p className="text-gray-600 mb-4 line-clamp-2">
          {description}
        </p>
        
        {/* Features */}
        {features.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {features.slice(0, 3).map((feature, index) => (
              <span
                key={index}
                className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs"
              >
                {feature}
              </span>
            ))}
            {features.length > 3 && (
              <span className="text-gray-500 text-xs">
                +{features.length - 3} más
              </span>
            )}
          </div>
        )}
        
        {/* Details */}
        <div className="space-y-2 mb-4">
          {location && (
            <div className="flex items-center text-gray-600 text-sm">
              <MapPin className="h-4 w-4 mr-2 text-antigua-purple" />
              {location}
            </div>
          )}
          {duration && (
            <div className="flex items-center text-gray-600 text-sm">
              <Clock className="h-4 w-4 mr-2 text-antigua-purple" />
              {duration}
            </div>
          )}
          {participants && (
            <div className="flex items-center text-gray-600 text-sm">
              <Users className="h-4 w-4 mr-2 text-antigua-purple" />
              {participants}
            </div>
          )}
        </div>
        
        {/* Price and Button */}
        <div className="flex items-center justify-between">
          {price && (
            <div className="flex items-baseline">
              <DollarSign className="h-5 w-5 text-antigua-purple" />
              <span className="text-2xl font-bold text-gray-900">{price}</span>
              <span className="text-gray-600 ml-1">{currency}</span>
            </div>
          )}
          
          <Button 
            asChild
            className="bg-antigua-purple hover:bg-antigua-purple-dark text-white group-hover:translate-x-1 transition-transform duration-200"
          >
            <Link href={href}>
              {buttonText}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
