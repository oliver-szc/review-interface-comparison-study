'use client';

import { useState } from 'react';
import { StudyPageGrid } from '@/components/layouts/StudyPageGrid';

export default function TutorialAlternativePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelection = async (value: number) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/study/tutorial/alternative', {
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
    <StudyPageGrid>
      <div className="w-full bg-white p-8 md:p-10 rounded-xl shadow-sm border border-slate-200">
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-4">Another way to explain the tasks</h1>

          <p className="text-lg font-semibold text-slate-800 mb-6">
            Not sure how it works? Here's a simple overview.
          </p>

          <p className="text-base text-slate-700 mb-8 leading-relaxed">
            In this study, you will complete three tasks, one at a time. The task stays the same each round, but the tool changes.
          </p>

          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Step 1: Read the task description</h2>
              <p className="text-slate-700 leading-relaxed">
                Before each task starts, you will see a short description of what to do. Read it, then continue to the task page.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Step 2: Explore the reviews</h2>
              <p className="text-slate-700 leading-relaxed mb-3">
                On the task page, you will see a product page with customer reviews. You have <strong>three different tools</strong> to explore them:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700">
                <li><strong>Reviews:</strong> Browse, sort, and filter all reviews by keyword.</li>
                <li><strong>Chatbot:</strong> Ask questions about the reviews and get direct answers.</li>
                <li><strong>Dashboard:</strong> See reviews grouped by category, with highlighted opinions.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Step 3: Answer the claims</h2>
              <p className="text-slate-700 leading-relaxed mb-3">
                Click <strong>"Open Answer Form"</strong> to open the answer form. You will see a list of claims — mark each one as <strong>True</strong> or <strong>False</strong> based on what you found.
              </p>
              <p className="text-slate-700 leading-relaxed font-semibold">
                You can open and close the form at any time. Your progress is saved automatically.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Step 4: Submit</h2>
              <p className="text-slate-700 leading-relaxed">
                Once all claims are answered, click <strong>"Submit Answers"</strong> to finish the task.
              </p>
            </div>
          </div>

          <p className="text-lg font-medium text-slate-700 text-center mt-10">Are you ready to start the tasks now?</p>
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-4 w-full">
          <button
            onClick={() => handleSelection(1)}
            disabled={isSubmitting}
            className="w-full sm:w-96 px-6 py-3 bg-sky-800 hover:bg-sky-900 disabled:bg-sky-800/200 text-white font-semibold rounded-lg shadow-sm transition-colors text-base text-center"
          >
            No, I Still Do Not Understand the Task
          </button>
          <button
            onClick={() => handleSelection(2)}
            disabled={isSubmitting}
            className="w-full sm:w-96 px-6 py-3 bg-sky-800 hover:bg-sky-900 disabled:bg-sky-800/200 text-white font-semibold rounded-lg shadow-sm transition-colors text-base text-center"
          >
            Yes, I Understand the Task Now – Continue
          </button>
        </div>
      </div>
    </StudyPageGrid>
  );
}
