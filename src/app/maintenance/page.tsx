'use client'

import { Clock, Calendar } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

export default function MaintenancePage() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-gradient-to-br from-antigua-purple via-purple-600 to-antigua-pink flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Main Container with Glass Morphism */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 sm:p-12 md:p-16 border border-white/20 shadow-2xl">
          {/* Icon */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 rounded-full blur-xl animate-pulse"></div>
              <div className="relative bg-white/20 rounded-full p-6">
                <Clock className="h-16 w-16 sm:h-20 sm:w-20 text-white" />
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
            <span className="bg-gradient-to-r from-white via-yellow-200 to-white bg-clip-text text-transparent">
              Volvemos Pronto
            </span>
          </h1>

          {/* Description */}
          <div className="bg-white/5 rounded-2xl p-6 sm:p-8 mb-8 border border-white/10">
            <p className="text-base sm:text-lg text-white/80 mb-4 leading-relaxed">
              Lamentamos las molestias. Estamos trabajando para mejorar nuestra plataforma y 
              pronto estaremos de vuelta con nuevas funcionalidades y mejoras.
            </p>
            <p className="text-base sm:text-lg text-white/80 leading-relaxed">
              Agradecemos tu paciencia y comprensión.
            </p>
          </div>

          {/* Estimated Time */}
          <div className="bg-yellow-300/20 rounded-xl p-4 border border-yellow-300/30">
            <div className="flex items-center justify-center gap-2 text-yellow-200 mb-2">
              <Calendar className="h-5 w-5" />
              <p className="font-semibold">Próximamente</p>
            </div>
            <p className="text-white/90 text-sm">
            ¡Gracias por tu paciencia!
            </p>
          </div>
        </div>

        {/* Footer Note */}
        <p className="mt-8 text-white/60 text-sm">
          © {new Date().getFullYear()} Antigua Hotels Tours. Todos los derechos reservados.
        </p>
      </div>
    </div>
  )
}

