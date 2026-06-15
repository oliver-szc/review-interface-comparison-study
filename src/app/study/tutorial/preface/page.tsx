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

  const nextStep = () => {
    setVisibleStep((prev) => prev + 1);
  };

  return (
    <TutorialProvider currentStep={0} onAction={() => { }}>
      <StudyPageGrid>
        {visibleStep === 2 && (
          <div className="bg-white p-8 md:p-10 rounded-xl shadow-sm border border-slate-200 animate-in fade-in duration-500">
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
        )}
      </StudyPageGrid>

      {/* Step 0 Overlay */}
      <TutorialOverlay
        isVisible={visibleStep === 0}
        content={
          <div>
            <h3 className="text-2xl font-bold text-slate-800 !mt-2">Tutorial</h3>
            <p className="text-slate-700 leading-relaxed text-base">
              Welcome to the tutorial. This step-by-step guide explains how to successfully complete the upcoming tasks.
            </p>
          </div>
        }
        onContinue={nextStep}
      />

      {/* Step 1 Overlay */}
      <TutorialOverlay
        isVisible={visibleStep === 1}
        content={
          <div>
            <h3 className="text-2xl font-bold text-slate-800 !mt-2">Tasks</h3>
            <p className="text-slate-700 leading-relaxed text-base">
              You will complete three tasks in total. Each task follows the same basic procedure...
            </p>
          </div>
        }
        onContinue={nextStep}
      />

      {/* Step 2 Overlay */}
      <TutorialOverlay
        isVisible={visibleStep === 2}
        content={
          <div>
            <h3 className="text-2xl font-bold text-slate-800 !mt-2">Task Introduction</h3>
            <p className="text-slate-700 leading-relaxed text-base">
              Before each task, you will see a brief task description. The task itself stays the same across all three rounds, but the system you use to solve it changes.
            </p>
          </div>
        }
        onContinue={handleContinue}
      />
    </TutorialProvider>
  );
}
