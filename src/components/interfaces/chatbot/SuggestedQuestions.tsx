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
    <div className="flex flex-wrap gap-2 pb-2">
      {questions.map((q, index) => (
        <button
          key={index}
          onClick={() => onQuestionClick(q)}
          className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition"
        >
          {q}
        </button>
      ))}
    </div>
  )
}
