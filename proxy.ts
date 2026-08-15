import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

const SECRET = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || 'onm-bu-dashboard-vp-secret-2026-key'

export default withAuth(
  function middleware(req) {
    return NextResponse.next()
  },
  {
    secret: SECRET,
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
          return false
        }

        if (path.startsWith('/admin') && role === 'Viewer') {
          return false
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
