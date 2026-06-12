'use client'

import type { SentimentTier } from '@/lib/utils/formatAspect'
import { SENTIMENT_SYMBOL } from '@/lib/utils/formatAspect'

interface AspectButtonProps {
  label: string
  active: boolean
  count?: number
  sentiment: SentimentTier
  onClick: () => void
}

const TIER_STYLES: Record<
  SentimentTier,
  {
    icon: string          // bg color of the icon pill
    iconText: string      // text color inside icon
    activeBg: string      // button bg when active
    activeBorder: string  // button border when active
    hoverBg: string
  }
> = {
  positive: {
    icon: 'bg-green-50 text-green-600',
    iconText: 'text-green-700',
    activeBg: 'bg-tranparent',
    activeBorder: 'border-slate-400',
    hoverBg: 'hover:bg-slate-50',
  },
  mixed: {
    icon: 'bg-slate-50 text-slate-500',
    iconText: 'text-slate-600',
    activeBg: 'bg-tranparent',
    activeBorder: 'border-slate-400',
    hoverBg: 'hover:bg-slate-50',
  },
  negative: {
    icon: 'bg-red-50 text-red-400',
    iconText: 'text-red-600',
    activeBg: 'bg-tranparent',
    activeBorder: 'border-slate-400',
    hoverBg: 'hover:bg-slate-50',
  },
}

export function AspectButton({ label, active, count, sentiment, onClick }: AspectButtonProps) {
  const tier = TIER_STYLES[sentiment]

  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 rounded-full border text-xs
        transition-all duration-150 font-medium select-none
        ${active
          ? `${tier.activeBg} ${tier.activeBorder} shadow-sm`
          : `border-slate-200 ${tier.hoverBg} hover:border-slate-300`
        }
      `}
    >
      {/* Sentiment icon pill */}
      <span
        className={`
          inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold leading-none
          ${tier.icon}
        `}
        aria-hidden="true"
      >
        {SENTIMENT_SYMBOL[sentiment]}
      </span>

      {/* Label */}
      <span className="text-slate-800 leading-none">{label}</span>

      {/* Count */}
      {count !== undefined && (
        <span className="text-slate-500 font-normal leading-none">({count})</span>
      )}
    </button>
  )
}
