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

  const lockedUrlRef = useRef<string>('');
  const isRestoringRef = useRef(false);

  useEffect(() => {
    const search = searchParams.toString();
    lockedUrlRef.current = search ? `${pathname}?${search}` : pathname;

    // Push one extra history entry so the first back-press is absorbed without leaving the page
    window.history.pushState(window.history.state, '', lockedUrlRef.current);

    const handlePopState = () => {
      // Guard against re-entrancy: router.replace internally modifies history
      // which can re-trigger popstate in some browsers
      if (isRestoringRef.current) return;
      isRestoringRef.current = true;

      // Re-push so the trap never runs out of buffer entries
      window.history.pushState(window.history.state, '', lockedUrlRef.current);

      // Keep Next.js router in sync with the locked URL
      routerRef.current.replace(lockedUrlRef.current);

      // Release the guard after the current event loop tick
      setTimeout(() => { isRestoringRef.current = false; }, 0);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [pathname, searchParams]); // router intentionally excluded — stabilised via routerRef

  return null;
}
