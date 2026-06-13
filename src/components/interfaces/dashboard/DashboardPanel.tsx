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
  EARBUDS: "Customers like the overall sound quality, noise cancelling capabilities, and price of the earbuds. They mention that the audio sounds clear with good bass and that the price offers great value. Customers also appreciate the long battery life and the useful companion app. However, some customers disagree on the reliability of the touch controls.",
  KETTLE: "Customers like the functionality, heating speed, and price of the electric kettle. They mention it boils water rapidly and provides excellent value. Customers also appreciate the reliable auto shutoff. However, some customers disagree on the overall quality.",
  SWEATSHIRT: "Customers like the comfort, price, and warmth of the sweatshirt. They mention feeling very cozy wearing it and getting an excellent deal for the cost. Customers also appreciate the durable material quality and nice colors. However, some customers disagree on the overall fit and sizing."
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
    if (sortedAspectData.length > 0) {
      const hasActiveAspect = sortedAspectData.some((a) => a.category === activeAspect)
      if (!hasActiveAspect) {
        setActiveAspect(sortedAspectData[0].category)
      }
    }
    // Clear filter when component unmounts (navigating away)
    return () => {
      setActiveAspect(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortedAspectData])

  const currentActiveAspect = activeAspect && sortedAspectData.some((a) => a.category === activeAspect)
    ? activeAspect
    : (sortedAspectData[0]?.category || null)

  const selectedStat = sortedAspectData.find((a) => a.category === currentActiveAspect) ?? sortedAspectData[0]

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
            active={currentActiveAspect === stat.category}
            onClick={() => setActiveAspect(
              currentActiveAspect === stat.category ? null : stat.category
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
