'use client'

export interface ReviewCardProps {
  name: string
  stars: number
  date: string
  text: string
}

export function ReviewCard({ name, stars, date, text }: ReviewCardProps) {
  const rawTitle = text.split('.')[0] || text
  const title = rawTitle.length > 60 ? rawTitle.slice(0, 57) + '…' : rawTitle

  return (
    <div className="bg-white rounded-xl p-4 space-y-2">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">
          {name[0]}
        </div>
        <span className="text-sm font-medium text-slate-800">{name}</span>
      </div>

      <div className="flex items-start gap-4">
        <div className="flex flex-col items-start">
          <div className="text-sm leading-none">
            <span className="text-[#ff9900]">{'★'.repeat(stars)}</span>
            <span className="text-slate-300">{'☆'.repeat(5 - stars)}</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">{date}</div>
        </div>
        <div className="flex-1">
          <div className="text-sm font-bold text-slate-900">{title}</div>
        </div>
      </div>

      <p className="text-sm text-slate-600 leading-relaxed">{text}</p>

      <div className="text-xs text-slate-400 mt-2">
        {(() => {
          const count = Math.max(0, (text.length % 17) + Math.floor(stars / 1))
          return `${count} ${count === 1 ? 'person' : 'people'} found this helpful`
        })()}
      </div>
      <hr className="border-slate-100" />
    </div>
  )
}
