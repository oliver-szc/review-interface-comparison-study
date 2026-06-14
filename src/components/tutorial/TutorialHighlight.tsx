'use client';

import { ReactNode } from 'react';

interface TutorialHighlightProps {
  active: boolean;
  children: ReactNode;
  roundedClass?: string;
  className?: string;
  insetClass?: string;
}

export function TutorialHighlight({
  active,
  children,
  roundedClass = 'rounded-lg',
  className = '',
  insetClass = 'inset-0',
}: TutorialHighlightProps) {
  return (
    <div className={`relative ${className}`}>
      {children}
      {active && (
        <div
          className={`absolute z-50 pointer-events-none overflow-hidden ${insetClass} ${roundedClass}`}
        >
          {/* Subtle violet border pulse to outline the target */}
          <div
            className={`absolute inset-0 border-2 border-violet-500/60 animate-pulse ${roundedClass}`}
          />
          {/* Sweeping violet gradient wave (shimmer) */}
          <div
            className="absolute top-0 bottom-0 w-[50%] bg-gradient-to-r from-transparent via-violet-400/20 to-transparent animate-shimmer"
            style={{ filter: 'blur(3px)' }}
          />
        </div>
      )}
    </div>
  );
}
