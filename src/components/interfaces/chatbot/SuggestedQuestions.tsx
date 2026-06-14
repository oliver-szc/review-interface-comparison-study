'use client'

import { useTutorial } from '@/lib/contexts/TutorialContext'
import { TutorialHighlight } from '@/components/tutorial/TutorialHighlight'

interface SuggestedQuestionsProps {
  questions: string[]
  onQuestionClick: (question: string) => void
}

export function SuggestedQuestions({
  questions,
  onQuestionClick,
}: SuggestedQuestionsProps) {
  const { waitingForAction } = useTutorial()

  return (
    <div className="flex flex-wrap gap-2 pb-2">
      {questions.map((q, index) => (
        <TutorialHighlight
          key={index}
          active={waitingForAction === 'CHATBOT_SUGGESTION_CLICK'}
          roundedClass="rounded-full"
        >
          <button
            onClick={() => onQuestionClick(q)}
            className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition"
          >
            {q}
          </button>
        </TutorialHighlight>
      ))}
    </div>
  )
}
