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

  const isStep2 = visibleStep === 2;

  return (
    <main className="relative h-full w-full bg-slate-50 flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* Static duplicate of the preface block content card (Bottom Layer, Centered in background) */}
      {isStep2 && (
        <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none z-0 select-none opacity-40 scale-95">
          <div className="w-full max-w-3xl bg-white p-8 md:p-10 rounded-xl shadow-sm border border-slate-200">
            <h1 className="text-2xl font-bold text-slate-900 mb-6">
              Task 1 of 3
            </h1>

            <div className="prose prose-slate max-w-none text-slate-700 text-lg leading-relaxed mb-6">
              <p>
                <i>
                  In the upcoming task, you will evaluate claims about an online product (kettle) <strong>using an AI chatbot</strong>.
                  Please read the instructions carefully and proceed when you are ready to begin.
                </i>
              </p>
              <p>
                <strong>The scenario:</strong> You are interested in buying this kettle and want to find out if the claims you heard about it are actually true.
              </p>
              <p>
                <strong>Your task:</strong> Please use the provided system to explore the online reviews and verify whether the experiences of actual buyers support these claims. You have to find out, wether a claim is:
                <ul className="list-disc list-inside">
                  <li><i>true</i></li>
                  <li><i>false</i></li>
                  <li><i>cannot be decided based on the available information</i> in the reviews.</li>
                </ul>
                For each claim, you have to select one answer.
              </p>
            </div>
            <div className="flex justify-end">
              <button className="px-6 py-3 bg-sky-800/50 text-white font-semibold rounded-lg shadow-sm text-base" disabled>
                Let's Start
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Blurring Mask (Middle Layer) */}
      {isStep2 && (
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            backdropFilter: 'blur(100px)',
            WebkitBackdropFilter: 'blur(100px)',
            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,1) 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,1) 100%)',
          }}
        />
      )}

      {/* Arrow SVG (Top Layer, aligned to center) */}
      {isStep2 && (
        <div
          className="absolute z-30 pointer-events-none"
          style={{
            top: '50%',
            left: 'calc(50% + 16px)',
            width: '60px',
            height: '80px',
            transform: 'rotate(90deg) scaleX(-1)',
            transformOrigin: 'bottom right',
            filter: 'drop-shadow(0 10px 8px rgba(0, 0, 0, 0.04)) drop-shadow(0 4px 3px rgba(0, 0, 0, 0.1))',
          }}
        >
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 625 834"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              fillRule: 'evenodd',
              clipRule: 'evenodd',
              strokeLinejoin: 'round',
              strokeMiterlimit: 2,
            }}
          >
            <g transform="matrix(4.166667,0,0,4.166667,0,0)">
              <g transform="matrix(0.211225,0.121951,-0.123059,0.213144,-93.625026,157.035767)">
                <path
                  d="M520.352,-99.947C471.717,-130.098 430.099,-169.356 395.5,-217.72C339.833,-295.533 312,-382.96 312,-480C312,-543.053 324.68,-603.417 350.04,-661.09C375.407,-718.77 411.727,-768.74 459,-811L304,-811L304,-906L617,-906L617,-593L522,-593L522,-737C485.333,-705 456.833,-666.607 436.5,-621.82C416.167,-577.033 406,-529.76 406,-480C406,-409.14 425,-344.517 463,-286.13C501,-227.75 552.333,-184.373 617,-156L617,-155.747L520.352,-99.947Z"
                  fill="white"
                  stroke="#d6dae1ff"
                  strokeWidth="10"
                />
              </g>
            </g>
          </svg>
        </div>
      )}

      {/* Active Tutorial Card (Top Layer) */}
      <div className={isStep2 ? "absolute top-1/2 right-1/2 z-20 w-full max-w-3xl" : "w-full max-w-3xl z-20"}>
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
                <h1 className="text-2xl font-bold text-slate-900 mb-6">Scope:</h1>
                <p className="text-slate-700">
                  You will complete three tasks in total. Each task follows the same basic procedure...
                </p>
              </div>
            )}

            {/* Step 2: Task Preface */}
            {visibleStep === 2 && (
              <div>
                <h1 className="text-2xl font-bold text-slate-900 mb-6">Task Preface:</h1>
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
      </div>
    </main>
  );
}
