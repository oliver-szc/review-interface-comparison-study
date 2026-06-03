import { cookies } from 'next/headers';
import { db } from '@/db/client';
import { participants } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { SetCompletionFlag } from './SetCompletionFlag';
import { CompletionCodeButton } from './CompletionCodeButton';

export default async function DebriefPage() {
  const cookieStore = await cookies();
  const participantId = cookieStore.get('participantId')?.value;

  if (!participantId) {
    redirect('/');
  }

  let code = 'DEBUG-CODE';

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
    <main className="min-h-full bg-slate-50 flex flex-col items-center">
      <SetCompletionFlag />
      <div className="w-full max-w-3xl px-4 pt-12 pb-12">
        <div className="w-full bg-white p-8 md:p-10 rounded-xl shadow-sm border border-slate-200">
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 mb-6 leading-tight">
            Thank you for your participation!
          </h1>

          <div className="space-y-5 text-slate-700 text-base leading-relaxed">
            <p className="text-lg text-slate-800 font-medium">
              We sincerely appreciate you taking the time to complete this study.
            </p>

            <h2 className="text-lg font-semibold text-slate-900 mt-6 mb-3">About This Study</h2>
            <p>
              This research investigated how two different types of user assistance (an AI-based chatbot and a data dashboard) affect the experience of browsing and evaluating online product reviews. Your responses make a valuable contribution to our understanding of human-computer interaction.
            </p>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg text-slate-900 text-sm">
              <p>
                <strong>Please note:</strong> This study included an attention check to ensure data quality. Participants who did not pass this check cannot be included in the analysis, but will still receive credits for their participation.
              </p>
            </div>

            <p>
              Should you wish to withdraw your participation or request the deletion of your data after completing the study, please contact us at:{' '}
              <a
                href="mailto:oliver.szczygiel@stud.uni-regensburg.de"
                className="text-slate-600 hover:text-slate-400 transition-colors"
              >
                oliver.szczygiel@stud.uni-regensburg.de
              </a>
              . We will remove your data promptly upon request.
            </p>

            <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 mt-8 text-center text-blue-900">
              <h2 className="text-xl font-semibold text-blue-950 mb-4">Claiming Your Participant Hours (VP-Stunden)</h2>
              <p className="mb-6 text-sm">
                To receive your VP hours, please send a brief email including your personal completion code:
              </p>

              <h4 className="font-bold text-blue-950 mb-2">Your personal completion code:</h4>
              <CompletionCodeButton code={code} />

              <h4 className="font-bold text-blue-950 mb-2 mt-8">Send the completion code to:</h4>
              <p className="mb-2">
                <a
                  href={`mailto:oliver.szczygiel@stud.uni-regensburg.de?subject=Study Completion Code: ${code}`}
                  className="font-mono bg-white hover:bg-blue-50/50 border border-blue-200 hover:border-blue-300 rounded px-4 py-2 inline-block text-blue-600 hover:text-blue-800 transition-all shadow-sm"
                >
                  oliver.szczygiel@stud.uni-regensburg.de
                </a>
              </p>
            </div>

            <p className="text-center font-medium pt-6 text-slate-500">
              You may now close this browser tab.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
