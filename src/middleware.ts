import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAuth = !!token
    const isAuthPage = req.nextUrl.pathname.startsWith('/auth')
    const isApiRoute = req.nextUrl.pathname.startsWith('/api')

    // Allow API routes and static files
    if (isApiRoute || req.nextUrl.pathname.startsWith('/_next')) {
      return NextResponse.next()
    }

    // Allow root page (landing page)
    if (req.nextUrl.pathname === '/') {
      return NextResponse.next()
    }

    // Redirect authenticated users away from auth pages
    if (isAuth && isAuthPage) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // Redirect unauthenticated users to sign in for protected routes
    if (!isAuth && !isAuthPage && req.nextUrl.pathname !== '/') {
      return NextResponse.redirect(new URL('/auth/signin', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl

        // Allow access to auth pages, API routes, root page, and static files
        if (
          pathname.startsWith('/auth') ||
          pathname.startsWith('/api') ||
          pathname.startsWith('/_next') ||
          pathname === '/' ||
          pathname.startsWith('/favicon')
        ) {
          return true
        }

        // Require authentication for all other routes
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - static assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
