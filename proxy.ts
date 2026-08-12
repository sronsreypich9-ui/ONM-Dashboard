import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        // Allow API routes to return JSON instead of being redirected to /login HTML page
        if (req.nextUrl.pathname.startsWith('/api/')) {
          return true
        }
        return !!token
      },
    },
    pages: {
      signIn: '/login',
    },
  }
)

// Protect all web routes except login, NextAuth API routes, and static assets
export const config = {
  matcher: [
    '/((?!login|api/auth|_next/static|_next/image|favicon.ico|public).*)',
  ],
}
