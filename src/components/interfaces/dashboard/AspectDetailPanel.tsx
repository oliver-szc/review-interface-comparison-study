'use client'

interface AspectDetailPanelProps {
  aspect: string
  totalMentions: number
  positiveCount: number
  negativeCount: number
  summaryText: string
  snippets: string[]
}

export function AspectDetailPanel({
  aspect,
  totalMentions,
  positiveCount,
  negativeCount,
  summaryText,
  snippets,
}: AspectDetailPanelProps) {
  return (
    <div className="bg-white rounded-lg p-3 text-xs text-slate-600 space-y-1 border border-slate-100">
      {/* Mention Count */}
      <p className="font-semibold text-slate-700">
        {totalMentions} customers mention {aspect},{' '}
        <span className="text-green-600">{positiveCount} positive</span>,{' '}
        <span className="text-red-600">{negativeCount} negative</span>
      </p>

      {/* Summary */}
      <p className="text-xs text-slate-700">{summaryText}</p>

      {/* Review Snippets */}
      <ul className="list-disc pl-4 space-y-1">
        {snippets.map((snippet, index) => (
          <li key={index}>
            &quot;{snippet}&quot;{' '}
            <span className="text-slate-400">Read more</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
