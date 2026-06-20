'use client'

export interface ReviewCardProps {
  name: string
  stars: number
  date: string
  text: string
  title?: string | null
  searchQuery?: string
}

export function ReviewCard({ name, stars, date, text, title: propTitle, searchQuery }: ReviewCardProps) {
  const rawTitle = propTitle || text.split('.')[0] || text
  const title = rawTitle.length > 60 ? rawTitle.slice(0, 57) + '…' : rawTitle

  const renderTextWithHighlights = (content: string, query?: string) => {
    if (!query) return content;

    // Escape regex special characters from the query
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = content.split(new RegExp(`(${escapedQuery})`, 'gi'));

    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={i} className="bg-amazon-light/22 text-slate-600 rounded-sm px-0.5 py-0.5">
              {part}
            </mark>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </>
    );
  };

  return (
    <div className="bg-white rounded-xl p-4 space-y-2">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">
          {name[0]}
        </div>
        <span className="text-sm text-slate-800">{name}</span>
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="text-sm leading-none pt-0.5">
            <span className="text-[#ff9900]">{'★'.repeat(stars)}</span>
            <span className="text-slate-300">{'☆'.repeat(5 - stars)}</span>
          </div>
          <span className="text-sm font-semibold text-slate-900">{title}</span>
        </div>
        <div className="text-xs text-slate-400">{date}</div>
      </div>

      <p className="text-sm text-slate-600 leading-relaxed">
        {renderTextWithHighlights(text, searchQuery)}
      </p>

      {/* <div className="text-xs text-slate-400 mt-2">
        {(() => {
          const count = Math.max(0, (text.length % 17) + Math.floor(stars / 1))
          return `${count} ${count === 1 ? 'person' : 'people'} found this helpful`
        })()}
      </div> */}
      <hr className="border-slate-100 mt-9" />
    </div>
  )
}
