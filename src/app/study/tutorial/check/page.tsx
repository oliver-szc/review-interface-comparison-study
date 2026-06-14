'use client';

import { useState } from 'react';
import { StudyPageGrid } from '@/components/layouts/StudyPageGrid';
import { TutorialProvider } from '@/lib/contexts/TutorialContext';
import { TutorialOverlay } from '@/components/tutorial/TutorialOverlay';
import PostConditionClientView from '../../blocks/[blockIndex]/post/PostConditionClientView';

export default function TutorialCheckPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [visibleStep, setVisibleStep] = useState(0);

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

  if (visibleStep === 0) {
    return (
      <TutorialProvider currentStep={0} onAction={() => { }}>
        <div className="relative min-h-screen">
          <PostConditionClientView
            blockIndex={0 as any}
            conditionType="BASELINE"
            onTutorialSubmit={() => setVisibleStep(1)}
          />
          <TutorialOverlay
            isVisible={true}
            content={
              <div>
                <h1 className="text-xl font-bold text-slate-900 mb-6">Post-task Questionnaire</h1>
                <p className="text-slate-700 font-normal leading-relaxed mb-4">
                  After each task you will answer a short questionnaire about your experience.
                </p>
              </div>
            }
            onContinue={() => setVisibleStep(1)}
          />
        </div>
      </TutorialProvider>
    );
  }

  return (
    <StudyPageGrid>
      <div className="w-full bg-white p-8 md:p-10 rounded-xl shadow-sm border border-slate-200">
        <div className="mb-10 text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Tutorial completed</h1>
          <h2 className="text-xl font-semibold text-slate-900">Are you ready for the upcoming tasks?</h2>
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-4 w-full">
          <button
            onClick={() => handleSelection(1)}
            disabled={isSubmitting}
            className="w-full sm:w-80 px-6 py-3 bg-sky-800 hover:bg-sky-900 text-white font-semibold rounded-lg shadow-sm transition-colors text-base text-center"
          >
            Please Explain the Task Again
          </button>
          <button
            onClick={() => handleSelection(2)}
            disabled={isSubmitting}
            className="w-full sm:w-80 px-6 py-3 bg-sky-800 hover:bg-sky-900 text-white font-semibold rounded-lg shadow-sm transition-colors text-base text-center"
          >
            I Understand the Task – Continue
          </button>
        </div>
      </div>
    </StudyPageGrid>
  );
}
