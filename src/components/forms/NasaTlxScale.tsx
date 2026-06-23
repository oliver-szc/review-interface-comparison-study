'use client';

import { forwardRef } from 'react';
import { UseFormRegisterReturn, FieldError } from 'react-hook-form';

interface NasaTlxScaleProps {
  /** Display name of the dimension, e.g. "Mental Demand" */
  name: string;
  /** The question text shown to the right of the name */
  question: string;
  registration: UseFormRegisterReturn;
  required?: boolean;
  error?: FieldError;
}

const SCALE_LENGTH = 20;

/**
 * NASA-TLX 20-step bipolar scale.
 *
 * Layout:
 *   Mental Demand                How mentally demanding was the task?
 *   ┌────────────────────────────────────────────────────────────────┐
 *   │ [ ][ ][ ][ ][ ][ ][ ][ ][ ][ ][ ][ ][ ][ ][ ][ ][ ][ ][ ][ ] │
 *   │ Very Low                                             Very High  │
 *   └────────────────────────────────────────────────────────────────┘
 *
 * - Title + subtitle sit above the card
 * - All 20 boxes are uniform height
 * - Selection highlights the whole box (no circle marker inside)
 */
export const NasaTlxScale = forwardRef<HTMLInputElement, NasaTlxScaleProps>(
  ({ name, question, registration, required = true, error }, ref) => {
    const { ref: formRef, ...restRegistration } = registration;
    const options = Array.from({ length: SCALE_LENGTH }, (_, i) => i + 1);
    const hasError = !!error;

    return (
      <div className="space-y-1">
        {/* Title + question ABOVE the card */}
        <div className="flex items-baseline justify-between gap-4 px-1">
          <span className="text-base font-medium text-slate-600 whitespace-nowrap">{name}</span>
          <span className="text-sm text-slate-800 text-right">{question}</span>
        </div>

        {/* Card */}
        <div
          className={[
            'bg-white px-6 pt-4 pb-1 rounded-lg shadow-xs border transition-colors duration-200',
            hasError ? '!border-2 !border-red-500 !ring-2 !ring-red-100' : 'border-slate-200',
          ].join(' ')}
        >
          {/* Tick-mark ruler + anchors container centered with scroll fallback */}
          <div className="overflow-x-auto py-2">
            <div className="mx-auto w-fit">
              {/* Tick-mark ruler — all boxes same height and 4:3 ratio (width:height) */}
              <div className="flex items-stretch gap-0">
                {options.map((value) => {
                  const id = `${registration.name}-${value}`;

                  return (
                    <label
                      key={value}
                      htmlFor={id}
                      className="flex-none flex flex-col items-center cursor-pointer group"
                    >
                      {/*
                        Box with tick-mark borders, highlighting on hover.
                        Contains a visible radio button with a transparent border when unselected.
                      */}
                      <div
                        className={[
                          'relative w-8 h-6',
                          'border-b border-slate-400',
                          (value !== 1 && value !== 11) ? 'border-l' : '',
                          'flex items-center justify-center transition-colors',
                          'group-hover:bg-slate-100',
                        ].join(' ')}
                      >
                        {/* Custom protruding ticks: 6px beyond top and bottom */}
                        {(value === 1 || value === 11) && (
                          <div className="absolute -top-[9px] -bottom-[0px] left-0 w-[1px] bg-slate-400 pointer-events-none" />
                        )}
                        {value === SCALE_LENGTH && (
                          <div className="absolute -top-[9px] -bottom-[0px] right-0 w-[1px] bg-slate-400 pointer-events-none" />
                        )}

                        {/* Radio button — visible in UI */}
                        <input
                          id={id}
                          type="radio"
                          value={value}
                          required={required}
                          {...restRegistration}
                          ref={(e) => {
                            formRef(e);
                            if (typeof ref === 'function') ref(e);
                            else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = e;
                          }}
                          className="appearance-none h-4 w-4 shrink-0 rounded-full border-0 bg-transparent checked:bg-blue-500 checked:border-1 checked:border-blue-500 checked:ring-2 checked:ring-inset checked:ring-white focus:outline-none cursor-pointer"
                        />
                      </div>
                    </label>
                  );
                })}
              </div>

              {/* Anchor labels */}
              <div className="flex justify-between mt-2 px-0.5">
                <span className="text-xs text-slate-500 font-semibold">Very Low</span>
                <span className="text-xs text-slate-500 font-semibold">Very High</span>
              </div>
            </div>
          </div>
        </div>

        {/* Error message */}
        {hasError && (
          <div role="alert" className="text-red-600 text-sm font-medium flex items-center gap-1.5 px-1">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" aria-hidden="true">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            <span>Please answer this question</span>
          </div>
        )}
      </div>
    );
  }
);

NasaTlxScale.displayName = 'NasaTlxScale';
