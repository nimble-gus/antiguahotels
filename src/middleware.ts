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

// Middleware principal que maneja modo mantenimiento
function maintenanceMiddleware(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl

  // Verificar modo de mantenimiento
  if (isMaintenanceMode()) {
    // Si la ruta no está permitida, redirigir a mantenimiento
    if (!isAllowedPath(pathname)) {
      if (pathname !== '/maintenance') {
        return NextResponse.redirect(new URL('/maintenance', request.url))
      }
    }
  }

  return null
}

// Middleware con withAuth para rutas protegidas
export default withAuth(
  function middleware(req) {
    const request = req as NextRequest
    const { pathname } = request.nextUrl

    // Primero verificar modo mantenimiento
    const maintenanceResponse = maintenanceMiddleware(request)
    if (maintenanceResponse) {
      return maintenanceResponse
    }

    // Si llegamos aquí, continuar normalmente
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname

        // Verificar modo mantenimiento
        if (isMaintenanceMode()) {
          // Si la ruta está permitida en modo mantenimiento
          if (isAllowedPath(pathname)) {
            // Si es una ruta protegida, verificar token
            if (isProtectedRoute(pathname)) {
              return !!token
            }
            // Otras rutas permitidas (como /maintenance, /auth) están permitidas
            return true
          }
          // Rutas no permitidas se redirigen en maintenanceMiddleware
          // Permitir que el middleware continúe para hacer la redirección
          return true
        }

        // Si no hay modo mantenimiento, verificar autenticación para rutas protegidas
        if (isProtectedRoute(pathname)) {
          return !!token
        }

        // Permitir acceso a rutas públicas y páginas de auth
        if (pathname.startsWith('/auth')) {
          return true
        }

        // Permitir todas las demás rutas públicas
        return true
      }
    },
    pages: {
      signIn: '/auth/signin',
    }
  }
)

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
