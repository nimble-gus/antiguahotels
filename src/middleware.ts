import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Verificar si el modo de mantenimiento está activo
function isMaintenanceMode(): boolean {
  const maintenanceMode = process.env.MAINTENANCE_MODE || process.env.SERVICE_PAUSED
  return maintenanceMode === 'true'
}

// Rutas que siempre deben estar disponibles incluso en modo mantenimiento
const allowedPathsInMaintenance = [
  '/maintenance',
  '/dashboard',
  '/auth',
  '/api/auth',
  '/api/dashboard',
]

// Rutas que requieren autenticación
const protectedRoutes = ['/dashboard', '/api/dashboard']

// Verificar si una ruta está permitida en modo mantenimiento
function isAllowedPath(pathname: string): boolean {
  return allowedPathsInMaintenance.some(path => pathname.startsWith(path))
}

// Verificar si una ruta está protegida
function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some(path => pathname.startsWith(path))
}

// Middleware principal
export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Paso 1: Verificar modo de mantenimiento
  if (isMaintenanceMode()) {
    // Si la ruta no está permitida, redirigir a mantenimiento
    if (!isAllowedPath(pathname)) {
      if (pathname !== '/maintenance') {
        return NextResponse.redirect(new URL('/maintenance', request.url))
      }
    }
    
    // Si la ruta está permitida, continuar
    // Pero si es una ruta protegida, aplicar autenticación
    if (isProtectedRoute(pathname)) {
      return withAuth(
        function authMiddleware(req) {
          return NextResponse.next()
        },
        {
          callbacks: {
            authorized: ({ token }) => {
              return !!token
            }
          },
        }
      )(request)
    }
    
    // Para otras rutas permitidas (como /maintenance, /auth), continuar
    return NextResponse.next()
  }

  // Paso 2: Si no hay modo mantenimiento, aplicar autenticación a rutas protegidas
  if (isProtectedRoute(pathname)) {
    return withAuth(
      function authMiddleware(req) {
        return NextResponse.next()
      },
      {
        callbacks: {
          authorized: ({ token, req }) => {
            if (token) return true
            if (req.nextUrl.pathname.startsWith('/auth')) return true
            return false
          }
        },
      }
    )(request)
  }

  // Para todas las demás rutas, continuar normalmente
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
