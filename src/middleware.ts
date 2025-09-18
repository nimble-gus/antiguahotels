import { withAuth } from 'next-auth/middleware'

export default withAuth(
  function middleware(req) {
    // Add any additional middleware logic here
    console.log('Middleware executed for:', req.nextUrl.pathname)
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access if user has a valid token
        if (token) return true
        
        // Allow access to auth pages
        if (req.nextUrl.pathname.startsWith('/auth')) return true
        
        return false
      }
    },
  }
)

export const config = {
  matcher: ['/dashboard/:path*', '/api/dashboard/:path*']
}
