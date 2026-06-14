import { db } from '@/db/client';
import { claimSeeds, reviews } from '@/db/schema';
import { eq, asc, desc } from 'drizzle-orm';
import { getAspectData } from '@/lib/queries/absa';
import TutorialConditionClient from './TutorialConditionClient';

export default async function TutorialConditionPage() {
  const productId = 'EARBUDS';

  // Fetch claims for TUTORIAL
  const rawClaims = await db
    .select({
      id: claimSeeds.id,
      claimOrder: claimSeeds.claimOrder,
      claimText: claimSeeds.claimText,
    })
    .from(claimSeeds)
    .where(eq(claimSeeds.productId, 'TUTORIAL'))
    .orderBy(asc(claimSeeds.claimOrder));

  if (rawClaims.length === 0) {
    throw new Error(`No claims found for tutorial`);
  }

  const productInfo = await db.query.products.findFirst({
    where: (products, { eq }) => eq(products.productId, productId),
  });

  if (!productInfo) {
    throw new Error(`Product info not found for product ${productId}`);
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

  // Fetch ABSA aspect data for Dashboard view
  const aspectData = await getAspectData(productInfo.id);

  return (
    <TutorialConditionClient
      claims={rawClaims}
      productData={productInfo as any}
      reviews={mappedReviews}
      starDistribution={starDistribution}
      aspectData={aspectData}
    />
  );
}
