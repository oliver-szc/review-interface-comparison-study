import { getBlockContext } from '@/lib/utils/blockContext';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import PrefaceClient from './PrefaceClient';
import { StudyPageGrid } from '@/components/layouts/StudyPageGrid';

export default async function BlockPrefacePage({ params }: { params: Promise<{ blockIndex: string }> }) {
  const resolvedParams = await params;
  const blockIndexStr = resolvedParams.blockIndex;
  const blockIndex = parseInt(blockIndexStr, 10);

  if (![1, 2, 3].includes(blockIndex)) {
    redirect('/');
  }

  const cookieStore = await cookies();
  const participantId = cookieStore.get('participantId')?.value;

  if (!participantId) {
    redirect('/');
  }

  const context = await getBlockContext(participantId, blockIndex as 1 | 2 | 3);

  // Convert to lowercase for display
  const productDisplay = context.productId.toLowerCase();

  let conditionDisplay = "without assistance";
  let systemText = "use the provided system";
  if (context.conditionType === 'CHATBOT') {
    conditionDisplay = "using an AI chatbot";
    systemText = "use the chatbot assistance";
  } else if (context.conditionType === 'DASHBOARD') {
    conditionDisplay = "using an interactive dashboard";
    systemText = "use the dashboard assistance";
  }

  return (
    <StudyPageGrid>
      <div className="bg-white p-8 md:p-10 rounded-xl shadow-sm border border-slate-200">
          <h1 className="text-2xl font-bold text-slate-900 mb-6">
            Task {blockIndex} of 3
          </h1>

          <div className="prose prose-slate max-w-none text-slate-700 text-lg leading-relaxed mb-6">
            <p>
              <i>
                In the upcoming task, you will evaluate claims about an online product ({productDisplay}){' '}
                {context.conditionType === 'CHATBOT' || context.conditionType === 'DASHBOARD' ? (
                  <span className="rounded-xl ml-1 mr-1 px-1 border-2 border-sky-400">
                    <strong>{conditionDisplay}</strong>
                  </span>
                ) : (
                  <strong>{conditionDisplay}</strong>
                )}
                . Please read the instructions carefully and proceed when you are ready to begin.
              </i>
            </p>
            <p>
              <strong>The scenario:</strong> You are interested in buying this <span className="font-semibold">{productDisplay}</span> and want to find out if the claims you heard about it are actually true.
            </p>
            <p>
              <strong>Your task:</strong> Please <span className="font-semibold">{systemText}</span> to explore the online reviews and verify whether the experiences of actual buyers support these claims. You have to find out, wether a claim is:
              <ul className="list-disc list-inside">
                <li><span className="font-semibold">True </span>(the majority of reviewers clearly rate this aspect as such)</li>
                <li><span className="font-semibold">False </span>(the aspect is mentioned, but the majority rate it the opposite way)</li>
                <li><span className="font-semibold">Not mentioned </span>(the aspect simply does not appear in the reviews)</li>
              </ul>
              For each claim, you have to select one answer.
            </p>
          </div>
          <PrefaceClient blockIndex={blockIndex} />
      </div>
    </StudyPageGrid>
  );
}
