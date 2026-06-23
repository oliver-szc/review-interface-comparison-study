import fs from 'fs';
import path from 'path';
import readline from 'readline';
import crypto from 'crypto';
import { db } from './client';
import { products, reviews, reviewEmbeddings, type NewReview, type NewReviewEmbedding } from './schema';
import * as dotenv from 'dotenv';
import { eq } from 'drizzle-orm';

dotenv.config({ path: '.env.local' });

const FILES = [
  { path: 'earbuds_asqp_embed.jsonl', productId: 'EARBUDS' as const },
  { path: 'kettle_asqp_embed.jsonl', productId: 'KETTLE' as const },
  { path: 'sweatshirt_asqp_embed.jsonl', productId: 'SWEATSHIRT' as const },
  { path: 'smarttag_asqp_embed.jsonl', productId: 'TUTORIAL' as const },
];

async function ensureProducts() {
  const productData = [
    { productId: 'EARBUDS' as const, domain: 'Electronics', asin: 'earbuds_asin', title: 'Earbuds' },
    { productId: 'KETTLE' as const, domain: 'Home', asin: 'kettle_asin', title: 'Kettle' },
    { productId: 'SWEATSHIRT' as const, domain: 'Clothing', asin: 'sweatshirt_asin', title: 'Sweatshirt' },
    { productId: 'TUTORIAL' as const, domain: 'Electronics', asin: 'smarttag_asin', title: 'Samsung Galaxy SmartTag Bluetooth Tracker' },
  ];

  for (const pd of productData) {
    const existing = await db.select().from(products).where(eq(products.productId, pd.productId));
    if (existing.length === 0) {
      await db.insert(products).values(pd);
    }
  }
}

async function getProductMap() {
  const allProducts = await db.select().from(products);
  const map = new Map<string, string>();
  for (const p of allProducts) {
    if (p.productId) map.set(p.productId, p.id);
  }
  return map;
}

async function processFile(filename: string, productId: string, productUuid: string) {
  const filePath = path.join(__dirname, 'reviews', filename);
  console.log(`Processing ${filePath}...`);
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return;
  }

  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  const batchSize = 100;
  let reviewBatch: NewReview[] = [];
  let embeddingBatch: NewReviewEmbedding[] = [];
  let count = 0;
  let sumRating = 0;
  const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  for await (const line of rl) {
    if (!line.trim()) continue;
    
    try {
      const data = JSON.parse(line);
      const reviewId = crypto.randomUUID();
      const rating = data.rating;
      
      const review: NewReview = {
        id: reviewId,
        productId: productUuid,
        starRating: rating,
        reviewTitle: data.title,
        reviewText: data.text,
        reviewDate: new Date(data.timestamp),
        asin: data.asin,
        parentAsin: data.parent_asin,
        helpfulVote: data.helpful_vote,
        userName: data.user_name,
        absaAspects: data.absa_quadruples,
        absaSentences: data.absa_sentences,
      };

      reviewBatch.push(review);
      
      if (data.embedding) {
        embeddingBatch.push({
          reviewId: reviewId,
          embedding: data.embedding,
        });
      }

      count++;
      sumRating += rating;
      if (rating >= 1 && rating <= 5) {
        ratingDistribution[rating]++;
      }

      if (reviewBatch.length >= batchSize) {
        await db.insert(reviews).values(reviewBatch);
        if (embeddingBatch.length > 0) {
          await db.insert(reviewEmbeddings).values(embeddingBatch);
        }
        reviewBatch = [];
        embeddingBatch = [];
      }
    } catch (err) {
      console.error(`Error parsing line in ${filename}:`, err);
    }
  }

  if (reviewBatch.length > 0) {
    await db.insert(reviews).values(reviewBatch);
    if (embeddingBatch.length > 0) {
      await db.insert(reviewEmbeddings).values(embeddingBatch);
    }
  }

  const avgRating = count > 0 ? sumRating / count : 0;
  await db.update(products)
    .set({
      reviewCount: count,
      averageRating: avgRating.toFixed(2),
      ratingDistribution,
    })
    .where(eq(products.id, productUuid));

  console.log(`Finished inserting ${count} reviews for ${productId}.`);
}

async function main() {
  console.log('Ensuring products exist...');
  await ensureProducts();
  
  const productMap = await getProductMap();

  for (const { productId } of FILES) {
    const uuid = productMap.get(productId);
    if (uuid) {
        await db.delete(reviews).where(eq(reviews.productId, uuid));
    }
  }

  for (const { path: file, productId } of FILES) {
    const uuid = productMap.get(productId);
    if (!uuid) {
      console.error(`Product UUID not found for ${productId}`);
      continue;
    }
    await processFile(file, productId, uuid);
  }
  
  console.log('All files processed.');
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
