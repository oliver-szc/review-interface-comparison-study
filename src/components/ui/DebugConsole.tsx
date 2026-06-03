'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

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
  { label: 'Block 1: Preface', path: '/study/blocks/1/preface' },
  { label: 'Block 1: Task', path: '/study/blocks/1/task' },
  { label: 'Block 1: Post', path: '/study/blocks/1/post' },
  { label: 'Block 2: Preface', path: '/study/blocks/2/preface' },
  { label: 'Block 2: Task', path: '/study/blocks/2/task' },
  { label: 'Block 2: Post', path: '/study/blocks/2/post' },
  { label: 'Block 3: Preface', path: '/study/blocks/3/preface' },
  { label: 'Block 3: Task', path: '/study/blocks/3/task' },
  { label: 'Block 3: Post', path: '/study/blocks/3/post' },
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

export function DebugConsole() {
  const router = useRouter();
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [currentPath, setCurrentPath] = useState('');
  const consoleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if debug mode is enabled via localStorage
    const flag = localStorage.getItem('STUDY_DEBUG_MODE');
    setIsDebugMode(flag === 'true');
    setCurrentPath(window.location.pathname);
  }, []);

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
    router.push(path);
    setCurrentPath(path);
  };

  const handleExitDebug = () => {
    localStorage.removeItem('STUDY_DEBUG_MODE');
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
            Sequence: <span className="text-yellow-300">B1=BASELINE/E · B2=DASHBOARD/K · B3=CHATBOT/S</span>
          </span>
          <span className="text-slate-400">
            DB Writes: <span className="text-orange-400 font-bold">MOCKED</span>
          </span>
        </div>
        <span className="text-slate-500">path: {currentPath}</span>
      </div>

      {/* Bottom row: quick-jump router + exit button */}
      <div className="flex items-center gap-3 px-4 py-1.5">
        <span className="text-slate-400 shrink-0">Quick Jump:</span>
        <select
          id="debug-quick-jump"
          className="flex-1 bg-slate-800 border border-slate-600 rounded px-2 py-0.5 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          onChange={(e) => { if (e.target.value) handleJump(e.target.value); }}
          value=""
        >
          <option value="" disabled>Select a page...</option>
          {JUMP_ROUTES.map((r) => (
            <option key={r.path} value={r.path}>{r.label}</option>
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
