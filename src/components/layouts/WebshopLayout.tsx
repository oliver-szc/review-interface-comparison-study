'use client'

import { ReactNode } from 'react'
import { useParams, usePathname } from 'next/navigation'

type Condition = 'unassisted' | 'dashboard' | 'chatbot'

interface WebshopLayoutProps {
  /** Product image — renders in Grid Column 1 */
  productImage?: ReactNode
  /** Product details panel — renders in Grid Columns 2–3 */
  topContent: ReactNode
  /** Main content (reviews, dashboard, etc.) — renders in Grid Columns 2–3 */
  middleContent: ReactNode
  /** Chatbot panel — only shown in chatbot condition, floats outside the grid */
  leftContent?: ReactNode
  /** Override the condition detection */
  condition?: Condition
}

/**
 * WebshopLayout
 *
 * Renders a 4-column grid layout. The chatbot condition adds a fixed
 * sidebar to the LEFT of the grid without disturbing it.
 *
 * Grid structure (all conditions):
 *   Col 1         | Col 2–3       | Col 4
 *   productImage  | topContent    | (spacer)
 *   (empty)       | middleContent | (spacer)
 *
 * Chatbot condition wraps the above grid with a flex container that
 * prepends a fixed-width chatbot sidebar column.
 */
export function WebshopLayout({
  productImage,
  topContent,
  middleContent,
  leftContent,
  condition: propCondition,
}: WebshopLayoutProps) {
  const params = useParams<{ condition?: string }>()
  const pathname = usePathname() ?? ''
  const rawCondition = params?.condition ?? 'unassisted'

  const condition: Condition =
    propCondition ??
    (rawCondition === 'dashboard' || rawCondition === 'chatbot'
      ? rawCondition
      : pathname.includes('/chatbot')
        ? 'chatbot'
        : 'unassisted')

  // ─── Core 4-column grid ───────────────────────────────────────────────────
  // Identical for all conditions.
  const grid = (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-x-4 gap-y-4 items-start w-full">
      {/* Row 1 — Product image (Col 1) + Product details (Cols 2–3) + spacer (Col 4) */}
      <div className="lg:col-span-1 lg:self-stretch h-full">
        {productImage}
      </div>
      <div className="lg:col-span-2">
        {topContent}
      </div>
      <div className="hidden lg:block lg:col-span-1" />

      {/* Row 2 — Empty (Col 1) + Middle content (Cols 2–3) + spacer (Col 4) */}
      <div className="hidden lg:block lg:col-span-1" />
      <div className="lg:col-span-2 space-y-4">
        {middleContent}
      </div>
      <div className="hidden lg:block lg:col-span-1" />
    </div>
  )

  return (
    <div className="w-full px-3 md:px-4">
      {grid}
    </div>
  )
}
