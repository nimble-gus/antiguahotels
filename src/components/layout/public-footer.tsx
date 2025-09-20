import Link from 'next/link'
import Image from 'next/image'
import { 
  Phone, 
  Mail, 
  MapPin, 
  Facebook, 
  Instagram, 
  Twitter,
  Calendar,
  Clock,
  Shield,
  Star
} from 'lucide-react'

export default function PublicFooter() {
  const currentYear = new Date().getFullYear()

  const quickLinks = [
    { name: 'Alojamientos', href: '/accommodations' },
    { name: 'Actividades', href: '/activities' },
    { name: 'Paquetes', href: '/packages' },
    { name: 'Shuttle Service', href: '/shuttle' },
  ]

  const companyLinks = [
    { name: 'Sobre Nosotros', href: '/about' },
    { name: 'Contacto', href: '/contact' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Términos y Condiciones', href: '/terms' },
  ]

  const socialLinks = [
    { name: 'Facebook', href: '#', icon: Facebook },
    { name: 'Instagram', href: '#', icon: Instagram },
    { name: 'Twitter', href: '#', icon: Twitter },
  ]

  const features = [
    { icon: Calendar, text: 'Reservas Online 24/7' },
    { icon: Clock, text: 'Atención Personalizada' },
    { icon: Shield, text: 'Reservas Seguras' },
    { icon: Star, text: 'Experiencias Únicas' },
  ]

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Company Info */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center space-x-3 mb-6">
              <Image
                src="/logo.png"
                alt="Antigua Hotels Tours"
                width={50}
                height={50}
                className="rounded-lg"
              />
              <div>
                <h3 className="text-xl font-bold">Antigua Hotels Tours</h3>
                <p className="text-gray-400 text-sm">
                  Experiencias únicas en Guatemala
                </p>
              </div>
            </Link>
            
            <p className="text-gray-400 mb-6 leading-relaxed">
              Descubre la belleza de Guatemala con nuestras experiencias 
              auténticas de alojamiento, actividades y aventuras inolvidables.
            </p>

            {/* Features */}
            <div className="space-y-3">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <feature.icon className="h-5 w-5 text-emerald-400" />
                  <span className="text-gray-300 text-sm">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Servicios</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-gray-400 hover:text-emerald-400 transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Empresa</h4>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-gray-400 hover:text-emerald-400 transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Contacto</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-emerald-400 mt-1" />
                <div>
                  <p className="text-gray-300">+502 1234-5678</p>
                  <p className="text-gray-400 text-sm">Lunes - Viernes 8:00 - 18:00</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-emerald-400 mt-1" />
                <div>
                  <p className="text-gray-300">info@antiguahotelstours.com</p>
                  <p className="text-gray-400 text-sm">Respuesta en 24 horas</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-emerald-400 mt-1" />
                <div>
                  <p className="text-gray-300">Antigua Guatemala</p>
                  <p className="text-gray-400 text-sm">Sacatepéquez, Guatemala</p>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="mt-6">
              <h5 className="text-sm font-semibold text-gray-300 mb-3">Síguenos</h5>
              <div className="flex space-x-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    className="text-gray-400 hover:text-emerald-400 transition-colors duration-200"
                    aria-label={social.name}
                  >
                    <social.icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © {currentYear} Antigua Hotels Tours. Todos los derechos reservados.
            </div>
            <div className="flex items-center space-x-6 text-sm">
              <Link 
                href="/privacy" 
                className="text-gray-400 hover:text-emerald-400 transition-colors duration-200"
              >
                Política de Privacidad
              </Link>
              <Link 
                href="/terms" 
                className="text-gray-400 hover:text-emerald-400 transition-colors duration-200"
              >
                Términos de Uso
              </Link>
              <span className="text-gray-400">
                Hecho con ❤️ en Guatemala
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
