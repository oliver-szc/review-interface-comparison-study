import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  // Allow the consent page and the api route for consent
  if (
    request.nextUrl.pathname === '/study/consent' ||
    request.nextUrl.pathname === '/api/study/consent'
  ) {
    return NextResponse.next();
  }

  // Debug mode bypass: if the debugMode cookie is set, skip all auth and routing checks
  const debugMode = request.cookies.get('debugMode');
  if (debugMode?.value === 'true') {
    // Still forward the current path header so layout components can read it
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-current-path', request.nextUrl.pathname);
    requestHeaders.set('x-debug-mode', 'true');

    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  // Check for the participantId cookie
  const participantId = request.cookies.get('participantId');

  if (!participantId) {
    // Redirect to landing page if there's no session
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Clone the request headers and set a new header `x-current-path`
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-current-path', request.nextUrl.pathname);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// Protect all /study routes and /api/study routes (except the ones we explicitly allowed)
export const config = {
  matcher: ['/study/:path*', '/api/study/:path*'],
};

