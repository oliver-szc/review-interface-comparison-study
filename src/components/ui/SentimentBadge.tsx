'use client';

import type { Sentiment } from '@/types/review';

interface SentimentBadgeProps {
  sentiment: Sentiment;
}

const sentimentClassMap: Record<Sentiment, string> = {
  positive: 'bg-sentiment-positive',
  negative: 'bg-sentiment-negative',
  neutral: 'bg-sentiment-neutral',
};

export function SentimentBadge({ sentiment }: SentimentBadgeProps) {
  const bgClass = sentimentClassMap[sentiment];

  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium text-white ${bgClass}`}>
      {sentiment[0].toUpperCase() + sentiment.slice(1)}
    </span>
  );
}
