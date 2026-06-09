/** Converts a snake_case aspect_category key to a human-readable label.
 *  e.g. 'sound_quality' → 'Sound Quality'
 *  Safe to import in both server and client components (no DB dependencies).
 */
export function formatAspectLabel(category: string): string {
  return category
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export type SentimentTier = 'positive' | 'mixed' | 'negative';

/**
 * Classifies a category's overall sentiment using the pos_ratio formula:
 *   pos_ratio = n_pos / (n_pos + n_neg + n_neu)
 *
 * | Tier     | Condition              | Symbol |
 * |----------|------------------------|--------|
 * | positive | pos_ratio >= 2/3       |   ↑   |
 * | mixed    | 1/3 < pos_ratio < 2/3  |   ~   |
 * | negative | pos_ratio <= 1/3       |   ↓   |
 */
export function getSentimentTier(
  positive: number,
  negative: number,
  neutral: number,
): SentimentTier {
  const total = positive + negative + neutral;
  if (total === 0) return 'mixed';
  const posRatio = positive / total;
  if (posRatio >= 2 / 3) return 'positive';
  if (posRatio <= 1 / 3) return 'negative';
  return 'mixed';
}

/** Returns the symbol character for a given sentiment tier. */
export const SENTIMENT_SYMBOL: Record<SentimentTier, string> = {
  positive: '↑',
  mixed: '~',
  negative: '↓',
};

