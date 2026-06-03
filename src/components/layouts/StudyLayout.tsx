'use client'

import { ReactNode } from 'react'
import { InformationNeedBanner } from '@/components/ui/InformationNeedBanner'

interface StudyLayoutProps {
  children: ReactNode
  task: ReactNode | ((props: { isOpen: boolean }) => ReactNode)
  onHelp?: () => void
  onSubmit?: () => void
  submitContent?: ReactNode
  helpContent?: ReactNode
}

export function StudyLayout({
  children,
  task,
  onHelp,
  onSubmit,
  submitContent,
  helpContent,
}: StudyLayoutProps) {
  const handleHelp = onHelp || (() => console.log('Help clicked'))
  const handleSubmit = onSubmit || (() => console.log('Submit clicked'))

  return (
    <div className="min-h-full">
      {/* Information Need Banner */}
      <InformationNeedBanner 
        task={task} 
        onHelp={handleHelp} 
        onSubmit={handleSubmit}
        submitContent={submitContent}
        helpContent={helpContent}
      />

      {/* Main Content */}
      <main 
        className="w-full pb-6 px-3 md:px-4"
        style={{ paddingTop: 'calc(var(--banner-height, 96px) + 32px)' }}
      >
        {children}
      </main>
    </div>
  )
}
