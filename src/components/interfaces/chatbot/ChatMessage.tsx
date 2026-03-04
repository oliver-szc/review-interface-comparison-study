'use client'

interface ChatMessageProps {
  role: 'user' | 'bot'
  text: string
}

export function ChatMessage({ role, text }: ChatMessageProps) {
  return (
    <div
      className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`rounded-xl px-3 py-2 break-words whitespace-pre-wrap text-sm leading-relaxed ${
          role === 'user'
            ? 'max-w-[80%] bg-sky-600 text-white rounded-br-none'
            : 'max-w-full text-slate-800 rounded-bl-none'
        }`}
      >
        <p>{text}</p>
      </div>
    </div>
  )
}
