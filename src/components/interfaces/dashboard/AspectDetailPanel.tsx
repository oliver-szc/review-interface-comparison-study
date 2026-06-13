'use client'

import { useState, useMemo, useEffect, type ReactNode } from 'react'
import type { AspectStat } from '@/lib/queries/absa'

interface AspectDetailPanelProps {
  stat: AspectStat
}

const CONTEXT_WORDS = 10

function findTermIdx(text: string, term: string, referenceIdx: number = -1): number {
  if (!term) return -1
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  // Match the term ensuring it's surrounded by non-word boundaries (like spaces, punctuation, or start/end of string)
  const regex = new RegExp(`(^|\\W)(${escaped})(?=\\W|$)`, 'gi')
  const indices: number[] = []

  let match;
  while ((match = regex.exec(text)) !== null) {
    indices.push(match.index + match[1].length)
  }

  if (indices.length === 0) {
    // Fallback to simple indexOf if strict boundaries don't match
    let idx = text.toLowerCase().indexOf(term.toLowerCase())
    while (idx !== -1) {
      indices.push(idx)
      idx = text.toLowerCase().indexOf(term.toLowerCase(), idx + term.length)
    }
  }

  if (indices.length === 0) return -1;
  if (indices.length === 1 || referenceIdx === -1) return indices[0];

  let closestIdx = indices[0];
  let minDiff = Math.abs(indices[0] - referenceIdx);
  for (let i = 1; i < indices.length; i++) {
    const diff = Math.abs(indices[i] - referenceIdx);
    if (diff < minDiff) {
      minDiff = diff;
      closestIdx = indices[i];
    }
  }

  return closestIdx;
}

function highlightTerms(
  text: string,
  opinionTerm: string | null,
  aspectTerm: string | null,
  sentiment: 'positive' | 'negative' | 'neutral'
): ReactNode {
  if (!opinionTerm && !aspectTerm) return <>{text}</>

  type Match = { start: number; end: number; term: string }
  const matches: Match[] = []

  let opIdx = -1;
  if (opinionTerm) {
    opIdx = findTermIdx(text, opinionTerm)
    if (opIdx !== -1) {
      matches.push({ start: opIdx, end: opIdx + opinionTerm.length, term: opinionTerm })
    }
  }

  if (aspectTerm) {
    const asIdx = findTermIdx(text, aspectTerm, opIdx)
    if (asIdx !== -1) {
      matches.push({ start: asIdx, end: asIdx + aspectTerm.length, term: aspectTerm })
    }
  }

  if (matches.length === 0) return <>{text}</>

  matches.sort((a, b) => a.start - b.start)

  const merged: Match[] = []
  for (const m of matches) {
    if (merged.length === 0) {
      merged.push(m)
      continue
    }
    const last = merged[merged.length - 1]
    if (m.start <= last.end) {
      last.end = Math.max(last.end, m.end)
    } else {
      merged.push(m)
    }
  }

  const underlineColor =
    sentiment === 'positive'
      ? 'decoration-green-400/90'
      : sentiment === 'negative'
        ? 'decoration-red-400/90'
        : 'decoration-gray-400/90'

  const nodes: ReactNode[] = []
  let lastIdx = 0
  merged.forEach((m, i) => {
    nodes.push(text.slice(lastIdx, m.start))
    nodes.push(
      <strong
        key={i}
        className={`font-semibold text-slate-800 underline decoration-[0.1rem] underline-offset-2 ${underlineColor}`}
      >
        {text.slice(m.start, m.end)}
      </strong>
    )
    lastIdx = m.end
  })
  nodes.push(text.slice(lastIdx))

  return <>{nodes}</>
}

/**
 * Builds a rendered snippet that:
 * 1. Finds both the opinion term and aspect term (case-insensitive, preferring standalone words) in the review text
 * 2. Bolds the matched phrases
 * 3. Keeps at most 10 words before and 10 words after the match
 * 4. Adds "..." where content is truncated
 *
 * When expanded, the full text is shown with the terms still bolded.
 */
function buildSnippet(
  fullText: string,
  opinionTerm: string | null,
  aspectTerm: string | null,
  sentiment: 'positive' | 'negative' | 'neutral',
  expanded: boolean
): { nodes: ReactNode; isTruncated: boolean } {
  const termsToHighlight = [opinionTerm, aspectTerm].filter(Boolean) as string[]

  if (termsToHighlight.length === 0) {
    const words = fullText.split(/\s+/)
    if (expanded || words.length <= CONTEXT_WORDS * 2) {
      return { nodes: <>&quot;{fullText}&quot;</>, isTruncated: words.length > CONTEXT_WORDS * 2 }
    }
    return {
      nodes: <>&quot;{words.slice(0, CONTEXT_WORDS * 2).join(' ')}...&quot;</>,
      isTruncated: true,
    }
  }

  if (expanded) {
    return {
      nodes: <>&quot;{highlightTerms(fullText, opinionTerm, aspectTerm, sentiment)}&quot;</>,
      isTruncated: false,
    }
  }

  // Collapsed mode: center around the first matched term
  let primaryTermIdx = -1
  let primaryTermLength = 0

  const opIdx = opinionTerm ? findTermIdx(fullText, opinionTerm) : -1
  const asIdx = aspectTerm ? findTermIdx(fullText, aspectTerm, opIdx) : -1

  const validIdxs = [
    { idx: opIdx, len: opinionTerm?.length || 0 },
    { idx: asIdx, len: aspectTerm?.length || 0 }
  ].filter(x => x.idx !== -1).sort((a, b) => a.idx - b.idx)

  if (validIdxs.length > 0) {
    primaryTermIdx = validIdxs[0].idx
    primaryTermLength = validIdxs[0].len
  }

  // If no terms found, fall back to first 20 words
  if (primaryTermIdx === -1) {
    const words = fullText.split(/\s+/)
    const truncated = words.length > CONTEXT_WORDS * 2
    const display = truncated
      ? words.slice(0, CONTEXT_WORDS * 2).join(' ') + '...'
      : words.join(' ')
    return { nodes: <>&quot;{display}&quot;</>, isTruncated: truncated }
  }

  // Split text into words while preserving character positions
  // We need to figure out which word indices correspond to the primary term
  const words = fullText.split(/\s+/)
  let charPos = 0
  const wordStarts: number[] = []
  for (let i = 0; i < words.length; i++) {
    // find the start of this word in the original text
    const pos = fullText.indexOf(words[i], charPos)
    wordStarts.push(pos)
    charPos = pos + words[i].length
  }

  // Find the word index that contains the start of the primary term
  let matchStartWord = 0
  for (let i = 0; i < wordStarts.length; i++) {
    if (wordStarts[i] <= primaryTermIdx) {
      matchStartWord = i
    } else {
      break
    }
  }

  // Find the word index that contains the end of the primary term
  const termEnd = primaryTermIdx + primaryTermLength
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

  const isTruncated = prefixTruncated || suffixTruncated

  return {
    nodes: (
      <>
        &quot;{prefixTruncated ? '...' : ''}
        {highlightTerms(visibleText, opinionTerm, aspectTerm, sentiment)}
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
  aspectTerm,
  sentiment,
}: {
  reviewText: string
  starRating: number
  userName: string
  opinionTerm: string | null
  aspectTerm: string | null
  sentiment: 'positive' | 'negative' | 'neutral'
}) {
  const [expanded, setExpanded] = useState(false)

  const { nodes, isTruncated } = useMemo(
    () => buildSnippet(reviewText, opinionTerm, aspectTerm, sentiment, expanded),
    [reviewText, opinionTerm, aspectTerm, sentiment, expanded]
  )

  // Show the toggle whenever the text was truncated OR is being expanded
  const showToggle = isTruncated || expanded

  return (
    <li className="border-t border-slate-100 pt-5 mb-5 first:border-t-0 first:pt-0">
      {/* Review meta */}
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-xs">
          <span className="text-[#ff9900]">{'★'.repeat(starRating)}</span>
          <span className="text-slate-300">{'☆'.repeat(5 - starRating)}</span>
        </span>
        <span className="text-slate-400 text-[10px]">by {userName}</span>
      </div>
      {/* Text + inline "Read more" */}
      <p className="text-slate-600 text-sm leading-relaxed">
        {nodes}
        {showToggle && (
          <>
            {' '}
            <button
              onClick={() => setExpanded((prev) => !prev)}
              className="text-[11px] text-slate-500 hover:underline font-medium inline"
            >
              {expanded ? 'Collapse ◂' : 'Read more ▸'}
            </button>
          </>
        )}
      </p>
    </li>
  )
}

const INITIAL_COUNT = 3
const FIRST_LOAD_MORE = 7   // brings total to 10
const SUBSEQUENT_LOAD = 10

export function AspectDetailPanel({ stat }: AspectDetailPanelProps) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT)

  const total = stat.topReviews.length
  const visibleReviews = stat.topReviews.slice(0, visibleCount)
  const hasMore = visibleCount < total
  const canCollapse = visibleCount > INITIAL_COUNT

  const handleShowMore = () => {
    setVisibleCount((prev) =>
      prev === INITIAL_COUNT
        ? INITIAL_COUNT + FIRST_LOAD_MORE
        : prev + SUBSEQUENT_LOAD
    )
  }

  const handleShowLess = () => setVisibleCount(INITIAL_COUNT)

  // Reset visible count when the selected aspect changes
  useEffect(() => {
    setVisibleCount(INITIAL_COUNT)
  }, [stat.category])

  return (
    <div className="bg-white rounded-lg p-3 text-xs text-slate-600 space-y-2 border border-slate-200">
      {/* Mention summary */}
      <p className="font-medium text-slate-700 pt-1">
        {stat.total} customers mention {stat.label} ・{' '}
        <span className="text-green-600">{stat.positive} positive</span>,{' '}
        <span className="text-red-500">{stat.negative} negative</span>
        {stat.neutral > 0 && (
          <>, <span className="text-slate-400">{stat.neutral} neutral</span></>
        )}
      </p>

      {/* Review snippets */}
      {total > 0 ? (
        <>
          <ul className="space-y-2 pt-1">
            {visibleReviews.map((review) => (
              <ReviewSnippet
                key={review.id}
                reviewText={review.reviewText}
                starRating={review.starRating}
                userName={review.userName}
                opinionTerm={review.opinionTerm}
                aspectTerm={review.aspectTerm}
                sentiment={review.sentiment}
              />
            ))}
          </ul>

          {/* Show more / Show less controls */}
          <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
            {hasMore && (
              <button
                onClick={handleShowMore}
                className="text-[12px] text-slate-600 hover:text-slate-800 hover:underline font-medium transition-colors"
              >
                Show more ▾
              </button>
            )}
            {canCollapse && (
              <button
                onClick={handleShowLess}
                className="text-[12px] text-slate-500 hover:text-slate-700 hover:underline font-medium transition-colors"
              >
                Show less <span className="inline-block rotate-180">▾</span>
              </button>
            )}
            <span className="text-[11px] text-slate-500 ml-auto mr-1">
              {Math.min(visibleCount, total)} of {total}
            </span>
          </div>
        </>
      ) : (
        <p className="text-slate-400 italic">No review snippets available.</p>
      )}
    </div>
  )
}

