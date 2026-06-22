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
    <div className="bg-white rounded-xl flex items-center justify-center w-full h-full overflow-hidden">
      <Image
        src={image}
        alt={title}
        width={500}
        height={500}
        priority
        className={`w-100 h-100 rounded-lg object-contain transition-transform duration-300 ${isEarbuds ? 'scale-150' : ''}`}
      />
    </div>
  )
}

export function ProductDetails({ productData }: ProductPanelProps) {
  const { title, price, avgRating, totalReviews, bulletPoints, aboutItem } = productData
  return (
    <div className="bg-white rounded-xl pt-0 px-4 space-y-4">
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">{title}</h1>

        {/* Rating (preserve existing functionality) */}
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            <span className="text-[#ff9900] text-sm">{'★'.repeat(Math.floor(avgRating))}</span>
            <span className="text-slate-300 text-sm">{'☆'.repeat(5 - Math.floor(avgRating))}</span>
          </div>
          <span className="text-sm text-slate-600">{Number(avgRating).toFixed(1)} out of 5</span>
          <span className="text-sm text-slate-400">({totalReviews.toLocaleString()} ratings)</span>
        </div>

        {price && (
          <div className=" flex items-center gap-2">
            <span className="text-xl font-bold text-slate-900">{price.replace('.', ',')} €</span>
          </div>
        )}
      </div>

      <hr className="border-slate-100 mb-2 mt-3" />

      {bulletPoints && bulletPoints.length > 0 && (
        <table className="w-auto text-xs md:text-xs text-slate-600 border-none border-collapse">
          <tbody>
            {bulletPoints.map((item, idx) => {
              const isLast = idx === bulletPoints.length - 1;
              const paddingClass = isLast ? 'pb-0' : 'pb-1.5';
              return (
                <tr key={item.label} className="border-none align-top">
                  <td className={`font-semibold text-slate-700 ${paddingClass} pr-6 border-none select-none whitespace-nowrap w-[1%] max-w-fit`}>
                    {item.label}
                  </td>
                  <td className={`text-slate-600 ${paddingClass} border-none`}>
                    {item.value}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      <hr className="border-slate-100 mb-2 !mt-0" />

      <div className="flex items-center gap-2 mb-1.5 mt-2.5">
        <h1 className="text-base md:text-lg font-semibold text-slate-900 ">About this item</h1>
      </div>
      <ul className="list-disc pl-4 text-xs md:text-xs text-slate-600 space-y-1.5">
        {aboutItem?.map((b, i) => (
          <li key={i}>{b}</li>
        ))}
      </ul>

      <hr className="border-slate-200 mt-4" />

    </div>

  )
}

export function ProductPanel({ productData }: ProductPanelProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-x-4 gap-y-4 items-start w-full px-3 md:px-4">
      <div className="lg:col-span-1 lg:self-stretch h-full flex justify-end">
        <div className="w-full">
          <ProductImage productData={productData} />
        </div>
      </div>
      <div className="lg:col-span-3">
        <ProductDetails productData={productData} />
      </div>
      <div className="hidden lg:block lg:col-span-1" />
    </div>
  )
}
