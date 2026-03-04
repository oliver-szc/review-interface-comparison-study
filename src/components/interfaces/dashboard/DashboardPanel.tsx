'use client'

import { useState } from 'react'
import { AspectButton } from './AspectButton'
import { AspectDetailPanel } from './AspectDetailPanel'

export function DashboardPanel() {
  const aspects = [
    'Sound quality',
    'Noise cancellation',
    'Build quality',
    'Battery life',
    'Price',
  ]
  const [active, setActive] = useState('Sound quality')

  return (
    <div className="bg-sky-50 rounded-xl border border-slate-200 p-4 space-y-3 mx-auto max-w-4xl w-full">
      {/* Header */}
      <h2 className="text-sm font-semibold text-slate-900">
        What customers say
      </h2>

      {/* AI Summary */}
      <p className="text-xs text-slate-600">
        Customers like the sound quality, price, and quality of the headphones.
        They mention they&apos;re clear, crisp, and good for gaming. Customers
        also like the fit, saying the earbuds stay in place and fit securely in
        their ears. However, some customers have mixed opinions on connectivity
        and functionality.
      </p>
      <p className="text-xs text-slate-400">
        *AI-generated from customer reviews
      </p>

      {/* Aspect Selection */}
      <p className="text-xs font-semibold text-slate-900">
        Select to learn more:
      </p>
      <div className="flex flex-wrap gap-2">
        {aspects.map((a) => (
          <AspectButton
            key={a}
            label={a}
            active={active === a}
            onClick={() => setActive(a)}
          />
        ))}
      </div>

      {/* Aspect Details */}
      <AspectDetailPanel
        aspect="sound quality"
        totalMentions={52}
        positiveCount={40}
        negativeCount={12}
        summaryText="Customers like the sound quality of the headphones. They mention it's clear and crisp."
        snippets={[
          'good sound!!!...',
          'Super sound, fast delivery. Functionality is given. Perfect.',
          'Very good sound 👍...',
          'Wife review: "Bluetooth works fine, excellent quality build and sound, perfect fit compared too your iPods Pro, better sound as the strange pressure',
        ]}
      />
    </div>
  )
}
