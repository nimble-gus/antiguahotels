'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Hotel,
  Calendar,
  MapPin,
  Package,
  Users,
  Settings,
  BarChart3,
  Image as ImageIcon,
  CreditCard,
  LogOut,
  ExternalLink,
  Shield,
  Zap
} from 'lucide-react'
import { signOut } from 'next-auth/react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Reservaciones', href: '/dashboard/reservations', icon: Calendar },
  { name: 'Reservaciones Externas', href: '/dashboard/external-bookings', icon: ExternalLink },
  { name: 'Bloques de Disponibilidad', href: '/dashboard/availability-blocks', icon: Shield },
  { name: 'Hoteles', href: '/dashboard/hotels', icon: Hotel },
  { name: 'Actividades', href: '/dashboard/activities', icon: MapPin },
  { name: 'Paquetes', href: '/dashboard/packages', icon: Package },
  { name: 'Shuttle Service', href: '/dashboard/shuttle', icon: MapPin },
  { name: 'Huéspedes', href: '/dashboard/guests', icon: Users },
  { name: 'Pagos', href: '/dashboard/payments', icon: CreditCard },
  { name: 'Gestión de Imágenes', href: '/dashboard/images', icon: ImageIcon },
  { name: 'Imágenes del Sitio', href: '/dashboard/website-images', icon: ImageIcon },
  { name: 'Imágenes Habitaciones', href: '/dashboard/room-types/images', icon: ImageIcon },
  { name: 'Usuarios Admin', href: '/dashboard/admin-users', icon: Users },
  { name: 'Integración Booking.com', href: '/dashboard/integration', icon: Zap },
  { name: 'Reportes', href: '/dashboard/reports', icon: BarChart3 },
  { name: 'Configuración', href: '/dashboard/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200">
      <div className="flex h-16 items-center justify-center border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">Antigua Hotels</h1>
      </div>
      
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <item.icon
                className={cn(
                  'mr-3 h-5 w-5 flex-shrink-0',
                  isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                )}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-gray-200 p-3">
        <button
          onClick={() => signOut({ callbackUrl: '/auth/signin' })}
          className="group flex w-full items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <LogOut className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500" />
          Cerrar Sesión
        </button>
      </div>
    </div>
  )
}
