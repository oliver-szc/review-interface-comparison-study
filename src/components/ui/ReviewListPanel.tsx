'use client'

import { useState, type ComponentProps } from 'react'
import { ReviewCard } from './ReviewCard'
import { StarHistogram } from './StarHistogram'
import { ReviewSortFilterBar } from './ReviewSortFilterBar'

interface Review {
  name: string
  stars: number
  date: string
  text: string
}

interface StarCount {
  stars: number
  count: number
}

interface ReviewListPanelProps {
  reviews: Review[]
  starDistribution: StarCount[]
  averageRating: number
  totalCount: number
}

type SortFilters = ComponentProps<typeof ReviewSortFilterBar>['filters']

export function ReviewListPanel({
  reviews,
  starDistribution,
  averageRating,
  totalCount,
}: ReviewListPanelProps) {
  const [activeStarFilter, setActiveStarFilter] = useState<number | null>(null)
  const [filters, setFilters] = useState<SortFilters>({} as SortFilters)

  // Convert { stars, count } → { star, percentage } for StarHistogram
  const distribution = starDistribution.map(({ stars, count }) => ({
    star: stars,
    percentage: totalCount > 0 ? Math.round((count / totalCount) * 100) : 0,
  }))

  const visibleReviews = activeStarFilter
    ? reviews.filter((r) => r.stars === activeStarFilter)
    : reviews

  return (
    <div className="bg-white rounded-xl p-4 mx-auto max-w-4xl w-full">
      <h2 className="text-sm font-semibold text-slate-900">Customer Reviews</h2>

      {/* Star Histogram */}
      <div className="mb-4">
        <div className="w-full max-w-[320px]">
          <StarHistogram
            averageRating={averageRating}
            totalCount={totalCount}
            distribution={distribution}
            activeFilter={activeStarFilter}
            onStarFilter={(star) =>
              setActiveStarFilter(star === activeStarFilter ? null : star)
            }
          />
        </div>
      </div>

      <hr className="border-slate-200 mb-4" />

      {/* Sort / Filter Bar */}
      <div className="mb-4 w-1/2">
        <ReviewSortFilterBar
          filters={filters}
          onChange={(f) => setFilters(f)}
        />
      </div>

      <hr className="border-slate-200 mb-4" />

      {/* Review Cards */}
      <div className="space-y-3">
        {visibleReviews.map((review, index) => (
          <ReviewCard
            key={index}
            name={review.name}
            stars={review.stars}
            date={review.date}
            text={review.text}
          />
        ))}
      </div>
    </div>
  )
}
