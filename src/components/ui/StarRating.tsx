'use client';

type StarRatingProps = {
  rating: number;
  max?: number;
  className?: string;
};

export function StarRating({ rating, max = 5, className = '' }: StarRatingProps) {
  const filledStars = Math.round(Math.max(0, Math.min(rating, max)));

  return (
    <div className={`flex items-center gap-1 ${className}`} aria-label={`Rating: ${rating} out of ${max}`}>
      {Array.from({ length: max }, (_, i) => {
        const filled = i < filledStars;
        return (
          <span key={i} className={filled ? 'text-amber-500' : 'text-slate-300'}>
            ★
          </span>
        );
      })}
      <span className="ml-1 text-sm text-slate-600">{rating.toFixed(1)}</span>
    </div>
  );
}