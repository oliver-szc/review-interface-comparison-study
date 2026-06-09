// src/app/test/layout-preview/page.tsx
'use client'
import Image from 'next/image'
import { ReviewSortFilterBar } from '@/components/ui/ReviewSortFilterBar'
import { StarHistogram } from '@/components/ui/StarHistogram'
import { useState, type ComponentProps } from 'react'
import earbudsImage from '@/app/earbuds.jpg'

// --- Top Banner ---
function InformationNeedBanner({
  task,
  onHelp,
  onSubmit,
}: {
  task: string
  onHelp: () => void
  onSubmit: () => void
}) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-sky-50 border-b border-sky-200 rounded-b-xl px-4 py-2 h-20 flex items-center justify-between shadow-sm">
      <button
        onClick={onHelp}
        className="flex items-center gap-1.5 text-xs font-medium text-white border border-sky-800 rounded-lg px-3 py-1.5 bg-sky-800 hover:bg-sky-700 transition"
      >
        <span>?</span> Open help
      </button>
      <p className="text-xs text-slate-700 font-medium text-center max-w-2xl leading-snug px-4">
        {task}
      </p>
      <button
        onClick={onSubmit}
        className="flex items-center gap-1.5 text-xs font-medium text-white bg-sky-900 rounded-lg px-3 py-1.5 hover:bg-sky-800 transition"
      >
        ✓ Submit answer
      </button>
    </div>
  )
}

// --- Review Card ---
function ReviewCard({ name, stars, date, text }: { name: string; stars: number; date: string; text: string }) {
  // derive a short title from the beginning of the review text
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
      {/* mock helpful count derived deterministically from review text */}
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

// --- Dashboard Panel (Condition B) ---
function DashboardPanel() {
  const aspects = ['Sound quality', 'Noise cancellation', 'Build quality', 'Battery life', 'Price']
  const [active, setActive] = useState('Sound quality')
  return (
    <div className="bg-orange-50 rounded-xl border border-slate-200 p-4 space-y-3 mx-auto max-w-4xl w-full">
      <h2 className="text-sm font-semibold text-slate-900">What customers say</h2>
      <p className="text-xs text-slate-600">
        Customers like the sound quality, price, and quality of the headphones. They mention they're clear, crisp, and good for gaming. Customers also like the fit, saying the earbuds stay in place and fit securely in their ears. However, some customers have mixed opinions on connectivity and functionality.      </p>
      <p className="text-xs text-slate-400">*AI-generated from customer reviews</p>
      <p className="text-xs font-semibold text-slate-900">Select to learn more:</p>
      <div className="flex flex-wrap gap-2">
        {aspects.map((a) => (
          <button
            key={a}
            onClick={() => setActive(a)}
            className={`text-xs px-2 py-1 rounded-full border transition ${active === a
              ? 'bg-amazon text-white border-amazon'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-00'
              }`}
          >
            {a}
          </button>
        ))}
      </div>
      <div className="bg-white rounded-lg p-3 text-xs text-slate-600 space-y-1 border border-slate-100">
        <p className="font-semibold text-slate-700">52 customers mention sound quality, <span className="text-green-600">40 positive</span>, <span className="text-red-600">12 negative</span></p>

        <p className="text-xs text-slate-700">Customers like the sound quality of the headphones. They mention it's clear and crisp.</p>

        <ul className="list-disc pl-4 space-y-1">
          <li>"good sound!!!..." <span className="text-slate-400">Read more</span></li>
          <li>"Super sound, fast delivery. Functionality is given. Perfect." <span className="text-slate-400">Read more</span></li>
          <li>"Very good sound 👍..." <span className="text-slate-400">Read more</span></li>
          <li>"...Wife review: “Bluetooth works fine, excellent quality build and sound, perfect fit compared too your iPods Pro, better sound as the strange pressure" <span className="text-slate-400">Read more</span></li>
        </ul>
      </div>
    </div>
  )
}
function ProductPanel() {
  const detailItems = [
    { label: 'Sound quality', description: 'Experience rich, high-fidelity sound with deep bass and clear highs.' },
    { label: 'Noise cancellation', description: 'Industry-leading noise cancellation blocks out ambient sounds for immersive listening.' },
    { label: 'Build quality', description: 'Crafted with premium materials for durability and comfort during extended use.' },
    { label: 'Battery life', description: 'Enjoy up to 30 hours of wireless playback on a single charge.' },
    { label: 'Price', description: 'Priced at $299.99, offering premium features at a competitive price point.' },
  ]
  return (
    <div className="bg-white rounded-xl p-4 space-y-3">
      <div className="flex gap-4 items-start">
        <div className="w-full max-w-[320px]">
          <Image
            src={earbudsImage}
            alt="Wireless earbuds resting on a charging case"
            width={300}
            height={300}
            className="w-full h-auto rounded-lg object-cover"
            priority
          />
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">soundcore by Anker P20i wireless bluetooth earbuds</h1>
          <hr className="border-slate-100 mb-2" />
          <ul className="space-y-1 text-xs text-slate-600">
            {detailItems.map((item) => (
              <li key={item.label}>
                <span className="font-semibold text-slate-700">{item.label}:</span> {item.description}
              </li>
            ))}
          </ul>
          <hr className="border-slate-100 mb-2" />
          <h1 className="text-sm font-semibold text-slate-900 mt-2">
            About this item
          </h1>
          <ul className="list-disc pl-4 text-xs text-slate-600 space-y-1">
            <li>
              Powerful bass: The soundcore P20i wireless earbuds have oversized 10 mm drivers that deliver powerful sound with reinforced bass so you can lose yourself in your favourite songs.
            </li>
            <li>
              Personalised EQs: With the soundcore app, you can adjust the control of the Bluetooth headphones and choose from 22 EQ presets. With Find My Earbuds, a lost Bluetooth headphones can emit sounds to help you find them.
            </li>
            <li>
              Long playing time, fast charging: The soundcore P20i True Wireless Bluetooth headphones last 10 hours on a single charge and 30 hours including a charging case. Once empty, you can continue to use it on a 10-minute charge for a whole 2 hours.
            </li>
          </ul>
        </div>
        {/* spacer to the right matching image width (hidden on small screens) */}
        <div className="hidden md:block w-[320px] flex-shrink-0" />
      </div>
      <hr className="border-slate-200 mb-4" />
    </div>
  )
}
// --- Chatbot Panel (Condition C) ---
function ChatbotPanel() {
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hi! Ask me anything about this product based on customer reviews.' },
  ])
  const [input, setInput] = useState('')

  function send() {
    if (!input.trim()) return
    setMessages((m) => [
      ...m,
      { role: 'user', text: input },
      { role: 'bot', text: 'Based on the reviews, customers frequently mention this topic. For example...' },
    ])
    setInput('')
  }

  return (
    <div className="bg-slate-50 rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col h-full">
      <h2 className="text-sm font-semibold text-slate-900 mb-3">Assistant</h2>
      <div className="flex-1 space-y-2 mb-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`text-xs px-3 py-2 rounded-xl max-w-[80%] leading-relaxed ${m.role === 'user'
                ? 'bg-amazon text-white rounded-br-none'
                : 'text-slate-800 rounded-bl-none'
                }`}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="Ask about the reviews..."
          className="flex-1 text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-amazon"
        />
        <button
          onClick={send}
          className="text-xs bg-amazon text-white px-3 py-2 rounded-lg hover:bg-amazon-light transition"
        >
          Send
        </button>
      </div>
    </div>
  )
}

// --- Review List Panel ---
function ReviewListPanel() {
  const [activeStarFilter, setActiveStarFilter] = useState<number | null>(null)
  type SortFilters = ComponentProps<typeof ReviewSortFilterBar>['filters']
  const [filters, setFilters] = useState<SortFilters>({} as SortFilters)

  const allReviews = [
    { name: 'DannyP', stars: 5, date: '15 Oct 2025', text: 'Great headphones! Sound quality is top notch, ANC is the best I have tried.' },
    { name: 'SaraM', stars: 4, date: '3 Nov 2025', text: 'Very good overall. Slightly expensive but worth it for the noise cancellation.' },
    { name: 'TomK', stars: 3, date: '20 Jan 2026', text: 'Decent product. Battery life is good but the ear cushions feel a bit stiff.' },
    { name: 'AishaR', stars: 5, date: '12 Feb 2026', text: 'Battery life easily lasts my long flights — fantastic ANC and comfy fit.' },
    { name: 'LiamS', stars: 4, date: '28 Jan 2026', text: 'Great sound, bass is punchy. Occasional dropouts with older phones.' },
    { name: 'MiaT', stars: 2, date: '10 Dec 2025', text: 'Pods feel flimsy and charging case stopped working after a month.' },
    { name: 'NoahB', stars: 4, date: '5 Feb 2026', text: 'Comfortable for workouts, secure fit, decent mic for calls.' },
    { name: 'OliviaK', stars: 5, date: '18 Nov 2025', text: 'Exceeded expectations — crisp highs and deep lows, great value.' },
    { name: 'EthanW', stars: 3, date: '2 Jan 2026', text: 'Audio is fine but touch controls are too sensitive.' },
    { name: 'SophiaL', stars: 1, date: '27 Feb 2026', text: 'Stopped charging after two weeks. Customer service was slow.' },
  ]

  const reviews = activeStarFilter
    ? allReviews.filter((r) => r.stars === activeStarFilter)
    : allReviews
  return (
    <div className="bg-white rounded-xl p-4 mx-auto max-w-4xl w-full">
      <h2 className="text-xl font-semibold text-slate-900">Customer Reviews</h2>

      {/* Star histogram at top */}
      <div className="mb-4">
        <div className="w-full max-w-[320px]">
          <StarHistogram
            averageRating={4.4}
            totalCount={672}
            activeFilter={activeStarFilter}
            onStarFilter={(star) => setActiveStarFilter(star === activeStarFilter ? null : star)}
            distribution={[
              { star: 5, percentage: 69 },
              { star: 4, percentage: 14 },
              { star: 3, percentage: 9 },
              { star: 2, percentage: 3 },
              { star: 1, percentage: 5 },
            ]}
          />
        </div>
      </div>
      <hr className="border-slate-200 mb-4" />

      {/* Filters below histogram */}
      <div className="mb-4">
        <div className="w-1/2">
          <ReviewSortFilterBar
            filters={filters}
            onChange={(f) => {
              setFilters(f)
              // track('FILTERCHANGE', f)  ← wire up in Phase 8
            }}
          />
        </div>
      </div>

      <hr className="border-slate-200 mb-4" />

      {/* Reviews list */}
      <div className="space-y-3 pr-2">
        {reviews.length > 0 ? (
          reviews.map((r) => <ReviewCard key={r.name} {...r} />)
        ) : (
          <p className="text-xs text-slate-400">No reviews for this star rating.</p>
        )}
      </div>
    </div>
  )
}


// --- Main Page ---
type Condition = 'unassisted' | 'dashboard' | 'chatbot'

export default function LayoutPreview() {
  const [condition, setCondition] = useState<Condition>('dashboard')

  return (
    <div className="min-h-full bg-white">
      {/* Top Banner */}
      <InformationNeedBanner
        task="You work in product development. Identify three frequently requested features that are currently missing, and determine the feature with the highest priority."
        onHelp={() => alert('Help panel')}
        onSubmit={() => alert('Submit answer')}
      />

      {/* Condition switcher — for preview only, delete later */}
      <div className="fixed bottom-4 right-4 z-50 flex gap-1">
        {(['unassisted', 'dashboard', 'chatbot'] as Condition[]).map((c) => (
          <button
            key={c}
            onClick={() => setCondition(c)}
            className={`text-xxs px-2 py-1 rounded border ${condition === c ? 'bg-amazon text-white border-amazon' : 'bg-white text-slate-500 border-slate-200'
              }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Main content area */}
      <div className="pt-24 p-3 flex gap-3 items-start">

        {/* Condition A — Reviews only */}
        {condition === 'unassisted' && (
          <div className="flex-1 space-y-3">
            <ProductPanel />
            <ReviewListPanel />
          </div>
        )}

        {/* Condition B — Dashboard + Reviews */}
        {condition === 'dashboard' && (
          <div className="flex-1 flex flex-col gap-3">
            <ProductPanel />
            <DashboardPanel />
            <ReviewListPanel />
          </div>
        )}

        {/* Condition C — Chatbot + Reviews */}
        {condition === 'chatbot' && (
          <>
            <div
              className="w-[380px] sticky top-24 self-start"
              style={{ height: 'calc(100vh - 6rem)' }}
            >
              <ChatbotPanel />
            </div>
            <div className="flex-1 flex flex-col gap-3">
              <ProductPanel />
              <ReviewListPanel />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
