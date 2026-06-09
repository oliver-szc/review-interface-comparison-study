/**
 * Computes the cosine similarity between two vectors of equal length.
 *
 * Cosine similarity measures the cosine of the angle between two vectors,
 * returning a value in the range [-1, 1]:
 *   1  → identical direction
 *   0  → orthogonal (no similarity)
 *  -1  → opposite direction
 *
 * @param a - First numeric vector
 * @param b - Second numeric vector (must be same length as `a`)
 * @returns Cosine similarity value in [-1, 1]
 * @throws Error if vectors have different lengths or are empty
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error(
      `Vector length mismatch: a has ${a.length} elements, b has ${b.length} elements`
    );
  }

  if (a.length === 0) {
    throw new Error('Cannot compute cosine similarity of empty vectors');
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    magnitudeA += a[i] * a[i];
    magnitudeB += b[i] * b[i];
  }

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  // Guard against zero-magnitude vectors (e.g. all-zeros)
  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  return dotProduct / (magnitudeA * magnitudeB);
}
