'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { StudyPageGrid } from '@/components/layouts/StudyPageGrid';
import { TutorialProvider } from '@/lib/contexts/TutorialContext';
import { TutorialOverlay } from '@/components/tutorial/TutorialOverlay';

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

  if (visibleStep === 2) {
    return (
      <TutorialProvider currentStep={0} onAction={() => { }}>
        <StudyPageGrid>
          <div className="bg-white p-8 md:p-10 rounded-xl shadow-sm border border-slate-200">
            <h1 className="text-2xl font-bold text-slate-900 mb-6">
              Task 0 of 3 (Tutorial)
            </h1>

            <div className="prose prose-slate max-w-none text-slate-700 text-lg leading-relaxed mb-6">
              <p>
                <i>
                  <strong>Scenario:</strong> You are interested in buying <span className="font-semibold">earbuds</span> and want to evaluate claims you have heard about the product.
                </i>
              </p>
              <div>
                <strong>Your task:</strong> Please use the {' '}
                <span className="rounded-md ml-0.5 mr-0.5 px-1 border-2 border-sky-400 font-semibold">dashboard, chatbot, and review section</span>
                {' '} to explore the reviews and determine whether the claim is supported by customer feedback. For each claim, select one of the following:
                <ul className="list-disc">
                  <li><span className="font-semibold">True </span>(the majority of reviewers clearly rate this aspect as such)</li>
                  <li><span className="font-semibold">False </span>(the aspect is mentioned, but the majority rate it the opposite way)</li>
                  <li><span className="font-semibold">Not mentioned </span>(cannot be determined because the reviews do not address this aspect)</li>
                </ul>
              </div>
            </div>
            <div className="flex justify-end pt-8">
              <button
                onClick={handleContinue}
                disabled={isSubmitting}
                className="px-6 py-3 bg-sky-800 hover:bg-sky-900 disabled:bg-sky-800/20 text-white font-semibold rounded-lg shadow-sm transition-colors text-base"
              >
                {isSubmitting ? 'Loading...' : 'Start Task'}
              </button>
            </div>
          </div>
        </StudyPageGrid>

        {/* Card 1 Overlay */}
        <TutorialOverlay
          isVisible={true}
          content={
            <div>
              <p className="text-slate-700 leading-relaxed">
                Before each task, you will see a brief task description. The task itself stays the same across all three rounds, but the system you use to solve it changes.
              </p>
            </div>
          }
          onContinue={handleContinue}
        />
      </TutorialProvider>
    );
  }

  return (
    <main className="relative h-full w-full bg-slate-50 flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* Active Tutorial Card (Top Layer) */}
      <div className="w-full max-w-3xl z-20">
        <div className="w-full bg-white p-8 md:p-10 rounded-xl shadow-lg border border-slate-200 flex flex-col space-y-8">
          <div className="prose prose-slate max-w-none space-y-4">
            {/* Step 0: Welcome */}
            {visibleStep === 0 && (
              <div>
                <h1 className="text-2xl font-bold text-slate-900 mb-6">Tutorial</h1>
                <p className="text-lg text-slate-700">
                  Welcome to the Tutorial. This step-by-step guide explains how to successfully complete the upcoming tasks.
                </p>
              </div>
            )}

            {/* Step 1: Task Procedure */}
            {visibleStep === 1 && (
              <div>
                <p className="text-slate-700">
                  You will complete three tasks in total. Each task follows the same basic procedure...
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => nextStep(visibleStep)}
              className="px-6 py-3 bg-sky-800 hover:bg-sky-900 text-white font-semibold rounded-lg shadow-sm transition-colors text-base"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
