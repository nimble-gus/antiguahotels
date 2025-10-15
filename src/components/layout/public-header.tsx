'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, Phone, Mail, MapPin, Calendar, Globe, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/contexts/LanguageContext'
import { ServiceSelectionModal } from '@/components/modals/service-selection-modal'

export default function PublicHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLanguageOpen, setIsLanguageOpen] = useState(false)
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false)
  const languageDropdownRef = useRef<HTMLDivElement>(null)
  
  // Usar el contexto de idioma
  const { currentLanguage, setLanguage, t, languages } = useLanguage()

  // Cerrar dropdown cuando se hace clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target as Node)) {
        setIsLanguageOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const navigation = [
    { name: t('header.home'), href: '/' },
    { name: t('header.hotels'), href: '/hotels' },
    { name: t('header.accommodations'), href: '/accommodations' },
    { name: t('header.activities'), href: '/activities' },
    { name: t('header.packages'), href: '/packages' },
    { name: t('header.shuttle'), href: '/shuttle' },
    { name: t('header.contact'), href: '/contact' },
  ]

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-antigua-purple to-antigua-pink text-white py-1 sm:py-2">
        <div className="container mx-auto px-2 sm:px-4">
          {/* Mobile Layout */}
          <div className="flex sm:hidden items-center justify-between text-xs">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <Phone className="h-3 w-3" />
                <span className="truncate">{t('header.phone')}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Mail className="h-3 w-3" />
                <span className="truncate">{t('header.email')}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Mobile Language Selector */}
              <div className="relative" ref={languageDropdownRef}>
                <button
                  onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                  className="flex items-center space-x-1 hover:bg-white hover:bg-opacity-10 px-1 py-1 rounded transition-colors duration-200"
                >
                  <Globe className="h-3 w-3" />
                  <span className="text-xs">
                    {languages.find(lang => lang.code === currentLanguage)?.flag}
                  </span>
                  <ChevronDown className="h-2 w-2" />
                </button>
                
                {/* Mobile Language Dropdown */}
                {isLanguageOpen && (
                  <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[120px] z-50">
                    {languages.map((language) => (
                      <button
                        key={language.code}
                        onClick={() => {
                          setLanguage(language.code)
                          setIsLanguageOpen(false)
                          console.log(`Idioma cambiado a: ${language.name}`)
                        }}
                        className={`w-full text-left px-2 py-1 text-xs hover:bg-gray-50 flex items-center space-x-2 transition-colors duration-200 ${
                          currentLanguage === language.code ? 'bg-antigua-purple bg-opacity-10 text-antigua-purple' : 'text-gray-700'
                        }`}
                      >
                        <span>{language.flag}</span>
                        <span>{language.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden sm:flex flex-col md:flex-row justify-between items-center text-sm">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4 mb-2 md:mb-0">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Phone className="h-4 w-4" />
                  <span>{t('header.phone')}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Mail className="h-4 w-4" />
                  <span>{t('header.email')}</span>
                </div>
              </div>
              
              {/* Desktop Language Selector */}
              <div className="relative" ref={languageDropdownRef}>
                <button
                  onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                  className="flex items-center space-x-1 hover:bg-white hover:bg-opacity-10 px-2 py-1 rounded transition-colors duration-200"
                >
                  <Globe className="h-4 w-4" />
                  <span className="text-sm">
                    {languages.find(lang => lang.code === currentLanguage)?.flag} 
                    <span className="hidden sm:inline">
                      {languages.find(lang => lang.code === currentLanguage)?.name}
                    </span>
                  </span>
                  <ChevronDown className="h-3 w-3" />
                </button>
                
                {/* Desktop Language Dropdown */}
                {isLanguageOpen && (
                  <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[140px] z-50">
                    {languages.map((language) => (
                      <button
                        key={language.code}
                        onClick={() => {
                          setLanguage(language.code)
                          setIsLanguageOpen(false)
                          console.log(`Idioma cambiado a: ${language.name}`)
                        }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2 transition-colors duration-200 ${
                          currentLanguage === language.code ? 'bg-antigua-purple bg-opacity-10 text-antigua-purple' : 'text-gray-700'
                        }`}
                      >
                        <span>{language.flag}</span>
                        <span>{language.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-1">
              <MapPin className="h-4 w-4" />
              <span>{t('header.location')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png"
              alt="Antigua Hotels Tours"
              width={180}
              height={180}
              style={{ height: 'auto' }}
              className="rounded-lg"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-700 hover:text-antigua-purple font-medium transition-colors duration-200"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* CTA Button */}
          <div className="hidden lg:flex items-center space-x-4">
            <Button 
              onClick={() => setIsServiceModalOpen(true)}
              className="bg-antigua-purple hover:bg-antigua-purple-dark text-white"
            >
              <Calendar className="h-4 w-4 mr-2" />
              {t('header.book_now')}
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 rounded-md text-gray-700 hover:text-antigua-purple"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-2 pt-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-700 hover:text-antigua-purple font-medium py-2 px-4 rounded-md hover:bg-gray-50 transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-4">
                <Button 
                  onClick={() => {
                    setIsServiceModalOpen(true)
                    setIsMenuOpen(false)
                  }}
                  className="w-full bg-antigua-purple hover:bg-antigua-purple-dark text-white"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  {t('header.book_now')}
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>

      {/* Service Selection Modal */}
      <ServiceSelectionModal 
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
      />
    </header>
  )
}
