'use client';

import { useEffect, useRef } from 'react';

export function ConnectionMonitor() {
  const offlineSinceRef = useRef<number | null>(null);

  useEffect(() => {
    // 1. Periodic Heartbeat (every 60s)
    const sendHeartbeat = (offlineDurationMs?: number) => {
      fetch('/api/study/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(offlineDurationMs ? { offlineDurationMs } : {}),
        keepalive: true // helps ensure the request fires even if the page is unloading
      }).catch(() => {
        // Ignore fetch errors (e.g. if we are currently offline)
      });
    };

    const intervalId = setInterval(() => sendHeartbeat(), 60000);

    // Initial heartbeat on mount
    sendHeartbeat();

    // 2. Offline/Online Event Listeners
    const handleOffline = () => {
      offlineSinceRef.current = Date.now();
    };

    const handleOnline = () => {
      if (offlineSinceRef.current) {
        const durationMs = Date.now() - offlineSinceRef.current;
        offlineSinceRef.current = null;
        sendHeartbeat(durationMs);
      }
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  return null; // Silent background component
}
