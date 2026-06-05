'use client'

import { useState, useEffect, type ComponentProps } from 'react'
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
  const [filters, setFilters] = useState<SortFilters>({
    sort: 'none',
    stars: 'all',
    sentiment: 'all',
    search: '',
  })

  // Convert { stars, count } → { star, percentage } for StarHistogram
  const distribution = starDistribution.map(({ stars, count }) => ({
    star: stars,
    percentage: totalCount > 0 ? Math.round((count / totalCount) * 100) : 0,
  }))

  const visibleReviews = activeStarFilter
    ? reviews.filter((r) => r.stars === activeStarFilter)
    : reviews

  const [loadedCount, setLoadedCount] = useState(20)

  useEffect(() => {
    setLoadedCount(20)
  }, [activeStarFilter, filters])

  const paginatedReviews = visibleReviews.slice(0, loadedCount)
  const currentlyShown = paginatedReviews.length
  const totalInPool = visibleReviews.length
  const progressPercent = totalInPool > 0 ? (currentlyShown / totalInPool) * 100 : 0

  return (
    <div className="bg-white rounded-xl p-4 mx-auto max-w-4xl w-full">
      <h2 className="text-xl font-semibold text-slate-900">Customer Reviews</h2>

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
        {paginatedReviews.map((review, index) => (
          <ReviewCard
            key={index}
            name={review.name}
            stars={review.stars}
            date={review.date}
            text={review.text}
          />
        ))}
      </div>

      {/* Pagination Status & Button */}
      {totalInPool > 0 && (
        <div className="mt-8 flex flex-col items-center">
          <p className="text-sm text-slate-600 mb-2 font-medium">
            {currentlyShown} out of {totalInPool} reviews
          </p>
          <div className="w-64 h-1.5 bg-slate-100 rounded-full mb-6 overflow-hidden">
            <div
              className="h-full bg-slate-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {currentlyShown < totalInPool && (
            <button
              onClick={() => setLoadedCount(prev => prev + 20)}
              className="px-6 py-2.5 border border-slate-300 rounded-lg text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
            >
              Show 20 more reviews
            </button>
          )}
        </div>
      )}
    </div>
  )
}
