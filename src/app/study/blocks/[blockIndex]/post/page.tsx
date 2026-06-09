import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getBlockContext } from '@/lib/utils/blockContext';
import PostConditionClientView from './PostConditionClientView';

export default async function BlockPostConditionPage({ params }: { params: Promise<{ blockIndex: string }> }) {
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

  return (
    <PostConditionClientView 
      blockIndex={blockIndex as 1 | 2 | 3} 
      conditionType={context.conditionType} 
    />
  );
}
