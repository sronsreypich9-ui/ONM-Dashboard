import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname
        // Allow login page, auth API routes, static Next.js assets
        if (
          path.startsWith('/login') ||
          path.startsWith('/api/auth') ||
          path.startsWith('/_next') ||
          path.includes('favicon') ||
          path.endsWith('.png') ||
          path.endsWith('.jpg') ||
          path.endsWith('.svg')
        ) {
          return true
        }

        // Must have valid token
        if (!token) return false

        const role = (token as any).role || 'Viewer'

        // Strict RBAC URL guards
        if (path.startsWith('/import') && role !== 'Admin') {
          return false // Restrict /import to Admin only
        }

        if (path.startsWith('/admin') && role === 'Viewer') {
          return false // Restrict /admin data entry from Viewers
        }

        return true
      },
    },
    pages: {
      signIn: '/login',
    },
  }
)

export const config = {
  matcher: [
    '/',
    '/divisions/:path*',
    '/projects/:path*',
    '/memos/:path*',
    '/discord-recap/:path*',
    '/admin/:path*',
    '/import/:path*',
  ],
}
