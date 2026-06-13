'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { StudyPageGrid } from '@/components/layouts/StudyPageGrid';

export default function TutorialConditionPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [visibleStep, setVisibleStep] = useState(0);

  const handleContinue = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/study/tutorial/condition', { method: 'POST' });
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
    <StudyPageGrid>
      <div className="w-full bg-white p-8 md:p-10 rounded-xl shadow-sm border border-slate-200 flex flex-col space-y-8">
        <div className="prose prose-slate max-w-none space-y-4">
          {/* Step 0: 2. The Claims */}
          {visibleStep === 0 && (
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-6">The Claims:</h1>
              <p className="text-slate-700 leading-relaxed">
                In each task, you will be asked to verify <strong>three specific claims</strong> about a product. These claims will be visible at the top bar at all times and the answer form is accessible via a button in the top right corner. Your goal is to find out if the experiences of actual customers support or contradict these claims.
              </p>
            </div>
          )}

          {/* Step 1: 3. Using the Systems */}
          {visibleStep === 1 && (
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-6">Using the System:</h1>
              <p className="text-slate-700 leading-relaxed mb-4">
                The interface simulates a typical product page with user reviews. Throughout the study, you will explore these reviews using different systems:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-4">
                <li>Sometimes you will just work with the standard <strong>Reviews</strong> section.</li>
                <li>Sometimes you will be provided with an AI<strong> Chatbot</strong>, which works like a standard conversational AI tool (you can ask specific questions about the reviews).</li>
                <li>Sometimes you will use an interactive <strong>Dashboard</strong>, which summarizes customer insights.</li>
              </ul>
              <p className="text-slate-750 font-semibold leading-relaxed">
                Please use the system provided in each round to gather the facts.
              </p>
            </div>
          )}

          {/* Step 2: 4. Submitting Your Answers */}
          {visibleStep === 2 && (
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-6">Submitting Your Answers:</h1>
              <p className="text-slate-700 leading-relaxed mb-4">
                Once you have gathered enough information, click the <strong>"Open Answer Form"</strong> button in the top right corner. For each of the three claims, you must select whether it is:
              </p>
              <ul className="list-disc">
                <li><span className="font-semibold">True </span>(the majority of reviewers clearly rate this aspect as such)</li>
                <li><span className="font-semibold">False </span>(the aspect is mentioned, but the majority rate it the opposite way)</li>
                <li><span className="font-semibold">Not mentioned </span>(cannot be determined because the reviews do not address this aspect)</li>
              </ul>
              <p className="text-slate-750 leading-relaxed">
                Once you have selected an option for all three claims, click <strong>"Submit Answers"</strong> to finish the task.
              </p>
            </div>
          )}

          {/* Step 3: 5. Follow-Up Questionnaire */}
          {visibleStep === 3 && (
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-6">Follow-Up Questionnaire:</h1>
              <p className="text-slate-700 leading-relaxed">
                After submitting your answers, you will be briefly redirected to a short questionnaire. Here, we will ask about your experience with the system you just used, before the next task begins.
              </p>
            </div>
          )}

          {/* Step 4: 6. Golden Rules */}
          {visibleStep === 4 && (
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-6">Golden Rules:</h1>
              <p className="text-slate-750 font-medium mb-4">
                To ensure accurate scientific results, please follow these rules:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700">
                <li><strong>Use the provided system:</strong> Solve the task using the tools currently visible on your screen.</li>
                <li><strong>Stay focused:</strong> Do not switch browser tabs or take breaks while verifying the claims.</li>
                <li><strong>Take breaks later:</strong> If you need a short pause, please take it <em>between</em> the tasks, while filling out the questionnaires.</li>
              </ul>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end">
          {visibleStep < 4 ? (
            <button
              type="button"
              onClick={() => nextStep(visibleStep)}
              className="px-6 py-3 bg-sky-800 hover:bg-sky-900 text-white font-semibold rounded-lg shadow-sm transition-colors text-base"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleContinue}
              disabled={isSubmitting}
              className="px-6 py-3 bg-sky-800 hover:bg-sky-900 disabled:bg-sky-800/200 text-white font-semibold rounded-lg shadow-sm transition-colors text-base"
            >
              {isSubmitting ? 'Loading...' : 'Continue'}
            </button>
          )}
        </div>
      </div>
    </StudyPageGrid>
  );
}
