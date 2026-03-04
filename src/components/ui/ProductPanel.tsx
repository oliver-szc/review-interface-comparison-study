'use client'

import Image, { StaticImageData } from 'next/image'

interface ProductSpec {
  label: string
  description: string
}

interface ProductData {
  title: string
  image: StaticImageData | string
  avgRating: number
  totalReviews: number
  bullets: string[]
  specs: ProductSpec[]
}

interface ProductPanelProps {
  productData: ProductData
}

export function ProductPanel({ productData }: ProductPanelProps) {
  const { title, image, avgRating, totalReviews, bullets, specs } = productData

  return (
    <div className="bg-white rounded-xl p-4 space-y-3">
      <div className="flex gap-4 items-start">
        <div className="w-full max-w-[320px]">
          <Image
            src={image}
            alt={title}
            width={300}
            height={300}
            className="w-full h-auto rounded-lg object-cover"
          />
        </div>

        <div className="space-y-1 flex-1">
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">{title}</h1>

          {/* Rating (preserve existing functionality) */}
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              <span className="text-[#ff9900] text-sm">{'★'.repeat(Math.floor(avgRating))}</span>
              <span className="text-slate-300 text-sm">{'☆'.repeat(5 - Math.floor(avgRating))}</span>
            </div>
            <span className="text-sm text-slate-600">{avgRating} out of 5</span>
            <span className="text-sm text-slate-400">({totalReviews.toLocaleString()} ratings)</span>
          </div>

          <hr className="border-slate-100 mb-2" />

          <ul className="space-y-1 text-xs text-slate-600">
            {specs.map((item) => (
              <li key={item.label}>
                <span className="font-semibold text-slate-700">{item.label}:</span> {item.description}
              </li>
            ))}
          </ul>

          <hr className="border-slate-100 mb-2" />

          <h1 className="text-sm font-semibold text-slate-900 mt-2">About this item</h1>
          <ul className="list-disc pl-4 text-xs text-slate-600 space-y-1">
            {bullets.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        </div>

        {/* spacer to the right matching image width (hidden on small screens) */}
        <div className="hidden md:block w-[320px] flex-shrink-0" />
      </div>
      <hr className="border-slate-200 mb-4" />
    </div>
  )
}
