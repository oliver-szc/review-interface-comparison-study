'use client';

import { useRouter } from 'next/navigation';

const defaultSteps = [
  { label: 'Consent' },
  { label: 'Demographics' },
  { label: 'Unassisted' },
  { label: 'Survey 1' },
  { label: 'Dashboard' },
  { label: 'Survey 2' },
  { label: 'Chatbot' },
  { label: 'Survey 3' },
  { label: 'Final Survey' },
  { label: 'Thank You' },
];

interface Step {
  label: string;
  href?: string;
}

interface ProgressBarProps {
  currentStep: number; // 1-based
  totalSteps: number;
  showLabels?: boolean;
  steps?: Step[];
  onStepSelect?: (index: number, step: Step) => void;
}

export function ProgressBar({ currentStep, totalSteps, showLabels = true, steps, onStepSelect }: ProgressBarProps) {
  const router = useRouter();

  const stepsToRender = steps && steps.length > 0 ? steps : defaultSteps;
  const computedTotal = stepsToRender.length || Math.max(1, totalSteps);
  const safeTotal = Math.max(1, computedTotal);
  const clampedCurrent = Math.min(Math.max(1, currentStep), safeTotal);
  const percentage = Math.min(100, Math.max(0, (clampedCurrent / safeTotal) * 100));

  const handleStepClick = (index: number, step: Step) => {
    onStepSelect?.(index, step);
    if (step.href) {
      router.push(step.href);
    }
  };

  return (
    <div className="w-full space-y-2">
      <div className="h-0.5 rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-gradient-to-r from-amazon-light to-amazon"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {showLabels ? (
        <div className="overflow-x-auto text-[10px] font-medium uppercase tracking-wide text-slate-500 w-full">
          <div className="inline-flex flex-nowrap items-stretch gap-1 pr-1 w-full">
            {stepsToRender.map((step, index) => {
              const isActive = index + 1 === clampedCurrent;
              return (
                <button
                  key={step.label + index}
                  type="button"
                  onClick={() => handleStepClick(index + 1, step)}
                  className={`flex-1 min-w-0 rounded-md border px-2 py-1 text-center leading-tight transition focus:outline-none focus:ring-1 focus:ring-amazon ${
                    isActive ? 'border-amazon text-amazon bg-amazon/5' : 'border-slate-200 hover:border-slate-300'
                  }`}
                  aria-current={isActive ? 'step' : undefined}
                >
                  {step.label}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
