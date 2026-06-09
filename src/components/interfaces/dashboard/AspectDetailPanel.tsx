'use client'

import { useState } from 'react'
import type { AspectStat } from '@/lib/queries/absa'

interface AspectDetailPanelProps {
  stat: AspectStat
}

const SNIPPET_LENGTH = 160

function ReviewSnippet({
  reviewText,
  starRating,
  userName,
}: {
  reviewText: string
  starRating: number
  userName: string
}) {
  const [expanded, setExpanded] = useState(false)
  const isLong = reviewText.length > SNIPPET_LENGTH
  const displayText = expanded || !isLong
    ? reviewText
    : reviewText.slice(0, SNIPPET_LENGTH).trimEnd() + '…'

  return (
    <li className="border-t border-slate-100 pt-2 first:border-t-0 first:pt-0">
      {/* Review meta */}
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-amber-400 text-xs">{'★'.repeat(starRating)}{'☆'.repeat(5 - starRating)}</span>
        <span className="text-slate-400 text-[10px]">by {userName}</span>
      </div>
      {/* Text */}
      <p className="text-slate-600 text-xs leading-relaxed">
        &quot;{displayText}&quot;
      </p>
      {isLong && (
        <button
          onClick={() => setExpanded((prev) => !prev)}
          className="text-[10px] text-amazon hover:underline mt-0.5 font-medium"
        >
          {expanded ? 'Collapse ▲' : 'Read more ▼'}
        </button>
      )}
    </li>
  )
}

export function AspectDetailPanel({ stat }: AspectDetailPanelProps) {
  return (
    <div className="bg-white rounded-lg p-3 text-xs text-slate-600 space-y-2 border border-slate-200">
      {/* Mention summary */}
      <p className="font-semibold text-slate-700">
        {stat.total} customers mention {stat.label} ・{' '}
        <span className="text-green-600">{stat.positive} positive</span>,{' '}
        <span className="text-red-500">{stat.negative} negative</span>
        {stat.neutral > 0 && (
          <>, <span className="text-slate-400">{stat.neutral} neutral</span></>
        )}
      </p>

      {/* Review snippets */}
      {stat.topReviews.length > 0 ? (
        <ul className="space-y-2 pt-1">
          {stat.topReviews.map((review) => (
            <ReviewSnippet
              key={review.id}
              reviewText={review.reviewText}
              starRating={review.starRating}
              userName={review.userName}
            />
          ))}
        </ul>
      ) : (
        <p className="text-slate-400 italic">No review snippets available.</p>
      )}
    </div>
  )
}
