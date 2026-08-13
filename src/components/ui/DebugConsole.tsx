'use client';

import { useEffect, useState, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';

// Static Jump Routes (Blocks are generated dynamically in the component)
const STATIC_JUMP_ROUTES_TOP = [
  { label: 'Page 1: Landing', path: '/' },
  { label: 'Page 2: Consent', path: '/study/consent' },
  { label: 'Page 3: Demographics', path: '/study/demographics' },
  { label: 'Page 4: Experience / ATI', path: '/study/experience' },
  { label: 'Page 5: Tutorial Preface', path: '/study/tutorial/preface' },
  { label: 'Page 6: Tutorial Condition', path: '/study/tutorial/condition' },
  { label: 'Page 7: Tutorial Check (S2)', path: '/study/tutorial/check' },
  { label: 'Page 7.1: Tutorial Alternative Explanation', path: '/study/tutorial/alternative' },
];

const STATIC_JUMP_ROUTES_BOTTOM = [
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

// Condition (assistance) order permutations — B=Baseline, D=Dashboard, C=Chatbot
const CONDITION_SEQUENCES = [
  { label: 'B, D, C (Baseline → Dashboard → Chatbot)', value: 'B,D,C' },
  { label: 'B, C, D (Baseline → Chatbot → Dashboard)', value: 'B,C,D' },
  { label: 'D, B, C (Dashboard → Baseline → Chatbot)', value: 'D,B,C' },
  { label: 'D, C, B (Dashboard → Chatbot → Baseline)', value: 'D,C,B' },
  { label: 'C, B, D (Chatbot → Baseline → Dashboard)', value: 'C,B,D' },
  { label: 'C, D, B (Chatbot → Dashboard → Baseline)', value: 'C,D,B' },
];

const CONDITION_LABELS: Record<string, string> = {
  B: 'Baseline',
  D: 'Dashboard',
  C: 'Chatbot',
};

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

export function DebugConsole() {
  const pathname = usePathname();
  const router = useRouter();
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [currentPath, setCurrentPath] = useState('');
  const [productSequence, setProductSequence] = useState('E,K,S');
  const [assistanceOrder, setAssistanceOrder] = useState('B,D,C');
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
    } else if (localStorage.getItem('STUDY_DEBUG_MODE') === 'true') {
      fetch('/api/debug/activate', { method: 'POST' }).catch(console.error);
    }
    // Re-read localStorage on every client-side navigation
    const flag = localStorage.getItem('STUDY_DEBUG_MODE');
    setIsDebugMode(flag === 'true');
    setCurrentPath(window.location.pathname);

    // Read initial product sequence
    const savedSeq = localStorage.getItem('debugProductSequence') || getCookie('debugProductSequence') || 'E,K,S';
    setProductSequence(savedSeq);
    document.cookie = `debugProductSequence=${savedSeq}; path=/; max-age=${60 * 60 * 8}`;

    // Read initial assistance/condition order
    const savedAssist = localStorage.getItem('debugAssistanceOrder') || getCookie('debugAssistanceOrder') || 'B,D,C';
    setAssistanceOrder(savedAssist);
    document.cookie = `debugAssistanceOrder=${savedAssist}; path=/; max-age=${60 * 60 * 8}`;
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
    // Use hard navigation to bypass Next.js client cache and ensure fresh data
    window.location.href = path;
  };

  const handleProductSequenceChange = (newSeq: string) => {
    setProductSequence(newSeq);
    localStorage.setItem('debugProductSequence', newSeq);
    document.cookie = `debugProductSequence=${newSeq}; path=/; max-age=${60 * 60 * 8}`;
    window.location.reload();
  };

  const handleAssistanceOrderChange = (newOrder: string) => {
    setAssistanceOrder(newOrder);
    localStorage.setItem('debugAssistanceOrder', newOrder);
    document.cookie = `debugAssistanceOrder=${newOrder}; path=/; max-age=${60 * 60 * 8}`;
    window.location.reload();
  };

  const handleExitDebug = () => {
    localStorage.removeItem('STUDY_DEBUG_MODE');
    localStorage.removeItem('debugProductSequence');
    localStorage.removeItem('debugAssistanceOrder');
    document.cookie = 'debugProductSequence=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'debugAssistanceOrder=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    // Also tell the server to clear the debug cookie
    fetch('/api/debug/exit', { method: 'POST' }).finally(() => {
      window.location.href = '/';
    });
  };

  const jumpRoutes = [
    ...STATIC_JUMP_ROUTES_TOP,
    ...assistanceOrder.split(',').flatMap((c, i) => {
      const rawName = CONDITION_LABELS[c] || c;
      const conditionName = rawName === 'Baseline' ? 'Reviews Only' : rawName;
      const blockNum = i + 1;
      return [
        { label: `Block ${blockNum} / ${conditionName}: Preface`, path: `/study/blocks/${blockNum}/preface` },
        { label: `Block ${blockNum} / ${conditionName}: Task`, path: `/study/blocks/${blockNum}/task` },
        { label: `Block ${blockNum} / ${conditionName}: Post`, path: `/study/blocks/${blockNum}/post` },
      ];
    }),
    ...STATIC_JUMP_ROUTES_BOTTOM,
  ];

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
              {assistanceOrder.split(',').map((c, i) => {
                const prod = productSequence.split(',')[i] ?? '?';
                return `B${i + 1}=${CONDITION_LABELS[c] ?? c}/${prod}`;
              }).join(' · ')}
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
          {jumpRoutes.map((r) => (
            <option key={r.path} value={r.path}>{r.label}</option>
          ))}
        </select>

        <span className="text-slate-400 shrink-0 ml-2">Product Order:</span>
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

        <span className="text-slate-400 shrink-0 ml-2">Condition Order:</span>
        <select
          id="debug-condition-sequence"
          className="bg-slate-800 border border-slate-600 rounded px-2 py-0.5 text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
          value={assistanceOrder}
          onChange={(e) => handleAssistanceOrderChange(e.target.value)}
        >
          {CONDITION_SEQUENCES.map((s) => (
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
