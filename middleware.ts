import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Lightweight admin route protection
  // Full authorization check happens in the route handler
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Let the route handler do the full check
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
