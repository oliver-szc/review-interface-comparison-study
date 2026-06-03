import { getBlockContext } from '@/lib/utils/blockContext';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import PrefaceClient from './PrefaceClient';

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
  if (context.conditionType === 'CHATBOT') {
    conditionDisplay = "using an AI chatbot";
  } else if (context.conditionType === 'DASHBOARD') {
    conditionDisplay = "using an interactive dashboard";
  }

  return (
    <main className="min-h-full bg-slate-50 flex flex-col items-center">
      <div className="w-full max-w-3xl px-4 pt-12 pb-12">
        <div className="w-full bg-white p-8 md:p-10 rounded-xl shadow-sm border border-slate-200">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">
            Task {blockIndex} of 3
          </h1>

          <div className="prose prose-slate max-w-none text-slate-700 text-lg leading-relaxed mb-6">
            <p>
              <i>
                In the upcoming task, you will evaluate claims about an online product ({productDisplay}) <strong>{conditionDisplay}</strong>.
                Please read the instructions carefully and proceed when you are ready to begin.
              </i>
            </p>
            <p>
              <strong>The scenario:</strong> You are interested in buying this {productDisplay} and want to find out if the claims you heard about it are actually true.
            </p>
            <p>
              <strong>Your task:</strong> Please use the provided system to explore the online reviews and verify whether the experiences of actual buyers support these claims. You have to find out, wether a claim is <i>true</i>, <i>false</i> or <i>cannot be decided based on the available information</i> in the reviews. For each claim, you have to select one answer.
            </p>
          </div>
          <PrefaceClient blockIndex={blockIndex} />
        </div>
      </div>
    </main>
  );
}
