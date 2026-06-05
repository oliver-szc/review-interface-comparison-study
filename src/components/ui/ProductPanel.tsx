'use client'

import Image, { StaticImageData } from 'next/image'

interface ProductSpec {
  label: string
  description: string
}

interface ProductData {
  title: string
  price?: string
  priceSource?: string
  image: StaticImageData | string
  avgRating: number
  totalReviews: number
  bulletPointsSource?: string
  bulletPoints?: { label: string; value: string }[]
  aboutItemSource?: string
  aboutItem?: string[]
}

interface ProductPanelProps {
  productData: ProductData
}

export function ProductImage({ productData }: ProductPanelProps) {
  const { title, image } = productData
  
  // Check if this product is the earbuds by title or image string
  const isEarbuds = 
    title.toLowerCase().includes('earbud') || 
    (typeof image === 'string' && image.toLowerCase().includes('earbud')) ||
    (image && typeof image === 'object' && 'src' in image && typeof image.src === 'string' && image.src.toLowerCase().includes('earbud'));

  return (
    <div className="bg-white rounded-xl p-4 flex items-center justify-center w-full h-full overflow-hidden">
      <Image
        src={image}
        alt={title}
        width={500}
        height={500}
        className={`w-100 h-100 rounded-lg object-contain transition-transform duration-300 ${isEarbuds ? 'scale-150' : ''}`}
      />
    </div>
  )
}

export function ProductDetails({ productData }: ProductPanelProps) {
  const { title, price, avgRating, totalReviews, bulletPoints, aboutItem } = productData
  return (
    <div className="bg-white rounded-xl pt-0 px-6 pb-6 space-y-4">
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

      {price && (
        <div className="mt-2 flex items-center gap-2">
          <span className="text-xl font-bold text-slate-900">{price.replace('.', ',')} €</span>
        </div>
      )}

      <hr className="border-slate-100 mb-2" />

      {bulletPoints && bulletPoints.length > 0 && (
        <table className="w-110 text-xs md:text-sm text-slate-600 border-none border-collapse">
          <tbody>
            {bulletPoints.map((item) => (
              <tr key={item.label} className="border-none align-top">
                <td className="font-semibold text-slate-700 pb-2 border-none select-none whitespace-nowrap">
                  {item.label}
                </td>
                <td className="text-slate-600 pb-2 border-none">
                  {item.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <hr className="border-slate-100 mb-2 mt-2" />

      <div className="flex items-center gap-2 mb-2 mt-2">
        <h1 className="text-base md:text-lg font-semibold text-slate-900">About this item</h1>
      </div>
      <ul className="list-disc pl-4 text-xs md:text-sm text-slate-600 space-y-1.5">
        {aboutItem?.map((b, i) => (
          <li key={i}>{b}</li>
        ))}
      </ul>

      <hr className="border-slate-200" />

    </div>

  )
}

export function ProductPanel({ productData }: ProductPanelProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-stretch">
      <div className="w-full md:w-[320px] shrink-0">
        <ProductImage productData={productData} />
      </div>
      <div className="flex-1">
        <ProductDetails productData={productData} />
      </div>
    </div>
  )
}
