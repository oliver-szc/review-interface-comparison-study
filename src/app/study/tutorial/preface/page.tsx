'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function TutorialPrefacePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [visibleStep, setVisibleStep] = useState(0);

  const handleContinue = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/study/tutorial/preface', { method: 'POST' });
      const result = await response.json();
      if (result.redirectUrl) {
        window.location.replace(result.redirectUrl);
      }
    } catch (e) {
      console.error(e);
      setIsSubmitting(false);
    }
  };

  const nextStep = (stepIndex: number) => {
    setVisibleStep(stepIndex + 1);
  };

  return (
    <main className="min-h-full bg-slate-50 flex flex-col items-center p-4">
      <div className="w-full max-w-3xl my-auto py-12">
        <div className="w-full bg-white p-8 md:p-10 rounded-xl shadow-sm border border-slate-200 min-h-[350px] flex flex-col justify-between space-y-4">
          <div className="prose prose-slate max-w-none space-y-4">
            {/* Step 0: Welcome */}
            {visibleStep === 0 && (
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-6">Tutorial</h1>
                <p className="text-lg text-slate-700 leading-relaxed">
                  Welcome to the Tutorial. This step-by-step guide explains how to successfully complete the upcoming tasks.
                </p>
              </div>
            )}

            {/* Step 1: Task Procedure */}
            {visibleStep === 1 && (
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-6">Task Procedure</h1>
                <p className="text-slate-700 leading-relaxed">
                  You will complete three tasks in total. Each task follows the same basic procedure:
                </p>
              </div>
            )}

            {/* Step 2: 1. Introduction */}
            {visibleStep === 2 && (
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-6">1. Introduction</h1>
                <p className="text-slate-700 leading-relaxed">
                  Before each task, you will be presented with the task description. While the task remains the same across all three rounds, the system you use to solve it will change. When you are ready, proceed to the task.
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end">
            {visibleStep < 2 ? (
              <button
                type="button"
                onClick={() => nextStep(visibleStep)}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition-colors text-lg"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleContinue}
                disabled={isSubmitting}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg shadow-sm transition-colors text-lg"
              >
                {isSubmitting ? 'Loading...' : 'Continue'}
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
