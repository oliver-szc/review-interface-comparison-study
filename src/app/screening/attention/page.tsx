import { cookies } from 'next/headers';
import { db } from '@/db/client';
import { participants } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { CompletionCodeButton } from '@/app/debrief/CompletionCodeButton';

export default async function AttentionScreeningOutPage() {
  const cookieStore = await cookies();
  const participantId = cookieStore.get('participantId')?.value;

  if (!participantId) {
    redirect('/');
  }

  let code = 'DEBUG-ATTENTION-SCREEN-CODE';

  if (participantId !== 'debug-participant') {
    // Fetch the participant's code
    const p = await db
      .select({ completionCode: participants.completionCode })
      .from(participants)
      .where(eq(participants.id, participantId))
      .limit(1);

    if (p.length === 0 || !p[0].completionCode) {
      redirect('/');
    }

    code = p[0].completionCode;
  }

  return (
    <main className="min-h-full w-full bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white p-8 md:p-10 rounded-xl shadow-sm border border-slate-200 text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">
          Thank you for your interest in this study.
        </h1>

        <div className="text-slate-700 text-lg leading-relaxed space-y-4 text-left">
          <p>
            To ensure the quality of our data, we inserted a simple attention check. Unfortunately, you did not pass this check, which means we cannot include your data in our final analysis.
          </p>
          <p>
            We still greatly appreciate your participation and the time you’ve invested!
          </p>

          <div className="bg--50 border border-sky-100 bg-sky-50 rounded-lg p-6 mt-8 text-center text--900">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Claiming Your Participant Hours (VP-Stunden)</h2>
            <p className="mb-6 text-sm">
              To receive your VP hours, please send a brief email including your personal completion code:
            </p>

            <h4 className="font-bold text--950 mb-2">Your personal completion code:</h4>
            <CompletionCodeButton code={code} />

            <h4 className="font-bold text--950 mb-2 mt-8">Send the completion code to:</h4>
            <p className="mb-2">
              <a
                href={`mailto:oliver.szczygiel@stud.uni-regensburg.de?subject=Study Completion Code: ${code}`}
                className="font-mono bg-white hover:bg--50/50 border border--200 hover:border--300 rounded px-4 py-2 inline-block text--600 hover:text--800 transition-all shadow-sm"
              >
                oliver.szczygiel@stud.uni-regensburg.de
              </a>
            </p>
          </div>

          <p className="text-center font-medium pt-4">You may now close this browser window.</p>
        </div>
      </div>
    </main>
  );
}
