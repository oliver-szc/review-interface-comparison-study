'use client'

interface SuggestedQuestionsProps {
  questions: string[]
  onQuestionClick: (question: string) => void
}

export function SuggestedQuestions({
  questions,
  onQuestionClick,
}: SuggestedQuestionsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {questions.map((q, index) => (
        <button
          key={index}
          onClick={() => onQuestionClick(q)}
          className="flex-shrink-0 text-xs px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition"
        >
          {q}
        </button>
      ))}
    </div>
  )
}
