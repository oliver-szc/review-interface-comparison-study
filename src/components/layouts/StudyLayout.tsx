'use client'

import { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { InformationNeedBanner } from '@/components/ui/InformationNeedBanner'
import { ProgressBar } from '@/components/ui/ProgressBar'

interface StudyLayoutProps {
  children: ReactNode
  task: string
  onHelp?: () => void
  onSubmit?: () => void
}

export function StudyLayout({
  children,
  task,
  onHelp = () => console.log('Help clicked'),
  onSubmit = () => console.log('Submit clicked'),
}: StudyLayoutProps) {
  const pathname = usePathname() ?? ''

  const steps = [
    { label: 'Consent', href: '/landing/consent' },
    { label: 'Demographics', href: '/survey/demographics' },
    { label: 'Unassisted', href: '/study/unassisted' },
    { label: 'Survey 1', href: '/survey/post-condition' },
    { label: 'Dashboard', href: '/study/dashboard' },
    { label: 'Survey 2', href: '/survey/post-condition' },
    { label: 'Chatbot', href: '/study/chatbot' },
    { label: 'Survey 3', href: '/survey/post-condition' },
    { label: 'Final Survey', href: '/survey/final' },
    { label: 'Thank You', href: '/thank-you' },
  ]

  const currentStepIndex = Math.max(
    0,
    steps.findIndex((s) => s.href && pathname.startsWith(s.href))
  )

  return (
    <div className="min-h-screen">
      {/* Information Need Banner */}
      <InformationNeedBanner task={task} onHelp={onHelp} onSubmit={onSubmit} />

      {/* Progress Indicator */}
      <div className="pt-20">
        <ProgressBar
          currentStep={currentStepIndex + 1}
          totalSteps={steps.length}
          steps={steps}
        />
      </div>

      {/* Main Content */}
      {/* full-bleed main with small inner padding */}
      <main className="w-full py-6 px-3 md:px-4">{children}</main>
    </div>
  )
}
