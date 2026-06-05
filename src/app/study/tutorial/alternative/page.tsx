'use client';

import { useState } from 'react';

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
    <main className="relative h-full w-full bg-slate-50 flex flex-col items-center justify-center p-4 overflow-hidden">
      <div className="w-full max-w-3xl z-20">
        <div className="w-full bg-white p-8 md:p-10 rounded-xl shadow-sm border border-slate-200">
          <div className="mb-10">
            <h1 className="text-2xl font-bold text-slate-900 mb-6">Tutorial</h1>

            <p className="text-lg font-bold text-slate-900 mb-4">
              Let’s look at it from a more practical side:
            </p>

            <p className="mb-4">
              Imagine you are researching a product online and come across specific claims about its features (for example: “The camera is completely waterproof”). In each task, you will see three such claims pinned to your screen.
            </p>

            <p className="mb-4">
              Your goal is to find out if the experiences of actual customers support or contradict these claims. To do this, you will use different systems to explore the reviews – such as an AI chatbot, an interactive data dashboard, or a classic review list. Please use the provided system to gather the facts.
            </p>

            <p className="mb-6">
              Once you have verified the information, simply select whether each claim is True, False, or Cannot be determined based on the reviews, and then submit your answers.             </p>
            <div className="prose prose-slate max-w-none mb-10 p-8 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 leading-relaxed text-sm md:text-base">
              <p className="text-base font-bold text-slate-900 mb-4">
                The 3 Golden Rules for this study:
              </p>
              <ul className="list-disc pl-5 space-y-3">
                <li>
                  <strong>Use the tools:</strong> Please interact with the chatbot or dashboard; do not just read reviews manually.
                </li>
                <li>
                  <strong>Stay focused:</strong> Do not switch browser tabs and do not take breaks while searching for the answer.
                </li>
                <li>
                  <strong>Take breaks later:</strong> You can take a short breather <i>between</i> tasks, while filling out the questionnaires.
                </li>
              </ul>
            </div>

            <h2 className="text-xl font-semibold text-slate-900 text-center">Are you ready to start the tasks now?</h2>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-16 w-full">
            <button
              onClick={() => handleSelection(1)}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-sky-800 hover:bg-sky-900 disabled:bg-sky-800/200 text-white font-semibold rounded-lg shadow-sm transition-colors text-base"
            >
              No, I Still Do Not Understand the Task
            </button>
            <button
              onClick={() => handleSelection(2)}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-sky-800 hover:bg-sky-900 disabled:bg-sky-800/200 text-white font-semibold rounded-lg shadow-sm transition-colors text-base"
            >
              Yes, I Understand the Task Now – Continue
            </button>
          </div>
        </div>
      </div>
    </main >
  );
}
