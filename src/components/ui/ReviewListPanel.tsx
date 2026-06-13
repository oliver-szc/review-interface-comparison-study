'use client'

import { useState, useEffect, type ComponentProps } from 'react'
import { ReviewCard } from './ReviewCard'
import { StarHistogram } from './StarHistogram'
import { ReviewSortFilterBar } from './ReviewSortFilterBar'
import type { ABSAQuadruple } from '@/db/schema'

interface Review {
  name: string
  stars: number
  date: string
  text: string
  title?: string | null
  timestamp?: number
  helpfulVotes?: number
  absaAspects?: ABSAQuadruple[]
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

  const [filters, setFilters] = useState<SortFilters>({
    sort: 'recent',
    stars: 'all',
    sentiment: 'all',
    search: '',
  })



  // Convert { stars, count } → { star, percentage } for StarHistogram
  const distribution = starDistribution.map(({ stars, count }) => ({
    star: stars,
    percentage: totalCount > 0 ? Math.round((count / totalCount) * 100) : 0,
  }))

  let visibleReviews = reviews



  // Filter: Search phrase
  if (filters.search) {
    const q = filters.search.toLowerCase()
    visibleReviews = visibleReviews.filter((r) =>
      r.text.toLowerCase().includes(q)
    )
  }

  // Filter: Stars (dropdown)
  if (filters.stars !== 'all') {
    if (filters.stars === 'positive') {
      visibleReviews = visibleReviews.filter((r) => r.stars >= 4)
    } else if (filters.stars === 'critical') {
      visibleReviews = visibleReviews.filter((r) => r.stars <= 3)
    } else {
      const targetStars = parseInt(filters.stars, 10)
      visibleReviews = visibleReviews.filter((r) => r.stars === targetStars)
    }
  }

  // Sort
  visibleReviews = [...visibleReviews].sort((a, b) => {
    const timeA = a.timestamp || new Date(a.date).getTime() || 0;
    const timeB = b.timestamp || new Date(b.date).getTime() || 0;
    const timeDiff = timeB - timeA;

    if (filters.sort === 'helpful') {
      const diff = (Number(b.helpfulVotes) || 0) - (Number(a.helpfulVotes) || 0)
      return diff === 0 ? timeDiff : diff;
    } else if (filters.sort === 'recent') {
      return timeDiff;
    } else if (filters.sort === 'rating_asc') {
      const diff = Number(a.stars) - Number(b.stars);
      return diff === 0 ? timeDiff : diff;
    } else if (filters.sort === 'rating_desc') {
      const diff = Number(b.stars) - Number(a.stars);
      return diff === 0 ? timeDiff : diff;
    }
    return 0
  })

  const [loadedCount, setLoadedCount] = useState(20)

  useEffect(() => {
    setLoadedCount(20)
  }, [filters])

  const paginatedReviews = visibleReviews.slice(0, loadedCount)
  const currentlyShown = paginatedReviews.length
  const totalInPool = visibleReviews.length
  const progressPercent = totalInPool > 0 ? (currentlyShown / totalInPool) * 100 : 0

  return (
    <div className="bg-white rounded-xl p-4 mx-auto max-w-4xl w-full">
      <h2 className="text-2xl font-bold text-slate-900">Customer reviews</h2>

      {/* Star Histogram */}
      <div className="mb-4">
        <div className="w-full max-w-[320px]">
          <StarHistogram
            averageRating={averageRating}
            totalCount={totalCount}
            distribution={distribution}
            activeFilter={
              ['5', '4', '3', '2', '1'].includes(filters.stars)
                ? parseInt(filters.stars, 10)
                : null
            }
            onStarFilter={(star) => {
              const newStars = filters.stars === String(star) ? 'all' : String(star) as any
              setFilters({ ...filters, stars: newStars })
            }}
          />
        </div>
      </div>

      <hr className="border-slate-200 mb-4" />



      {/* Sort / Filter Bar */}
      <div className="mb-4 w-full">
        <ReviewSortFilterBar
          filters={filters}
          onChange={(f) => setFilters(f)}
        />
      </div>

      <hr className="border-slate-200 mb-4" />

      {/* Review Cards */}
      <div className="space-y-3">
        {totalInPool === 0 ? (
          <div className="py-8 px-4 text-center text-slate-500 border border-dashed border-slate-200 rounded-xl bg-white text-sm">
            No reviews match your selected filters. Try removing filters or adjusting your search term.
          </div>
        ) : (
          paginatedReviews.map((review, index) => (
            <ReviewCard
              key={index}
              name={review.name}
              stars={review.stars}
              date={review.date}
              text={review.text}
              title={review.title}
              searchQuery={filters.search}
            />
          ))
        )}
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
