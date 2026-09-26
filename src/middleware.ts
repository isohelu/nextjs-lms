import { NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  // Generate cryptographic nonce for Content Security Policy (CSP)
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')

  const isDev = process.env.NODE_ENV === 'development'

  // Build Content-Security-Policy directives
  // In development, Next.js requires 'unsafe-eval' for Hot Module Replacement (HMR) and source maps
  const scriptSrc = isDev
    ? `'self' 'unsafe-eval' 'unsafe-inline' https:`
    : `'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-inline' https:`

  const cspHeader = `
    default-src 'self';
    script-src ${scriptSrc};
    style-src 'self' 'unsafe-inline' https://fonts.bunny.net;
    img-src 'self' blob: data: https: https://*.supabase.co https://images.unsplash.com;
    font-src 'self' data: https://fonts.bunny.net;
    connect-src 'self' https://*.supabase.co wss://*.supabase.co;
    frame-src 'self' https://www.youtube.com https://player.vimeo.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
  `.replace(/\s{2,}/g, ' ').trim()

  // Clone request headers and add nonce
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set('Content-Security-Policy', cspHeader)

  // Pass to Supabase session updater
  const modifiedRequest = new NextRequest(request, {
    headers: requestHeaders,
  })

  // Check protected route authentication
  const pathname = request.nextUrl.pathname
  const hasSession = request.cookies.has('mentor_session') || request.cookies.has('demo_user')

  if (!hasSession) {
    if (
      pathname.startsWith('/dashboard') ||
      pathname.startsWith('/admin') ||
      pathname.startsWith('/instructor') ||
      pathname.startsWith('/student')
    ) {
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  let response: NextResponse
  try {
    response = await updateSession(modifiedRequest)
  } catch {
    response = NextResponse.next({
      request: modifiedRequest,
    })
  }

  // Set OWASP Security Headers on response
  response.headers.set('Content-Security-Policy', cspHeader)
  response.headers.set('x-nonce', nonce)
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload'
  )
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=()'
  )

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - assets/ (public static assets like images, icons, logos)
     */
    '/((?!_next/static|_next/image|favicon.ico|assets/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
