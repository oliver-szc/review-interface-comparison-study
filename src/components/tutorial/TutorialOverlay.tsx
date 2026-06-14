'use client';

import { ReactNode } from 'react';

interface TutorialOverlayProps {
  isVisible: boolean;
  content: ReactNode;
  onContinue?: () => void;
  requiresAction?: string; // If set, the Continue button is hidden and clicks pass through the backdrop
  position?: 'center' | 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  transitionState?: 'idle' | 'cooldown' | 'fading';
}

export function TutorialOverlay({
  isVisible,
  content,
  onContinue,
  requiresAction,
  position = 'center',
  transitionState = 'idle',
}: TutorialOverlayProps) {
  if (!isVisible && transitionState === 'idle') return null;

  // Determine positioning classes
  let positionClasses = 'items-center justify-center';
  if (position === 'bottom-left') positionClasses = 'items-end justify-start p-8';
  if (position === 'bottom-right') positionClasses = 'items-end justify-end p-8';
  if (position === 'top-left') positionClasses = 'items-start justify-start p-8 mt-20';
  if (position === 'top-right') positionClasses = 'items-start justify-end p-8 mt-20';

  return (
    <div
      className={`fixed inset-0 z-[100] flex ${positionClasses} transition-opacity duration-300 ${requiresAction ? 'pointer-events-none' : 'pointer-events-auto'
        }`}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 transition-all ${transitionState === 'fading'
            ? 'duration-[2000ms] ease-in-out bg-slate-900/5 backdrop-blur-[3px] pointer-events-none'
            : transitionState === 'cooldown' || requiresAction
              ? 'duration-300 bg-transparent backdrop-blur-none pointer-events-none'
              : 'duration-300 bg-slate-900/5 backdrop-blur-[3px] pointer-events-auto'
          }`}
      />

      {/* Tutorial Card */}
      {content && transitionState === 'idle' && (
        <div
          className={`relative bg-white rounded-xl shadow-2xl border border-sky-100 p-8 md:p-10 max-w-2xl w-full pointer-events-auto animate-in fade-in zoom-in-95 duration-300`}
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
                className="px-6 py-3 bg-sky-800 hover:bg-sky-900 text-white font-semibold rounded-lg shadow-sm transition-colors text-base"
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
