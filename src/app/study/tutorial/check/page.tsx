'use client';

import { useState } from 'react';

export default function TutorialCheckPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelection = async (value: number) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/study/tutorial/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ understood: value }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      if (result.redirectUrl) {
        window.location.replace(result.redirectUrl);
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred.');
      setIsSubmitting(false);
    }
  };
  return (
    <main className="relative h-full w-full bg-slate-50 flex flex-col items-center justify-center p-4 overflow-hidden">
      <div className="w-full max-w-3xl z-20">
        <div className="w-full bg-white p-8 md:p-10 rounded-xl shadow-sm border border-slate-200">
          <div className="mb-10 text-center">
            <h1 className="text-2xl font-bold text-slate-900 mb-4">Tutorial completed</h1>
            <h2 className="text-xl font-semibold text-slate-900">Are you ready for the upcoming tasks?</h2>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-16 w-full">
            <button
              onClick={() => handleSelection(1)}
              disabled={isSubmitting}
              className="flex-1 px-6 bg-sky-800 hover:bg-sky-900 text-white font-semibold rounded-lg shadow-sm transition-colors text-base"
            >
              Please Explain the Task Again
            </button>
            <button
              onClick={() => handleSelection(2)}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-sky-800 hover:bg-sky-900 text-white font-semibold rounded-lg shadow-sm transition-colors text-base"
            >
              I Understand the Task – Continue
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
