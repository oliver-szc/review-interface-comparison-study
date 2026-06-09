'use client'

import { useEffect } from 'react'
import type { AspectStat } from '@/lib/queries/absa'
import { useDashboardFilterStore } from '@/stores/dashboardFilterStore'
import { getSentimentTier } from '@/lib/utils/formatAspect'
import { AspectButton } from './AspectButton'
import { AspectDetailPanel } from './AspectDetailPanel'

interface DashboardPanelProps {
  aspectData: AspectStat[]
}

export function DashboardPanel({ aspectData }: DashboardPanelProps) {
  const { activeAspect, setActiveAspect } = useDashboardFilterStore()

  // Default to the first (most frequent) category on mount
  useEffect(() => {
    if (aspectData.length > 0 && !activeAspect) {
      setActiveAspect(aspectData[0].category)
    }
    // Clear filter when component unmounts (navigating away)
    return () => {
      setActiveAspect(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aspectData])

  const selectedStat = aspectData.find((a) => a.category === activeAspect) ?? aspectData[0]

  if (aspectData.length === 0) {
    return (
      <div className="bg-sky-50 rounded-xl border border-sky-400 p-4 mx-auto max-w-4xl w-full">
        <h2 className="text-xl font-bold text-slate-900">What customers say</h2>
        <p className="text-sm text-slate-400 mt-2">No aspect data available for this product.</p>
      </div>
    )
  }

  return (
    <div className="bg-sky-00 rounded-xl rounded-xl border-2 border-sky-400 p-4 space-y-3 mx-auto max-w-4xl w-full">
      {/* Header */}
      <h2 className="text-xl font-bold text-slate-900">
        What customers say
      </h2>
      {/* AI Summary */}
      <p className="text-md text-slate-600">
        Customers like the sound quality, price, and quality of the headphones.
        They mention they&apos;re clear, crisp, and good for gaming. Customers
        also like the fit, saying the earbuds stay in place and fit securely in
        their ears. However, some customers have mixed opinions on connectivity
        and functionality.
      </p>
      <p className="text-xs italic text-slate-500">
        AI-generated from customer reviews
      </p>
      {/* Aspect Selection */}
      <p className="text-base font-semibold text-slate-900">
        Select to learn more:
      </p>
      <div className="flex flex-wrap gap-2">
        {aspectData.map((stat) => (
          <AspectButton
            key={stat.category}
            label={stat.label}
            count={stat.total}
            sentiment={getSentimentTier(stat.positive, stat.negative, stat.neutral)}
            active={activeAspect === stat.category}
            onClick={() => setActiveAspect(
              activeAspect === stat.category ? null : stat.category
            )}
          />
        ))}
      </div>

      {/* Aspect Details */}
      {selectedStat && (
        <AspectDetailPanel stat={selectedStat} />
      )}
    </div>
  )
}
