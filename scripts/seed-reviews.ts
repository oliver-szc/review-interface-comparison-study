import { db } from '../src/db/client';
import { reviews, products } from '../src/db/schema';

const mockReviews = (productId: string) => [
  {
    productId,
    reviewText: 'Great sound quality, but battery life could be better.',
    starRating: 4,
    reviewTitle: 'Good but not perfect',
    absaAspects: [
      { quad_id: 1, aspect_category: 'sound_quality', aspect_term: 'sound quality', opinion_term: 'great', sentiment_polarity: 'positive' as const },
      { quad_id: 2, aspect_category: 'battery_life', aspect_term: 'battery life', opinion_term: 'could be better', sentiment_polarity: 'negative' as const },
    ],
  },
  // ... 9 more reviews
];

async function seed() {
  const productList = await db.select().from(products);

  for (const product of productList) {
    await db.insert(reviews).values(mockReviews(product.id));
  }

  console.log('✅ Seeded 30 reviews (10 per product)');
}

seed();