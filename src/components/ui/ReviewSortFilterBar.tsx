'use client'

import { Search } from 'lucide-react'
import { useState, useEffect } from 'react'

export type SortOption = 'helpful' | 'recent' | 'rating_asc' | 'rating_desc'
export type StarFilter = 'all' | '5' | '4' | '3' | '2' | '1' | 'positive' | 'critical'
export type SentimentFilter = 'all' | 'positive' | 'negative' | 'neutral'

export interface ReviewFilters {
  sort: SortOption
  stars: StarFilter
  sentiment: SentimentFilter
  search: string
}

interface ReviewSortFilterBarProps {
  filters: ReviewFilters
  onChange: (filters: ReviewFilters) => void
}

const selectClass =
  'text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-amazon cursor-pointer hover:border-slate-300 transition'

export function ReviewSortFilterBar({ filters, onChange }: ReviewSortFilterBarProps) {
  const [localSearch, setLocalSearch] = useState(filters.search)

  useEffect(() => {
    setLocalSearch(filters.search)
  }, [filters.search])

  function update(partial: Partial<ReviewFilters>) {
    onChange({ ...filters, ...partial })
  }

  function handleSearchSubmit() {
    update({ search: localSearch })
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      handleSearchSubmit()
    }
  }

  return (
    <div className="space-y-2">

      <div className="w-fit flex flex-col">
        {/* Row 1 — Search */}
        <div className="flex gap-2 mt-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="search"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search customer reviews"
              className="w-full text-xs border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-amazon placeholder:text-slate-400"
            />
          </div>
          <button
            onClick={handleSearchSubmit}
            className="text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg transition"
          >
            Search
          </button>
        </div>

        {/* Row 2 — Sort + Filters */}
        <div className="flex flex-wrap items-end gap-5 mt-4">

          {/* Sort by */}
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Sort by</p>
            <select
              value={filters.sort}
              onChange={(e) => update({ sort: e.target.value as SortOption })}
              className={selectClass}
            >
              <option value="recent">Most recent</option>
              <option value="rating_asc">Rating ascending (lowest first)</option>
              <option value="rating_desc">Rating descending (highest first)</option>
            </select>
          </div>

          {/* Filter by — star rating */}
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Filter by</p>
            <div className="flex flex-wrap gap-2">
              <select
                value={filters.stars}
                onChange={(e) => update({ stars: e.target.value as StarFilter })}
                className={selectClass}
              >
                <optgroup label="Star rating">
                  <option value="all">All stars</option>
                  <option value="5">5 stars only</option>
                  <option value="4">4 stars only</option>
                  <option value="3">3 stars only</option>
                  <option value="2">2 stars only</option>
                  <option value="1">1 star only</option>
                </optgroup>
                <optgroup label="Sentiment">
                  <option value="positive">Positive reviews</option>
                  <option value="critical">Critical reviews</option>
                </optgroup>
              </select>

              {/* Sentiment filter removed per request */}
            </div>
          </div>

        </div>
      </div>

      {/* Active filter badge */}
      {(filters.stars !== 'all' || filters.search) && (
        <div className="flex items-center gap-2 flex-wrap pt-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Active filters:
          </span>
          {filters.stars !== 'all' && (
            <span className="text-xs bg-white text-amazon border border-amazon/30 px-2 py-0.5 rounded-full">
              {['positive', 'critical'].includes(filters.stars)
                ? filters.stars.charAt(0).toUpperCase() + filters.stars.slice(1)
                : `${filters.stars} ★`}
            </span>
          )}
          {filters.search && (
            <span className="text-xs bg-white text-amazon border border-amazon/30 px-2 py-0.5 rounded-full">
              "{filters.search}"
            </span>
          )}
          <button
            onClick={() => onChange({ ...filters, stars: 'all', search: '' })}
            className="text-xs text-slate-400 underline hover:text-slate-600"
          >
            Clear All
          </button>
        </div>
      )}

    </div>
  )
}
