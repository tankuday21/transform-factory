import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the response for the next action
  const response = NextResponse.next()

  // Add CORS headers
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
  
  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  
  // Add cache control for converted files
  if (request.nextUrl.pathname.startsWith('/api/convert')) {
    // Don't cache API responses
    response.headers.set('Cache-Control', 'no-store, max-age=0')
  }

  return response
}

// Apply middleware to API routes only
export const config = {
  matcher: '/api/:path*',
} 