'use client';

import { ReactNode } from 'react';

interface TutorialOverlayProps {
  isVisible: boolean;
  content: ReactNode;
  onContinue?: () => void;
  requiresAction?: string; // If set, the Continue button is hidden and clicks pass through the backdrop
  position?: 'center';
  transitionState?: 'idle' | 'cooldown' | 'fading';
  transitionDuration?: number; // duration of transition in milliseconds
}

export function TutorialOverlay({
  isVisible,
  content,
  onContinue,
  requiresAction,
  transitionState = 'idle',
  transitionDuration = 4000,
}: TutorialOverlayProps) {
  if (!isVisible && transitionState === 'idle') return null;

  // Determine positioning
  let positionClasses = 'items-center justify-center';

  const isBlurred = transitionState === 'fading' || (!requiresAction && transitionState === 'idle');

  return (
    <div
      className={`fixed inset-0 z-[100] flex ${positionClasses} transition-opacity duration-300 ${requiresAction ? 'pointer-events-none' : 'pointer-events-auto'
        }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          transition: `backdrop-filter ${transitionState === 'fading' ? transitionDuration : 300}ms ease-in-out, -webkit-backdrop-filter ${transitionState === 'fading' ? transitionDuration : 300}ms ease-in-out, background-color ${transitionState === 'fading' ? transitionDuration : 300}ms ease-in-out`,
          backgroundColor: isBlurred ? 'rgba(15, 23, 42, 0.05)' : 'rgba(0, 0, 0, 0)',
          backdropFilter: isBlurred ? 'blur(3px)' : 'blur(0px)',
          WebkitBackdropFilter: isBlurred ? 'blur(3px)' : 'blur(0px)',
        }}
      />

      {/* Tutorial Card */}
      {content && transitionState === 'idle' && (
        <div
          className={`relative bg-white rounded-xl shadow-2xl border border-sky-100 md:p-6 max-w-2xl w-full pointer-events-auto animate-in fade-in zoom-in-95 duration-300`}
        >
          {/* Content */}
          <div className="prose prose-slate max-w-none">
            {content}
          </div>

          {/* Action / Continue Area */}
          <div className="mt-8 flex justify-end items-center">
            {requiresAction ? (
              <div className="flex items-center gap-3 text-sky-700 bg-sky-50 px-4 py-2 rounded-lg border border-sky-100">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
                </span>
                <span className="text-sm font-medium">Waiting for action...</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={onContinue}
                className="px-6 py-3 !mt-[-10px] bg-sky-800 hover:bg-sky-900 text-white font-semibold rounded-lg shadow-sm transition-colors text-base"
              >
                Continue
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
