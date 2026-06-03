import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '@/db/client';
import { claimSeeds } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';
import { getBlockContext } from '@/lib/utils/blockContext';
import TaskClientView from './TaskClientView';

export default async function BlockTaskPage({ params }: { params: Promise<{ blockIndex: string }> }) {
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

  // Fetch claims for this product, omitting ground truth
  const rawClaims = await db
    .select({
      id: claimSeeds.id,
      claimOrder: claimSeeds.claimOrder,
      claimText: claimSeeds.claimText,
    })
    .from(claimSeeds)
    .where(eq(claimSeeds.productId, context.productId))
    .orderBy(asc(claimSeeds.claimOrder));

  if (rawClaims.length === 0) {
    throw new Error(`No claims found for product ${context.productId}`);
  }

  const productInfo = await db.query.products.findFirst({
    where: (products, { eq }) => eq(products.productId, context.productId),
  });

  if (!productInfo) {
    throw new Error(`Product info not found for product ${context.productId}`);
  }

  return (
    <TaskClientView 
      blockIndex={blockIndex} 
      conditionType={context.conditionType} 
      productId={context.productId}
      claims={rawClaims}
      productData={productInfo as any}
    />
  );
}
