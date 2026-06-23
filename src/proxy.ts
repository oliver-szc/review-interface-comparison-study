import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  // Always set the x-current-path header
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-current-path', request.nextUrl.pathname);

  // Debug mode bypass: if the debugMode cookie is set, skip all auth and routing checks
  const debugMode = request.cookies.get('debugMode');
  if (debugMode?.value === 'true') {
    requestHeaders.set('x-debug-mode', 'true');
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  // Allow the consent page, the api route for consent, and the mobile screening page
  if (
    request.nextUrl.pathname === '/study/consent' ||
    request.nextUrl.pathname === '/api/study/consent' ||
    request.nextUrl.pathname === '/screening/mobile'
  ) {
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  // Check for the participantId cookie
  const participantId = request.cookies.get('participantId');

  if (!participantId) {
    // If it's an API route, return 401 Unauthorized JSON instead of HTML redirect
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Redirect to landing page if there's no session for a normal page
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

// Protect all /study routes, /api/study routes, and /screening routes
export const config = {
  matcher: ['/study/:path*', '/api/study/:path*', '/screening/:path*'],
};
