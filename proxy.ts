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
        // Strict guard: require active token for all app routes
        return !!token
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
