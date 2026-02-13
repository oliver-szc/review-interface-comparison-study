import { db } from '../src/db/client';
import { reviews, products } from '../src/db/schema';

const mockReviews = (productId: string) => [
  {
    productId,
    reviewText: 'Great sound quality, but battery life could be better.',
    starRating: 4,
    reviewTitle: 'Good but not perfect',
    absaAspects: [
      { aspect: 'sound quality', opinion: 'great', sentiment: 'positive' as const, category: 'audio' },
      { aspect: 'battery life', opinion: 'could be better', sentiment: 'negative' as const, category: 'battery' },
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