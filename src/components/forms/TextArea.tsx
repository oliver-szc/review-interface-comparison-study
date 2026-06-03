'use client';

import { forwardRef } from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  registration: UseFormRegisterReturn;
  className?: string;
  rows?: number;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ registration, className, rows = 4, ...props }, ref) => {
    
    const { ref: formRef, ...restRegistration } = registration;

    return (
      <textarea
        rows={rows}
        className={cn(
          "w-full rounded-md border border-slate-300 p-3 text-sm shadow-sm",
          "focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none",
          "user-invalid:border-red-500 user-invalid:ring-red-500 user-invalid:ring-1",
          className
        )}
        {...props}
        {...restRegistration}
        ref={(e) => {
          formRef(e);
          if (typeof ref === 'function') ref(e);
          else if (ref) (ref as any).current = e;
        }}
      />
    );
  }
);

TextArea.displayName = 'TextArea';
