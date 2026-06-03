'use client';

import { forwardRef } from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface RadioOption {
  value: string | number;
  label: string;
}

interface VerticalRadioGroupProps {
  options: RadioOption[];
  registration: UseFormRegisterReturn;
  className?: string;
  required?: boolean;
}

export const VerticalRadioGroup = forwardRef<HTMLInputElement, VerticalRadioGroupProps>(
  ({ options, registration, className, required = true }, ref) => {
    
    // We omit ref from registration because we pass it directly via forwardRef
    const { ref: formRef, ...restRegistration } = registration;

    return (
      <div className={cn("flex flex-col gap-3", className)}>
        {options.map((option, index) => {
          const id = `${registration.name}-${option.value}`;
          return (
            <label 
              key={id} 
              htmlFor={id}
              className="flex items-start gap-3 py-2.5 px-3 rounded-md border border-slate-200 hover:bg-blue-50/30 hover:border-blue-600 has-[:checked]:border-blue-600 has-[:checked]:bg-blue-50/30 cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2"
            >
              <div className="flex h-6 items-center">
                <input
                  id={id}
                  type="radio"
                  value={option.value}
                  required={required}
                  // We merge the external ref and the react-hook-form ref. 
                  // In typical RHF, passing the registration spread handles the ref.
                  {...restRegistration}
                  ref={(e) => {
                    formRef(e);
                    if (typeof ref === 'function') ref(e);
                    else if (ref) (ref as any).current = e;
                  }}
                  className="h-4 w-4 shrink-0 rounded-full border-slate-300 text-blue-600 focus:ring-blue-600 user-invalid:border-red-500 user-invalid:ring-red-500 cursor-pointer"
                />
              </div>
              <div className="text-sm leading-6">
                <span className="font-medium text-slate-900">{option.label}</span>
              </div>
            </label>
          );
        })}
      </div>
    );
  }
);

VerticalRadioGroup.displayName = 'VerticalRadioGroup';
