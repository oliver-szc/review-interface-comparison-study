'use client';

import Link from 'next/link';

export default function MobileScreeningOutPage() {
  return (
    <main className="min-h-full w-full bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white p-8 md:p-10 rounded-xl shadow-sm border border-slate-200 text-center">
        <div className="mx-auto w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-4">Thank you for your interest in this study.</h1>

        <div className="text-slate-700 text-lg leading-relaxed space-y-4 text-left">
          <p>
            To ensure reliable results and the correct display of the interactive interfaces, <strong>using a laptop or desktop PC is strictly required</strong> for this study.
          </p>
          <p>
            The system has detected that you are currently accessing the study from a mobile device (smartphone or tablet) or a browser window that is too small. Therefore, the study cannot be started on this device. To participate, please open the link in full-screen mode on a computer.
          </p>
          <p className="text-sm italic text-slate-500">
            If you are already using a laptop or PC and are receiving this message in error, please send a short message to:{' '}
            <a
              href="mailto:oliver.szczygiel@stud.uni-regensburg.de"
              className="text-sky-600 hover:text-sky-800 underline transition-colors"
            >
              oliver.szczygiel@stud.uni-regensburg.de
            </a>
          </p>
          <p>Thank you for your understanding. You may now close this browser tab.</p>
        </div>
      </div>
    </main>
  );
}
