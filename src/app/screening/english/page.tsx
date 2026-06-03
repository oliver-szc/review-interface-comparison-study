'use client';

export default function EnglishScreeningOutPage() {
  return (
    <main className="min-h-full bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white p-8 md:p-10 rounded-xl shadow-sm border border-slate-200 text-center">
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 mb-6">
          Thank you for your interest in this study.
        </h1>

        <div className="text-slate-700 text-lg leading-relaxed space-y-4 text-left">
          <p>
            Completing the tasks in this study requires at least an intermediate level of English proficiency. Since this requirement is not met, we are unable to include your participation in the analysis.
          </p>
          <p>
            We greatly appreciate your interest and the time you’ve taken – you may now close this browser tab.
          </p>
        </div>


      </div>
    </main>
  );
}
