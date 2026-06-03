'use client';

import { ReactNode } from 'react';
import { UseFormReturn, FieldValues } from 'react-hook-form';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface QuestionnaireLayoutProps {
  children: ReactNode;
  form: any;
  onSubmit: (data: any) => void;
  submitLabel?: string;
  className?: string;
  hideFooter?: boolean;
}

export function QuestionnaireLayout({
  children,
  form,
  onSubmit,
  submitLabel = 'Continue',
  className,
  hideFooter = false,
}: QuestionnaireLayoutProps) {
  const { formState: { isSubmitting } } = form;

  return (
    <div className={cn(
      "min-h-full bg-slate-50 flex flex-col items-center",
      hideFooter ? "pb-0" : "pb-24"
    )}>
      <form 
        onSubmit={form.handleSubmit(onSubmit)} 
        className={cn("w-full max-w-3xl px-4 pt-12 pb-12 flex flex-col gap-8", className)}
        noValidate // We rely on React Hook Form + Zod, and use :user-invalid for styles
      >
        {children}

        {!hideFooter && (
          <div 
            className="fixed left-0 w-full bg-white border-t border-slate-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40 flex justify-center"
            style={{ bottom: 'var(--debug-height, 0px)' }}
          >
            <div className="w-full max-w-3xl flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Submitting...' : submitLabel}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
