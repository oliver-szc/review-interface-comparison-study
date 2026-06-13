import { db } from '@/db/client';
import { reviews } from '@/db/schema';
import type { ABSAQuadruple } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { formatAspectLabel } from '@/lib/utils/formatAspect';

export { formatAspectLabel };

export type AspectStat = {
  category: string;   // e.g. 'sound_quality'
  label: string;      // e.g. 'Sound Quality'
  total: number;
  positive: number;
  negative: number;
  neutral: number;
  topReviews: Array<{
    id: string;
    reviewText: string;
    starRating: number;
    userName: string;
    opinionTerm: string;
    aspectTerm: string | null;
    sentiment: 'positive' | 'negative' | 'neutral';
  }>;
};

/**
 * Aggregates ABSA quadruples for all reviews of a given product UUID.
 * Excludes the 'general' catch-all category from the output.
 * Returns categories sorted by total mention count (descending).
 */
export async function getAspectData(productUuid: string): Promise<AspectStat[]> {
  const productReviews = await db
    .select({
      id: reviews.id,
      reviewText: reviews.reviewText,
      starRating: reviews.starRating,
      userName: reviews.userName,
      absaAspects: reviews.absaAspects,
    })
    .from(reviews)
    .where(eq(reviews.productId, productUuid));

  // Map: aspect_category → aggregated stats + all distinct reviews
  const categoryMap = new Map<
    string,
    {
      total: number;
      positive: number;
      negative: number;
      neutral: number;
      topReviews: AspectStat['topReviews'];
      seenReviewIds: Set<string>;
    }
  >();

  for (const review of productReviews) {
    const quads = (review.absaAspects ?? []) as ABSAQuadruple[];
    if (quads.length === 0) continue;

    // Track which categories this review contributes to (avoid duplicate snippets)
    const categoriesSeenInThisReview = new Set<string>();

    for (const quad of quads) {
      const cat = quad.aspect_category;
      if (!cat || cat === 'general') continue;

      // Only count each category once per review so counts match the filtered review list
      if (categoriesSeenInThisReview.has(cat)) continue;
      categoriesSeenInThisReview.add(cat);

      if (!categoryMap.has(cat)) {
        categoryMap.set(cat, {
          total: 0,
          positive: 0,
          negative: 0,
          neutral: 0,
          topReviews: [],
          seenReviewIds: new Set(),
        });
      }

      const entry = categoryMap.get(cat)!;
      entry.total++;

      const sentiment = quad.sentiment_polarity;
      if (sentiment === 'positive') entry.positive++;
      else if (sentiment === 'negative') entry.negative++;
      else entry.neutral++;

      // Add review snippet if we haven't already added this review for this category
      // No cap — all reviews are stored so the UI can paginate freely
      if (!entry.seenReviewIds.has(review.id)) {
        entry.topReviews.push({
          id: review.id,
          reviewText: review.reviewText,
          starRating: review.starRating,
          userName: review.userName ?? 'Anonymous',
          opinionTerm: quad.opinion_term,
          aspectTerm: quad.aspect_term,
          sentiment: quad.sentiment_polarity as 'positive' | 'negative' | 'neutral',
        });
        entry.seenReviewIds.add(review.id);
      }
    }
  }

  // Build sorted result, dropping the internal `seenReviewIds` set
  return Array.from(categoryMap.entries())
    .map(([category, data]) => ({
      category,
      label: formatAspectLabel(category),
      total: data.total,
      positive: data.positive,
      negative: data.negative,
      neutral: data.neutral,
      topReviews: data.topReviews,
    }))
    .sort((a, b) => b.total - a.total);
}
