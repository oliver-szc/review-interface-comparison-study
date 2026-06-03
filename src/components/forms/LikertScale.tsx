'use client';

import { forwardRef } from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LikertScaleProps {
  scaleLength: number;
  labels: { value: number; label: string }[];
  registration: UseFormRegisterReturn;
  className?: string;
  required?: boolean;
}

export const LikertScale = forwardRef<HTMLInputElement, LikertScaleProps>(
  ({ scaleLength, labels, registration, className, required = true }, ref) => {
    
    const { ref: formRef, ...restRegistration } = registration;

    // Create array of values from 1 to scaleLength
    const options = Array.from({ length: scaleLength }, (_, i) => i + 1);

    return (
      <div className={cn("w-full overflow-x-auto px-6 pt-2 pb-5 bg-slate-50/30 rounded-xl border border-slate-200 transition-colors", className)}>
        <div className="min-w-[600px] flex justify-between items-end gap-2">
          {options.map((value) => {
            const id = `${registration.name}-${value}`;
            // Find if there's a specific text label for this value
            const matchingLabel = labels.find(l => l.value === value)?.label;

            return (
              <label 
                key={id}
                htmlFor={id}
                className="flex flex-col items-center gap-3 cursor-pointer group flex-1"
              >
                <div className="h-8 flex items-end text-xs text-center text-slate-500 px-1 leading-tight">
                  {matchingLabel}
                </div>
                
                <div className="relative flex flex-col items-center w-full">
                  {/* Connecting line behind radio buttons */}
                  {value > 1 && (
                    <div className="absolute top-1/2 -left-[50%] right-1/2 h-[2px] bg-slate-200 -z-10 -translate-y-1/2"></div>
                  )}
                  {value < scaleLength && (
                    <div className="absolute top-1/2 left-1/2 -right-[50%] h-[2px] bg-slate-200 -z-10 -translate-y-1/2"></div>
                  )}
                  
                  <div className="bg-white rounded-full p-1 flex items-center justify-center aspect-square group-focus-within:ring-2 group-focus-within:ring-blue-500 group-focus-within:ring-offset-2">
                    <input
                      id={id}
                      type="radio"
                      value={value}
                      required={required}
                      {...restRegistration}
                      ref={(e) => {
                        formRef(e);
                        if (typeof ref === 'function') ref(e);
                        else if (ref) (ref as any).current = e;
                      }}
                      className="h-5 w-5 shrink-0 rounded-full border-slate-300 text-blue-600 focus:ring-0 focus:outline-none user-invalid:border-red-500 user-invalid:ring-red-500 cursor-pointer"
                    />
                  </div>
                </div>
                <div className="text-sm font-medium text-slate-500">
                  {value}
                </div>
              </label>
            );
          })}
        </div>
      </div>
    );
  }
);

LikertScale.displayName = 'LikertScale';
