'use client'

import { ReactNode } from 'react'
import { useParams, usePathname } from 'next/navigation'

type Condition = 'unassisted' | 'dashboard' | 'chatbot'

interface WebshopLayoutProps {
  topContent: ReactNode
  middleContent: ReactNode
  leftContent: ReactNode
}


export function WebshopLayout({ topContent, middleContent, leftContent }: WebshopLayoutProps) {
  const params = useParams<{ condition?: string }>()
  const pathname = usePathname() ?? ''
  const rawCondition = params?.condition ?? 'unassisted'

  // Workaround: treat as 'chatbot' if on chatbot page
  const condition: Condition =
    rawCondition === 'dashboard' || rawCondition === 'chatbot'
      ? rawCondition
      : pathname.includes('/chatbot')
        ? 'chatbot'
        : 'unassisted'

  return (
    <div className="w-full px-3 md:px-4 space-y-3">
      <div className="w-full">{topContent}</div>
      {condition === 'chatbot' ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 items-start">
          <div className="sticky top-24">{leftContent}</div>
          <div className="lg:col-span-2 space-y-3">{middleContent}</div>
          <div /> {/* empty right column */}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 items-start">
          <div className="hidden lg:block" />
          <div className="lg:col-span-2 space-y-3">{middleContent}</div>
          <div className="hidden lg:block" />
        </div>
      )}
    </div>
  )
}
