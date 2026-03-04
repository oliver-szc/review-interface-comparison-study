export type Sentiment = 'positive' | 'negative' | 'neutral';

export type SortOption =
  | 'most-recent'
  | 'oldest'
  | 'highest-rated'
  | 'lowest-rated'
  | 'most-helpful'
  | 'positive-first'
  | 'negative-first';

export interface Filters {
  stars: number[];
  sentiment: Sentiment[];
  sortBy: SortOption;
}

export interface ReviewCardProps {
  reviewText: string;
  starRating: number;
  sentiment: Sentiment;
  aspects?: string[];
  isHighlighted?: boolean;
  onView?: () => void;
}
