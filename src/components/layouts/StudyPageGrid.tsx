import { ReactNode } from 'react';

interface StudyPageGridProps {
  children: ReactNode;
  header?: ReactNode;
}

/**
 * Generic page layout for study pages (non-webshop).
 * Uses a .page-content block (max-width: 900px, centered with fluid padding)
 * for a comfortable reading width.
 *
 * Usage: wrap page content directly — replaces the old
 * 3-column CSS grid pattern.
 */
export function StudyPageGrid({ children, header }: StudyPageGridProps) {
  return (
    <div className="min-h-full bg-slate-50 flex flex-col">
      {header && <header className="shrink-0">{header}</header>}
      <div className="flex-1 flex flex-col py-8 md:py-12">
        {/* Spacer to push content to center, shrinks to 0 if overflow */}
        <div className="flex-grow"></div>
        <div className="page-content w-full shrink-0">
          {children}
        </div>
        {/* Spacer to push content to center, shrinks to 0 if overflow */}
        <div className="flex-grow"></div>
      </div>
    </div>
  );
}
