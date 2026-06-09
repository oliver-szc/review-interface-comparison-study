'use client'

interface ChatMessageProps {
  role: 'user' | 'bot'
  text: string
  /** Render as an error/system message with warning styling */
  isError?: boolean
  /** Show a blinking cursor at the end (while streaming) */
  isStreaming?: boolean
}

export function ChatMessage({ role, text, isError = false, isStreaming = false }: ChatMessageProps) {
  // Error messages always render as bot-style (left-aligned) with distinct styling
  const effectiveRole = isError ? 'bot' : role

  return (
    <div
      className={`flex ${effectiveRole === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`rounded-xl px-3 py-2 break-words whitespace-pre-wrap text-sm leading-relaxed ${
          isError
            ? 'max-w-full bg-red-50 text-red-700 border border-red-200 rounded-bl-none'
            : effectiveRole === 'user'
              ? 'max-w-[80%] bg-sky-600 text-white rounded-br-none'
              : 'max-w-full text-slate-800 rounded-bl-none'
        }`}
      >
        <p>
          {text}
          {/* Blinking cursor indicator while streaming */}
          {isStreaming && (
            <span className="inline-block w-1.5 h-4 ml-0.5 bg-sky-500 rounded-sm animate-pulse align-text-bottom" />
          )}
        </p>
      </div>
    </div>
  )
}
