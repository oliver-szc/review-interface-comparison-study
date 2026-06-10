import { ReactNode } from 'react';

interface StudyPageGridProps {
  children: ReactNode;
  header?: ReactNode;
}

/**
 * Generic page grid layout for study pages (non-webshop).
 * Uses a 3-column CSS grid where the middle column is constrained
 * by clamp(70ch, 50vw, 100ch) for a comfortable reading width.
 *
 * Usage: wrap page content directly — replaces the old
 * `<main class="min-h-screen flex items-center"><div class="w-[33.333%] mx-auto">` pattern.
 */
export function StudyPageGrid({ children, header }: StudyPageGridProps) {
  return (
    <div className={`grid grid-cols-page min-h-full bg-slate-50 ${header ? 'grid-rows-[max-content_1fr]' : 'grid-rows-[1fr]'}`}>
      {header && <header className="col-span-3">{header}</header>}
      <div className="col-start-2 flex flex-col min-w-0">
        <div className="w-full py-12 my-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
