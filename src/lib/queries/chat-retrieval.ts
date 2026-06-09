import 'server-only';
import { sql } from '@vercel/postgres';

/**
 * Result of a vector similarity search against review embeddings.
 */
export interface SimilarReview {
  reviewId: string;
  reviewText: string;
  starRating: number;
  similarity: number;
}

/**
 * Searches for the most semantically similar reviews to a query vector
 * using pgvector's cosine distance operator (<=>).
 *
 * This function uses @vercel/postgres directly (Edge-compatible) rather
 * than the Drizzle ORM client, which depends on dotenv (Node.js only).
 *
 * The query leverages the HNSW index on review_embeddings.embedding
 * (vector_cosine_ops) for efficient approximate nearest neighbor search.
 *
 * @param queryEmbedding - The 1536-dimensional embedding vector for the user query
 * @param productId - The product enum value (e.g. 'EARBUDS', 'KETTLE', 'SWEATSHIRT')
 * @param limit - Maximum number of results to return (default: 25)
 * @returns Array of matching reviews sorted by similarity (descending)
 */
export async function searchSimilarReviews(
  queryEmbedding: number[],
  productId: string,
  limit: number = 25
): Promise<SimilarReview[]> {
  // Format the embedding as a pgvector-compatible string: '[0.1, 0.2, ...]'
  const vectorString = `[${queryEmbedding.join(',')}]`;

  const result = await sql`
    SELECT
      r.id AS review_id,
      r.review_text,
      r.star_rating,
      1 - (re.embedding <=> ${vectorString}::vector) AS similarity
    FROM reviews r
    INNER JOIN review_embeddings re ON re.review_id = r.id
    INNER JOIN products p ON p.id = r.product_id
    WHERE p.product_id_enum = ${productId}
    ORDER BY re.embedding <=> ${vectorString}::vector ASC
    LIMIT ${limit}
  `;

  return result.rows.map((row) => ({
    reviewId: row.review_id as string,
    reviewText: row.review_text as string,
    starRating: row.star_rating as number,
    similarity: row.similarity as number,
  }));
}
