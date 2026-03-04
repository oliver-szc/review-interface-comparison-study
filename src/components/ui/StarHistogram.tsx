'use client'

interface StarHistogramProps {
  distribution: { star: number; percentage: number }[]
  averageRating: number
  totalReviews?: number
  totalCount: number
  onStarFilter?: (star: number) => void
  activeFilter?: number | null
}

export function StarHistogram({
  distribution,
  averageRating,
  totalCount,
  onStarFilter,
  activeFilter,
}: StarHistogramProps) {
  return (
    <div className="space-y-2">
      {/* Average + total */}
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-semibold text-slate-800">{averageRating.toFixed(1)}</span>
        <span className="text-sm text-slate-400">out of 5</span>
      </div>
      <p className="text-xs text-slate-400">
        {totalCount.toLocaleString()} global ratings
      </p>

      {/* Histogram rows */}
      <ul className="space-y-1.5 pt-1">
        {distribution.map(({ star, percentage }) => (
          <li key={star}>
            <button
              onClick={() => onStarFilter?.(star)}
              className={`w-full flex items-center gap-2 group rounded-md px-1 py-0.5 transition
                ${activeFilter === star ? 'ring-1 ring-amazon' : 'hover:bg-slate-50'}`}
              aria-label={`${percentage}% of reviews have ${star} stars`}
            >
              {/* Label */}
              <span className="text-xs text-amazon hover:underline w-10 shrink-0 text-left">
                {star} {star === 1 ? 'star' : 'stars'}
              </span>

              {/* Bar */}
              <div className="flex-1 h-3 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-amazon-light transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>

              {/* Percentage */}
              <span className="text-xs text-amazon w-8 text-right shrink-0">
                {percentage}%
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
