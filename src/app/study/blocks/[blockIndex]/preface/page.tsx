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
  const prefixedProduct = (productDisplay === 'kettle' || productDisplay === 'sweatshirt')
    ? 'a ' + productDisplay
    : productDisplay;

  let conditionDisplay = "review section";
  if (context.conditionType === 'CHATBOT') {
    conditionDisplay = "chatbot";
  } else if (context.conditionType === 'DASHBOARD') {
    conditionDisplay = "dashboard";
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
              <strong>Scenario:</strong> You are interested in buying <span className="font-semibold">{prefixedProduct}</span> and want to evaluate claims you have heard about the product.
            </i>
          </p>
          <div>
            <strong>Your task:</strong> Please use the {' '}
            {context.conditionType === 'CHATBOT' || context.conditionType === 'DASHBOARD' ? (
              <span className="rounded-md ml-0.5 mr-0.5 px-1 border-2 border-sky-400 font-semibold">{conditionDisplay}</span>
            ) : (
              <span className="font-semibold">{conditionDisplay}</span>
            )} to explore the reviews and determine whether the claim is supported by customer feedback. For each claim, select one of the following:
            <ul className="list-disc">
              <li><span className="font-semibold">True </span>(the majority of reviewers clearly rate this aspect as such)</li>
              <li><span className="font-semibold">False </span>(the aspect is mentioned, but the majority rate it the opposite way)</li>
              <li><span className="font-semibold">Not mentioned </span>(the aspect simply does not appear in the reviews)</li>
            </ul>
          </div>
        </div>
        <PrefaceClient blockIndex={blockIndex} />
      </div>
    </StudyPageGrid>
  );
}
