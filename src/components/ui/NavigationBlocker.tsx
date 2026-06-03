'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';

export function NavigationBlocker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const lockedUrlRef = useRef<string>('');

  useEffect(() => {
    // Reconstruct the exact path they are on
    const search = searchParams.toString();
    lockedUrlRef.current = search ? `${pathname}?${search}` : pathname;

    // Push a slightly deeper buffer (two states) to absorb rapid double-clicks
    window.history.pushState(window.history.state, '', lockedUrlRef.current);
    window.history.pushState(window.history.state, '', lockedUrlRef.current);

    const handlePopState = () => {
      // 1. Refill the native history trap so they can't exhaust it
      window.history.pushState(window.history.state, '', lockedUrlRef.current);
      
      // 2. Force Next.js router to stay on the locked URL.
      // This catches the case where a rapid double-click bypassed the buffer
      // and Next.js started routing back to a previous page (like the start screen).
      router.replace(lockedUrlRef.current);
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [pathname, searchParams, router]);

  return null;
}
