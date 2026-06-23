'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';

export function NavigationBlocker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Stable ref — router is a new object on every render in Next.js App Router
  const routerRef = useRef(router);
  useEffect(() => { routerRef.current = router; });

  useEffect(() => {
    // Check client-side debug mode flag to disable blocking
    const isDebug = typeof window !== 'undefined' && localStorage.getItem('STUDY_DEBUG_MODE') === 'true';
    if (isDebug) {
      return;
    }

    const search = searchParams.toString();
    const lockedUrl = search ? `${pathname}?${search}` : pathname;
    const state = window.history.state;

    const handlePopState = () => {
      // Push the state again to keep the user on the current page
      window.history.pushState(state, '', lockedUrl);
      // Keep Next.js router in sync in case it started transitioning
      routerRef.current.replace(lockedUrl);
    };

    // Push an initial state when the component mounts to have something to pop
    window.history.pushState(state, '', lockedUrl);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [pathname, searchParams]);

  return null;
}
