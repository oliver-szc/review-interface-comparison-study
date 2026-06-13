import { ReactNode } from 'react'

interface ChatMessageProps {
  role: 'user' | 'bot'
  text: string
  /** Render as an error/system message with warning styling */
  isError?: boolean
  /** Show a blinking cursor at the end (while streaming) */
  isStreaming?: boolean
}

function renderMessageText(text: string): ReactNode[] {
  const regex = /(\*\*[\s\S]*?\*\*|__[\s\S]*?__|\*[\s\S]*?\*|_[\s\S]*?_)/g;
  const parts = text.split(regex);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="font-bold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('__') && part.endsWith('__')) {
      return <strong key={index} className="font-bold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={index} className="italic">{part.slice(1, -1)}</em>;
    }
    if (part.startsWith('_') && part.endsWith('_')) {
      return <em key={index} className="italic">{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

export function ChatMessage({ role, text, isError = false, isStreaming = false }: ChatMessageProps) {
  // Error messages always render as bot-style (left-aligned) with distinct styling
  const effectiveRole = isError ? 'bot' : role

  return (
    <div
      className={`flex ${effectiveRole === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`rounded-xl px-3 py-2 break-words whitespace-pre-wrap text-sm leading-relaxed ${isError
            ? 'max-w-full bg-red-50 text-red-700 border border-red-200 rounded-bl-none'
            : effectiveRole === 'user'
              ? 'max-w-[80%] bg-sky-600 text-white rounded-br-none'
              : 'max-w-full text-slate-700 rounded-bl-none'
          }`}
      >
        <p>
          {renderMessageText(text)}
          {/* Blinking cursor indicator while streaming */}
          {isStreaming && (
            <span className="inline-block w-1.5 h-4 ml-0.5 bg-sky-500 rounded-sm animate-pulse align-text-bottom" />
          )}
        </p>
      </div>
    </div>
  );
}
