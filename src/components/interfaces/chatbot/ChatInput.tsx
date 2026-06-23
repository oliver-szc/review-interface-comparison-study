'use client'

// ChatInput component for the chatbot panel.
import { useState, KeyboardEvent } from 'react'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
  /** Show a loading spinner in the send button */
  isLoading?: boolean
}

export function ChatInput({ onSend, disabled = false, isLoading = false }: ChatInputProps) {
  const [input, setInput] = useState('')

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input.trim())
      setInput('')
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1 min-w-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Ask about this product..."
          className="w-full h-10 px-3 py-2 text-sm text-black bg-white border border-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-60"
        />
      </div>
      <div className="shrink-0">
        <button
          type="button"
          onClick={handleSend}
          disabled={disabled || !input.trim()}
          className="h-10 px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 disabled:bg-slate-100 disabled:text-slate-700 rounded-lg transition flex items-center gap-2"
        >
          {isLoading ? (
            <>
              {/* Spinning loader SVG */}
              <svg
                className="animate-spin h-4 w-4 text-slate-700"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>Thinking…</span>
            </>
          ) : (
            'Send'
          )}
        </button>
      </div>
    </div>
  )
}
