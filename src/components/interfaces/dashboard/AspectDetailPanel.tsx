'use client'

import { useState, useMemo, type ReactNode } from 'react'
import type { AspectStat } from '@/lib/queries/absa'

interface AspectDetailPanelProps {
  stat: AspectStat
}

const CONTEXT_WORDS = 10

/**
 * Builds a rendered snippet that:
 * 1. Finds the opinion term (case-insensitive) in the review text
 * 2. Bolds the matched phrase
 * 3. Keeps at most 10 words before and 10 words after the match
 * 4. Adds "..." where content is truncated
 *
 * When expanded, the full text is shown with the opinion term still bolded.
 */
function buildSnippet(
  fullText: string,
  opinionTerm: string,
  expanded: boolean
): { nodes: ReactNode; isTruncated: boolean } {
  // If opinionTerm is null/empty, fall back to simple truncation with no bolding
  if (!opinionTerm) {
    const words = fullText.split(/\s+/)
    if (expanded || words.length <= CONTEXT_WORDS * 2) {
      return { nodes: <>&quot;{fullText}&quot;</>, isTruncated: words.length > CONTEXT_WORDS * 2 }
    }
    return {
      nodes: <>&quot;{words.slice(0, CONTEXT_WORDS * 2).join(' ')}...&quot;</>,
      isTruncated: true,
    }
  }

  // If expanded, show the full text with the opinion term bolded
  if (expanded) {
    const idx = fullText.toLowerCase().indexOf(opinionTerm.toLowerCase())
    if (idx === -1) {
      return { nodes: <>&quot;{fullText}&quot;</>, isTruncated: false }
    }
    const before = fullText.slice(0, idx)
    const match = fullText.slice(idx, idx + opinionTerm.length)
    const after = fullText.slice(idx + opinionTerm.length)
    return {
      nodes: (
        <>
          &quot;{before}<strong className="font-semibold text-slate-800">{match}</strong>{after}&quot;
        </>
      ),
      isTruncated: false,
    }
  }

  // --- Collapsed mode: truncate around the opinion term ---
  const lowerText = fullText.toLowerCase()
  const lowerTerm = opinionTerm.toLowerCase()
  const termIdx = lowerText.indexOf(lowerTerm)

  // If opinion term not found, fall back to first 20 words
  if (termIdx === -1) {
    const words = fullText.split(/\s+/)
    const truncated = words.length > CONTEXT_WORDS * 2
    const display = truncated
      ? words.slice(0, CONTEXT_WORDS * 2).join(' ') + '...'
      : words.join(' ')
    return { nodes: <>&quot;{display}&quot;</>, isTruncated: truncated }
  }

  // Split text into words while preserving character positions
  // We need to figure out which word indices correspond to the opinion term
  const words = fullText.split(/\s+/)
  let charPos = 0
  const wordStarts: number[] = []
  for (let i = 0; i < words.length; i++) {
    // find the start of this word in the original text
    const pos = fullText.indexOf(words[i], charPos)
    wordStarts.push(pos)
    charPos = pos + words[i].length
  }

  // Find the word index that contains the start of the opinion term
  let matchStartWord = 0
  for (let i = 0; i < wordStarts.length; i++) {
    if (wordStarts[i] <= termIdx) {
      matchStartWord = i
    } else {
      break
    }
  }

  // Find the word index that contains the end of the opinion term
  const termEnd = termIdx + opinionTerm.length
  let matchEndWord = matchStartWord
  for (let i = matchStartWord; i < words.length; i++) {
    const wordEnd = wordStarts[i] + words[i].length
    if (wordStarts[i] < termEnd) {
      matchEndWord = i
    } else {
      break
    }
  }

  // Calculate window
  const windowStart = Math.max(0, matchStartWord - CONTEXT_WORDS)
  const windowEnd = Math.min(words.length - 1, matchEndWord + CONTEXT_WORDS)

  const prefixTruncated = windowStart > 0
  const suffixTruncated = windowEnd < words.length - 1

  // Build the visible text from the word window
  const visibleWords = words.slice(windowStart, windowEnd + 1)
  const visibleText = visibleWords.join(' ')

  // Now find the opinion term in this visible substring and bold it
  const visibleLower = visibleText.toLowerCase()
  const visibleTermIdx = visibleLower.indexOf(lowerTerm)

  const isTruncated = prefixTruncated || suffixTruncated

  if (visibleTermIdx === -1) {
    // Shouldn't happen, but safety fallback
    return {
      nodes: (
        <>
          &quot;{prefixTruncated ? '...' : ''}{visibleText}{suffixTruncated ? '...' : ''}&quot;
        </>
      ),
      isTruncated,
    }
  }

  const before = visibleText.slice(0, visibleTermIdx)
  const match = visibleText.slice(visibleTermIdx, visibleTermIdx + opinionTerm.length)
  const after = visibleText.slice(visibleTermIdx + opinionTerm.length)

  return {
    nodes: (
      <>
        &quot;{prefixTruncated ? '...' : ''}
        {before}
        <strong className="font-semibold text-slate-800">{match}</strong>
        {after}
        {suffixTruncated ? '...' : ''}&quot;
      </>
    ),
    isTruncated,
  }
}

function ReviewSnippet({
  reviewText,
  starRating,
  userName,
  opinionTerm,
}: {
  reviewText: string
  starRating: number
  userName: string
  opinionTerm: string
}) {
  const [expanded, setExpanded] = useState(false)

  const { nodes, isTruncated } = useMemo(
    () => buildSnippet(reviewText, opinionTerm, expanded),
    [reviewText, opinionTerm, expanded]
  )

  // Show the toggle whenever the text was truncated OR is being expanded
  const showToggle = isTruncated || expanded

  return (
    <li className="border-t border-slate-100 pt-2 first:border-t-0 first:pt-0">
      {/* Review meta */}
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-xs">
          <span className="text-[#ff9900]">{'★'.repeat(starRating)}</span>
          <span className="text-slate-300">{'☆'.repeat(5 - starRating)}</span>
        </span>
        <span className="text-slate-400 text-[10px]">by {userName}</span>
      </div>
      {/* Text + inline "Read more" */}
      <p className="text-slate-600 text-xs leading-relaxed">
        {nodes}
        {showToggle && (
          <>
            {' '}
            <button
              onClick={() => setExpanded((prev) => !prev)}
              className="text-[10px] text-slate-500 hover:underline font-medium inline"
            >
              {expanded ? 'Collapse ◂' : 'Read more ▸'}
            </button>
          </>
        )}
      </p>
    </li>
  )
}

export function AspectDetailPanel({ stat }: AspectDetailPanelProps) {
  return (
    <div className="bg-white rounded-lg p-3 text-xs text-slate-600 space-y-2 border border-slate-200">
      {/* Mention summary */}
      <p className="font-medium text-slate-700">
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
              opinionTerm={review.opinionTerm}
            />
          ))}
        </ul>
      ) : (
        <p className="text-slate-400 italic">No review snippets available.</p>
      )}
    </div>
  )
}
