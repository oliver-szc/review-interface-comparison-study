'use client';

import { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';

// Quick-jump navigation destinations visible in the debug console
const JUMP_ROUTES = [
  { label: 'Page 1: Landing', path: '/' },
  { label: 'Page 2: Consent', path: '/study/consent' },
  { label: 'Page 3: Demographics', path: '/study/demographics' },
  { label: 'Page 4: Experience / ATI', path: '/study/experience' },
  { label: 'Page 5: Tutorial Preface', path: '/study/tutorial/preface' },
  { label: 'Page 6: Tutorial Condition', path: '/study/tutorial/condition' },
  { label: 'Page 7: Tutorial Check (S2)', path: '/study/tutorial/check' },
  { label: 'Page 7.1: Tutorial Alternative Explanation', path: '/study/tutorial/alternative' },
  { label: 'Block 1 / Reviews Only: Preface', path: '/study/blocks/1/preface' },
  { label: 'Block 1 / Reviews Only: Task', path: '/study/blocks/1/task' },
  { label: 'Block 1 / Reviews Only: Post', path: '/study/blocks/1/post' },
  { label: 'Block 2 / Dashboard:    Preface', path: '/study/blocks/2/preface' },
  { label: 'Block 2 / Dashboard:    Task', path: '/study/blocks/2/task' },
  { label: 'Block 2 / Dashboard:    Post', path: '/study/blocks/2/post' },
  { label: 'Block 3 / Chatbot:      Preface', path: '/study/blocks/3/preface' },
  { label: 'Block 3 / Chatbot:      Task', path: '/study/blocks/3/task' },
  { label: 'Block 3 / Chatbot:      Post', path: '/study/blocks/3/post' },
  { label: 'Page 18: Preferences', path: '/study/preferences' },
  { label: 'Page 19: Debrief', path: '/debrief' },
  // --- Screening Out Sites ---
  { label: 'Screening: Mobile Device Detected', path: '/screening/mobile' },
  { label: 'Screening: Low English Proficiency', path: '/screening/english' },
  { label: 'Screening: Attention Check Failed', path: '/screening/attention' },
  { label: 'Screening: Comprehension Check Failed', path: '/screening/comprehension' },
  // --- Interactive Views ---
  { label: 'Interactive: Unassisted Reviews', path: '/study/unassisted' },
  { label: 'Interactive: AI Chatbot Reviews', path: '/study/chatbot' },
  { label: 'Interactive: Data Dashboard Reviews', path: '/study/dashboard' },
];

const PRODUCT_SEQUENCES = [
  { label: 'E, K, S (Earbuds, Kettle, Sweatshirt)', value: 'E,K,S' },
  { label: 'E, S, K (Earbuds, Sweatshirt, Kettle)', value: 'E,S,K' },
  { label: 'K, E, S (Kettle, Earbuds, Sweatshirt)', value: 'K,E,S' },
  { label: 'K, S, E (Kettle, Sweatshirt, Earbuds)', value: 'K,S,E' },
  { label: 'S, E, K (Sweatshirt, Earbuds, Kettle)', value: 'S,E,K' },
  { label: 'S, K, E (Sweatshirt, Kettle, Earbuds)', value: 'S,K,E' },
];

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

export function DebugConsole() {
  const pathname = usePathname();
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [currentPath, setCurrentPath] = useState('');
  const [productSequence, setProductSequence] = useState('E,K,S');
  const consoleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Sync ?debug= query param first (allows enabling/disabling without a full reload)
    const params = new URLSearchParams(window.location.search);
    if (params.get('debug') === 'true') {
      localStorage.setItem('STUDY_DEBUG_MODE', 'true');
      fetch('/api/debug/activate', { method: 'POST' }).catch(console.error);
    } else if (params.get('debug') === 'false') {
      localStorage.removeItem('STUDY_DEBUG_MODE');
      fetch('/api/debug/exit', { method: 'POST' }).catch(console.error);
    }
    // Re-read localStorage on every client-side navigation
    const flag = localStorage.getItem('STUDY_DEBUG_MODE');
    setIsDebugMode(flag === 'true');
    setCurrentPath(window.location.pathname);

    // Read initial product sequence
    const savedSeq = localStorage.getItem('debugProductSequence') || getCookie('debugProductSequence') || 'E,K,S';
    setProductSequence(savedSeq);
  }, [pathname]);

  useEffect(() => {
    const handleResize = () => {
      if (isDebugMode && consoleRef.current) {
        const height = consoleRef.current.offsetHeight;
        document.documentElement.style.setProperty('--debug-height', `${height}px`);
      } else {
        document.documentElement.style.setProperty('--debug-height', '0px');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof window !== 'undefined' && window.ResizeObserver && consoleRef.current) {
      resizeObserver = new window.ResizeObserver(handleResize);
      resizeObserver.observe(consoleRef.current);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      document.documentElement.style.setProperty('--debug-height', '0px');
    };
  }, [isDebugMode]);

  if (!isDebugMode) return null;

  const handleJump = (path: string) => {
    // Use hard navigation to avoid fighting with NavigationBlocker's history.pushState
    window.location.href = path;
  };

  const handleProductSequenceChange = (newSeq: string) => {
    setProductSequence(newSeq);
    localStorage.setItem('debugProductSequence', newSeq);
    document.cookie = `debugProductSequence=${newSeq}; path=/; max-age=${60 * 60 * 8}`;
    window.location.reload();
  };

  const handleExitDebug = () => {
    localStorage.removeItem('STUDY_DEBUG_MODE');
    localStorage.removeItem('debugProductSequence');
    document.cookie = 'debugProductSequence=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    // Also tell the server to clear the debug cookie
    fetch('/api/debug/exit', { method: 'POST' }).finally(() => {
      window.location.href = '/';
    });
  };

  return (
    // Static bottom bar, beneath the study layout
    <div
      ref={consoleRef}
      className="w-full bg-slate-900 text-white text-xs flex flex-col border-t border-slate-700 shrink-0"
      role="complementary"
      aria-label="Debug console"
    >
      {/* Top row: status indicators */}
      <div className="flex items-center justify-between gap-4 px-4 py-1.5 border-b border-slate-700 font-mono">
        <div className="flex items-center gap-5">
          <span className="text-red-400 font-bold text-sm">🛠 DEBUG MODE</span>
          <span className="text-slate-400">
            VP: <span className="text-green-400">debug-participant (static)</span>
          </span>
          <span className="text-slate-400">
            Sequence:{' '}
            <span className="text-yellow-300">
              B1=BASELINE/{productSequence.split(',')[0]} · B2=DASHBOARD/{productSequence.split(',')[1]} · B3=CHATBOT/{productSequence.split(',')[2]}
            </span>
          </span>
          <span className="text-slate-400">
            DB Writes: <span className="text-orange-400 font-bold">MOCKED</span>
          </span>
        </div>
        <span className="text-slate-500">path: {currentPath}</span>
      </div>

      {/* Bottom row: quick-jump router + sequence changer + exit button */}
      <div className="flex items-center gap-3 px-4 py-1.5">
        <span className="text-slate-400 shrink-0">Quick Jump:</span>
        <select
          id="debug-quick-jump"
          className="flex-1 bg-slate-800 border border-slate-600 rounded px-2 py-0.5 text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
          onChange={(e) => { if (e.target.value) handleJump(e.target.value); }}
          value=""
        >
          <option value="" disabled>Select a page...</option>
          {JUMP_ROUTES.map((r) => (
            <option key={r.path} value={r.path}>{r.label}</option>
          ))}
        </select>

        <span className="text-slate-400 shrink-0 ml-2">Product Sequence:</span>
        <select
          id="debug-product-sequence"
          className="bg-slate-800 border border-slate-600 rounded px-2 py-0.5 text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
          value={productSequence}
          onChange={(e) => handleProductSequenceChange(e.target.value)}
        >
          {PRODUCT_SEQUENCES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        <button
          onClick={handleExitDebug}
          className="shrink-0 bg-red-600 hover:bg-red-700 px-3 py-1 rounded font-semibold transition-colors"
        >
          Exit Debug
        </button>
      </div>
    </div>
  );
}
