'use client'

import { useState, KeyboardEvent } from 'react'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
}

export function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const [input, setInput] = useState('')

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input.trim())
      setInput('')
    }
  }

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={handleKeyPress}
        disabled={disabled}
        placeholder="Ask about this product..."
        className="flex-1 px-3 py-2 text-sm text-black border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white disabled: disabled:cursor-not-allowed"
      />
      <button
        onClick={handleSend}
        disabled={disabled || !input.trim()}
        className="px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition"
      >
        Send
      </button>
    </div>
  )
}
