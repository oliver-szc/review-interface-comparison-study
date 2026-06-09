'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function LandingPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isChecking, setIsChecking] = useState(true);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);

  useEffect(() => {
    // Handle ?debug=true / ?debug=false URL parameter
    const debugParam = searchParams.get('debug');
    const isDebugActive = debugParam === 'true' || localStorage.getItem('STUDY_DEBUG_MODE') === 'true';

    if (debugParam === 'true') {
      localStorage.setItem('STUDY_DEBUG_MODE', 'true');
      // Inform the server to set the debug cookie (so API routes and proxy know)
      fetch('/api/debug/activate', { method: 'POST' }).catch(console.error);
    } else if (debugParam === 'false') {
      localStorage.removeItem('STUDY_DEBUG_MODE');
      fetch('/api/debug/exit', { method: 'POST' }).catch(console.error);
    }

    // Level 1 multiple-participation protection: check localStorage flag, bypassed in debug mode
    if (!isDebugActive && localStorage.getItem('study_completed') === 'true') {
      setAlreadyCompleted(true);
      setIsChecking(false);
      return;
    }

    // S0 Screening: Device check — must be on a wide enough screen (bypassed in debug mode)
    if (!isDebugActive && window.innerWidth < 1024) {
      router.replace('/screening/mobile');
    } else {
      setIsChecking(false);
    }
  }, [router, searchParams]);

  if (isChecking) {
    return (
      <div className="min-h-full flex items-center justify-center bg-slate-50">
        <p className="text-slate-500 animate-pulse">Checking device compatibility...</p>
      </div>
    );
  }

  return (
    <main className="min-h-full bg-slate-50 flex flex-col items-center">
      <div className="w-full py-12 my-auto px-0 max-w-none">
        <div className="w-[33.333%] mx-auto bg-white p-8 md:p-10 rounded-xl shadow-sm border border-slate-200">
          <h1 className="text-xl font-bold text-slate-900 mb-3">
            Welcome to the study:
          </h1>
          <h1 className="text-3xl text-slate-900 font-bold mb-6">
            User Assistance in Exploring Online Reviews
          </h1>

          {/* Show a notice if the user has already completed the study */}
          {alreadyCompleted ? (
            <div className="bg-amber-50 border border-amber-300 rounded-lg p-6 text-amber-900 mt-4">
              <h2 className="text-xl font-semibold text-slate-900 mb-2">You have already participated.</h2>
              <p className="text-sm">
                Our system indicates that you have already accessed this study. To ensure scientific validity, each participant may only complete the tasks once.
              </p>
              <p className="text-sm mt-2">
                Did you experience a technical issue?
              </p>
              <p className="text-sm mt-2">
                If your browser crashed or you lost your connection before finishing the study, please contact the researcher at <a href="mailto:[oliver.szczygiel@stud.uni-regensburg.de]" className="text-amber-800 hover:text-amber-900 underline">oliver.szczygiel@stud.uni-regensburg.de</a>. We can manually reset your session so you can complete the study.
              </p>
              <p className="text-sm mt-2">
                Thank you for your understanding!
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-5 text-slate-700 text-base leading-relaxed">
                <p>
                  Thank you for your interest in participating! In this study, we investigate how different types of user assistance influence the experience of exploring online product reviews. You will complete a series of short tasks using these tools and share your impressions along the way.
                </p>

                <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg text-slate-900 text-sm">
                  <p>
                    <strong>Note:</strong> The study will be conducted entirely in English. A basic knowledge of English is required to complete the tasks. The study includes quality assurance measures to ensure the integrity of the collected data.
                  </p>
                </div>

                <h2 className="text-xl font-semibold text-slate-900 mt-10 mb-3">What to expect:</h2>
                <ul className="list-disc pl-6 space-y-1.5 text-slate-700 text-base">
                  <li><strong>Demographics:</strong> First, you will answer a few questions about yourself.</li>
                  <li><strong>Tutorial:</strong> Next, you will familiarize yourself with the web interface and the task format.</li>
                  <li><strong>Main section:</strong> You will complete three short tasks one after the other, each followed by a short questionnaire.</li>
                  <li><strong>Conclusion:</strong> At the end of the study, you will fill out a final questionnaire.</li>
                  <li><strong>Estimated total duration:</strong> approx. 40 minutes</li>
                </ul>

                <h2 className="text-xl font-semibold text-slate-900 mt-10 mb-3">VP (Versuchspersonenstunden) for UR-students:</h2>
                <p>
                  You will receive <strong>1 VP</strong> for your participation. After completing the study, a personal code will be displayed. Please send this code informally via email to receive your VP.
                </p>

                <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg text-amber-800 text-sm font-medium mt-10">
                  Please ensure you are in a quiet environment and can complete the study in one sitting without interruptions.
                </div>
              </div>

              <div className="mt-8 flex justify-end pt-6">
                <Link
                  id="start-study-link"
                  href="/study/consent"
                  className="px-6 py-2.5 bg-sky-800 hover:bg-sky-900 text-white font-semibold rounded-lg shadow-sm transition-colors text-base"
                >
                  Continue to the consent form
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

// Wrap in Suspense because useSearchParams() requires it in Next.js App Router
export default function LandingPage() {
  return (
    <Suspense>
      <LandingPageInner />
    </Suspense>
  );
}