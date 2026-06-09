import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '@/db/client';
import { claimSeeds, reviews } from '@/db/schema';
import { eq, asc, desc } from 'drizzle-orm';
import { getBlockContext } from '@/lib/utils/blockContext';
import { getAspectData } from '@/lib/queries/absa';
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

  // Fetch reviews for the product
  const productReviews = await db
    .select()
    .from(reviews)
    .where(eq(reviews.productId, productInfo.id))
    .orderBy(desc(reviews.reviewDate));

  // Use precalculated star distribution from the product info
  const distributionMap = (productInfo.ratingDistribution as Record<number, number>) || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  
  const starDistribution = Object.entries(distributionMap)
    .map(([stars, count]) => ({
      stars: Number(stars),
      count: Number(count),
    }))
    .sort((a, b) => b.stars - a.stars);

  const mappedReviews = productReviews.map((r) => ({
    name: r.userName || 'Anonymous',
    stars: r.starRating,
    date: r.reviewDate ? r.reviewDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Unknown Date',
    timestamp: r.reviewDate ? r.reviewDate.getTime() : 0,
    helpfulVotes: r.helpfulVote || 0,
    text: r.reviewText,
    title: r.reviewTitle,
    absaAspects: r.absaAspects ?? [],
  }));

  // Fetch ABSA aspect data only for the DASHBOARD condition
  const aspectData = context.conditionType === 'DASHBOARD'
    ? await getAspectData(productInfo.id)
    : [];

  return (
    <TaskClientView 
      blockIndex={blockIndex} 
      conditionType={context.conditionType} 
      productId={context.productId}
      claims={rawClaims}
      productData={productInfo as any}
      reviews={mappedReviews}
      starDistribution={starDistribution}
      aspectData={aspectData}
    />
  );
}
