'use client'

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
import { useLanguage } from '@/contexts/LanguageContext'
import { useFooterSettings } from '@/hooks/useFooterSettings'

export default function PublicFooter() {
  const { t } = useLanguage()
  const { settings, loading } = useFooterSettings()
  const currentYear = new Date().getFullYear()

  const quickLinks = [
    { name: t('header.accommodations'), href: '/accommodations' },
    { name: t('header.activities'), href: '/activities' },
    { name: t('header.packages'), href: '/packages' },
    { name: t('header.shuttle'), href: '/shuttle' },
  ]

  const companyLinks = [
    { name: t('footer.about_us'), href: '/about' },
    { name: t('footer.contact_us'), href: '/contact' },
    { name: t('footer.faq'), href: '/faq' },
    { name: t('footer.terms'), href: '/terms' },
  ]

  const socialLinks = [
    { name: 'Facebook', href: settings.facebook_url || '#', icon: Facebook },
    { name: 'Instagram', href: settings.instagram_url || '#', icon: Instagram },
    { name: 'Twitter', href: settings.twitter_url || '#', icon: Twitter },
  ]

  const features = [
    { icon: Calendar, text: t('footer.features.online_booking') },
    { icon: Clock, text: t('footer.features.personalized') },
    { icon: Shield, text: t('footer.features.secure') },
    { icon: Star, text: t('footer.features.unique') },
  ]

  // Mostrar loading si las configuraciones aún se están cargando
  if (loading) {
    return (
      <footer className="bg-white text-gray-900">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-antigua-purple mr-3"></div>
            <span className="text-gray-600">Cargando...</span>
          </div>
        </div>
      </footer>
    )
  }

  return (
    <footer className="bg-white text-gray-900">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Company Info */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center mb-6">
              <Image
                src="/logo.png"
                alt="Antigua Hotels Tours"
                width={220}
                height={220}
                className="rounded-lg"
              />
            </Link>
            
            <p className="text-gray-600 mb-6 leading-relaxed">
              {settings.description || t('footer.description')}
            </p>

            {/* Features */}
            <div className="space-y-3">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <feature.icon className="h-5 w-5 text-antigua-purple" />
                  <span className="text-gray-700 text-sm">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-gray-900">{t('footer.services')}</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-gray-600 hover:text-antigua-purple transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-gray-900">{t('footer.company')}</h4>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-gray-600 hover:text-antigua-purple transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-gray-900">{t('footer.contact')}</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-antigua-purple mt-1" />
                <div>
                  <p className="text-gray-800">{settings.phone || '+502 1234-5678'}</p>
                  <p className="text-gray-600 text-sm">{settings.phone_hours || t('footer.phone_hours')}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-antigua-purple mt-1" />
                <div>
                  <p className="text-gray-800">{settings.email || 'info@antiguahotelstours.com'}</p>
                  <p className="text-gray-600 text-sm">{settings.email_response || t('footer.email_response')}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-antigua-purple mt-1" />
                <div>
                  <p className="text-gray-800">{settings.address || 'Antigua Guatemala'}</p>
                  <p className="text-gray-600 text-sm">{settings.address_detail || t('footer.location_detail')}</p>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="mt-6">
              <h5 className="text-sm font-semibold text-gray-700 mb-3">{t('footer.follow_us')}</h5>
              <div className="flex space-x-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    className="text-gray-600 hover:text-antigua-purple transition-colors duration-200"
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
      <div className="border-t border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-600 text-sm mb-4 md:mb-0">
              © {currentYear} {settings.company_name || 'Antigua Hotels Tours'}. {settings.copyright || t('footer.all_rights')}
            </div>
            <div className="flex items-center space-x-6 text-sm">
              <Link 
                href="/privacy" 
                className="text-gray-600 hover:text-antigua-purple transition-colors duration-200"
              >
                {t('footer.privacy')}
              </Link>
              <Link 
                href="/terms" 
                className="text-gray-600 hover:text-antigua-purple transition-colors duration-200"
              >
                {t('footer.terms_use')}
              </Link>
              <span className="text-gray-600">
                {settings.made_with_love || t('footer.made_with_love')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
