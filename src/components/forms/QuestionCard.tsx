'use client';

import { ReactNode } from 'react';
import { FieldError } from 'react-hook-form';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface QuestionCardProps {
  question: string | ReactNode;
  description?: string;
  error?: FieldError;
  children: ReactNode;
  required?: boolean;
  className?: string;
}

export function QuestionCard({
  question,
  description,
  error,
  children,
  required = true,
  className,
}: QuestionCardProps) {
  // If there's a React Hook Form error, we highlight the card
  const hasError = !!error;

  return (
    <div
      className={cn(
        "bg-white px-6 py-4 rounded-lg shadow-sm border transition-colors duration-200 mt-8 mb-8",
        hasError ? "!border-2 !border-red-500 !ring-2 !ring-red-100" : "border-slate-200",
        className
      )}
    >
      <div className="flex flex-col gap-3">
        <div className="text-base font-semibold text-slate-900 w-full">
          {question}
          {required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
        </div>

        {description && (
          <p className="text-sm text-slate-500 -mt-1 mb-1">{description}</p>
        )}

        <div className="w-full">
          {children}
        </div>

        {/* Accessible error message */}
        {hasError && (
          <div role="alert" className="text-red-600 text-sm font-medium mt-1 flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" aria-hidden="true">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            <span>Please answer this question</span>
          </div>
        )}
      </div>
    </div>
  );
}
