'use client'

import { useState } from 'react'
import { ChatMessage } from './ChatMessage'
import { ChatInput } from './ChatInput'
import { SuggestedQuestions } from './SuggestedQuestions'

interface Message {
  role: 'user' | 'bot'
  text: string
}

export function ChatbotPanel() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'bot',
      text: 'Hi! I can help you learn about this product based on customer reviews. What would you like to know?',
    },
  ])

  const suggestedQuestions = [
    'What do people say about sound quality?',
    'Are they comfortable?',
    'How is the battery life?',
  ]

  const handleSend = (text: string) => {
    // Add user message
    const userMessage: Message = { role: 'user', text }
    setMessages((prev) => [...prev, userMessage])

    // Simulate bot response (mock)
    setTimeout(() => {
      const botMessage: Message = {
        role: 'bot',
        text: 'Based on the reviews, customers generally appreciate the sound quality. Many mention that the audio is clear and crisp, with good bass response. Some users specifically highlight that they work well for gaming and music.',
      }
      setMessages((prev) => [...prev, botMessage])
    }, 500)
  }

  const handleQuestionClick = (question: string) => {
    handleSend(question)
  }

  return (
    <div className="h-full flex flex-col bg-sky-50 rounded-xl border border-sky-400 shadow-sm">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200">
        <h3 className="text-sm text-center font-semibold text-slate-900">
          AI Shopping Assistant
        </h3>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, index) => (
          <ChatMessage key={index} role={msg.role} text={msg.text} />
        ))}
      </div>

      {/* Suggested Questions */}
      {messages.length === 1 && (
        <div className="px-4 pb-2">
          <SuggestedQuestions
            questions={suggestedQuestions}
            onQuestionClick={handleQuestionClick}
          />
        </div>
      )}

      {/* Input */}
      <div className="p-4">
        <ChatInput onSend={handleSend} />
      </div>
    </div>
  )
}
