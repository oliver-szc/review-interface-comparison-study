'use client'

import { useEffect, useMemo } from 'react'
import type { AspectStat } from '@/lib/queries/absa'
import { useDashboardFilterStore } from '@/stores/dashboardFilterStore'
import { getSentimentTier } from '@/lib/utils/formatAspect'
import { AspectButton } from './AspectButton'
import { AspectDetailPanel } from './AspectDetailPanel'

interface DashboardPanelProps {
  aspectData: AspectStat[]
  productId?: string
}

const PRODUCT_SUMMARIES: Record<string, string> = {
  EARBUDS: "Customers like the sound quality, active noise cancellation, and battery life of the earbuds. They mention the audio is exceptional and the earbuds last for hours on a single charge. Customers also appreciate the companion app for its helpful customization features. However, some reviewers disagree on the reliability of the touch controls.",
  KETTLE: "Customers like the boiling speed, price, and overall design of the kettle. They mention the kettle heats water quickly and offers great value for the money. Customers also appreciate the large water capacity. However, some customers disagree on the temperature control capabilities.",
  SWEATSHIRT: "Customers like the material quality, price, and fit of the sweatshirt. They mention the fabric is soft and the product is a great value for the money. Customers also appreciate the overall style. However, some customers disagree on the material thickness, noting it is not a true heavyweight sweatshirt."
}

export function DashboardPanel({ aspectData, productId }: DashboardPanelProps) {
  const { activeAspect, setActiveAspect } = useDashboardFilterStore()

  // Sort aspects: first positive, then mixed, then negative. Keep original order within tiers.
  const sortedAspectData = useMemo(() => {
    const order = { positive: 0, mixed: 1, negative: 2 }
    return [...aspectData].sort((a, b) => {
      const tierA = getSentimentTier(a.positive, a.negative, a.neutral)
      const tierB = getSentimentTier(b.positive, b.negative, b.neutral)
      if (tierA !== tierB) {
        return order[tierA] - order[tierB]
      }
      return aspectData.indexOf(a) - aspectData.indexOf(b)
    })
  }, [aspectData])

  // Default to the first category in sorted order on mount
  useEffect(() => {
    if (sortedAspectData.length > 0 && !activeAspect) {
      setActiveAspect(sortedAspectData[0].category)
    }
    // Clear filter when component unmounts (navigating away)
    return () => {
      setActiveAspect(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortedAspectData])

  const selectedStat = sortedAspectData.find((a) => a.category === activeAspect) ?? sortedAspectData[0]

  const productKey = (productId || 'EARBUDS').toUpperCase()
  const summaryText = PRODUCT_SUMMARIES[productKey] || PRODUCT_SUMMARIES.EARBUDS

  if (sortedAspectData.length === 0) {
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
        {summaryText}
      </p>
      <p className="text-xs italic text-slate-500">
        AI-generated from customer reviews
      </p>
      {/* Aspect Selection */}
      <p className="text-base font-semibold text-slate-900">
        Select to learn more:
      </p>
      <div className="flex flex-wrap gap-2">
        {sortedAspectData.map((stat) => (
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
