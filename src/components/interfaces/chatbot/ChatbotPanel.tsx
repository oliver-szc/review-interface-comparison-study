'use client'

import { useState, useRef, useCallback } from 'react'
import { useTutorial } from '@/lib/contexts/TutorialContext'
import { ChatMessage } from './ChatMessage'
import { ChatInput } from './ChatInput'
import { SuggestedQuestions } from './SuggestedQuestions'


interface Message {
  role: 'user' | 'bot'
  text: string
  /** Whether this message represents an error */
  isError?: boolean
}

interface ChatbotPanelProps {
  /** The product ID for the current study block (e.g. 'EARBUDS') */
  productId: string
}

const SUGGESTED_QUESTIONS: Record<string, string[]> = {
  EARBUDS: [
    'What do people say about sound quality?',
    'Are they comfortable?',
    'How is the battery life?',
  ],
  SWEATSHIRT: [
    'What do people say about the material quality?',
    'Is it true to size?',
    'How does it hold up after washing?',
  ],
  KETTLE: [
    'What do people say about the noise level?',
    'Is it easy to use?',
    'How long does it take to boil?',
  ],
  TUTORIAL: [
    'How well does the tracking work?',
    'Is the battery life good?',
    'Is the tracker easy to set up?',
  ],
}

export function ChatbotPanel({ productId }: ChatbotPanelProps) {
  const { waitingForAction, dispatchTutorialAction } = useTutorial()
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)

  // Abort controller ref so we can cancel in-flight requests
  const abortControllerRef = useRef<AbortController | null>(null)
  const isTutorialChatTriggered = useRef(false)

  const questionsKey = productId.toUpperCase()
  const suggestedQuestions = SUGGESTED_QUESTIONS[questionsKey] || SUGGESTED_QUESTIONS.EARBUDS

  /**
   * Sends the user query to the RAG chat API and streams the response
   * token-by-token into the message display.
   */
  const handleSend = useCallback(async (text: string) => {
    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    const abortController = new AbortController()
    abortControllerRef.current = abortController

    if (waitingForAction === 'CHATBOT_SUGGESTION_CLICK') {
      isTutorialChatTriggered.current = true
    }

    // Record the time the query was sent (for tracking latency)
    const querySentAt = Date.now()

    // Show user message and clear previous bot response
    const userMessage: Message = { role: 'user', text }
    setMessages([userMessage])
    setIsLoading(true)
    setIsStreaming(false)

    try {
      const response = await fetch('/api/study/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: text, productId }),
        signal: abortController.signal,
      })

      // Handle error responses (structured JSON)
      if (!response.ok) {
        let errorMessage = 'Something went wrong. Please try again.'
        try {
          const errorBody = await response.json()
          if (errorBody.error) {
            errorMessage = errorBody.error
          }
        } catch {
          // Response body wasn't JSON — use default message
        }

        setMessages([userMessage, { role: 'bot', text: errorMessage, isError: true }])
        setIsLoading(false)
        isTutorialChatTriggered.current = false
        return
      }

      // Begin streaming the response
      const reader = response.body?.getReader()
      if (!reader) {
        setMessages([
          userMessage,
          { role: 'bot', text: 'Failed to read the response stream.', isError: true },
        ])
        setIsLoading(false)
        isTutorialChatTriggered.current = false
        return
      }

      const decoder = new TextDecoder()
      let accumulatedText = ''

      // Add an empty bot message that we'll update as tokens arrive
      setMessages([userMessage, { role: 'bot', text: '' }])
      setIsStreaming(true)

      while (true) {
        const { done, value } = await reader.read()

        if (done) break

        // Decode the chunk and append to accumulated text
        const chunk = decoder.decode(value, { stream: true })
        accumulatedText += chunk

        // Update the bot message with accumulated text
        const currentText = accumulatedText
        setMessages([userMessage, { role: 'bot', text: currentText }])
      }

      // Stream complete
      setIsStreaming(false)
      setIsLoading(false)

      if (isTutorialChatTriggered.current) {
        isTutorialChatTriggered.current = false
        dispatchTutorialAction('CHATBOT_SUGGESTION_CLICK')
      }

      // Fire-and-forget: Log CHAT_RESPONSE_RECEIVED tracking event
      const latencyMs = Date.now() - querySentAt
      fetch('/api/study/chat/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'CHAT_RESPONSE_RECEIVED',
          eventData: {
            queryLength: text.length,
            responseLength: accumulatedText.length,
            latencyMs,
            productId,
          },
        }),
      }).catch(() => {
        // Tracking failure is non-critical — silently ignore
      })
    } catch (error: unknown) {
      // Handle abort (user sent a new query before this one finished)
      if (error instanceof Error && error.name === 'AbortError') {
        return
      }

      console.error('Chat error:', error)
      setMessages([
        userMessage,
        {
          role: 'bot',
          text: 'Connection lost. Please check your internet and try again.',
          isError: true,
        },
      ])
      setIsStreaming(false)
      setIsLoading(false)
      isTutorialChatTriggered.current = false
    }
  }, [productId, waitingForAction, dispatchTutorialAction])

  const handleQuestionClick = (question: string) => {
    handleSend(question)
  }

  return (
    <div className="h-auto flex flex-col bg-sky-00 mt-10 rounded-xl border-2 border-sky-400 shadow-sm mx-auto max-w-4xl w-full">
      {/* Header */}
      <div className="px-4 py-4">
        <h2 className="text-xl font-bold text-slate-900">
          Looking for specific info?
        </h2>
      </div>
      {/* Input */}
      <div className="px-4 space-y-2">
        <ChatInput onSend={handleSend} disabled={isLoading} isLoading={isLoading} />
        {/* Suggested Questions (only shown before first message) */}
        {messages.length === 0 && (
          <div className="pt-1">
            <SuggestedQuestions
              questions={suggestedQuestions}
              onQuestionClick={handleQuestionClick}
            />
          </div>
        )}
      </div>
      {/* Messages — only show bot messages (user message is implicit from the input) */}
      <div className="flex-1 overflow-y-auto p-2 space-y-3">
        {messages.filter(msg => msg.role !== 'user').map((msg, index) => (
          <ChatMessage
            key={index}
            role={msg.role}
            text={msg.text}
            isError={msg.isError}
            isStreaming={isStreaming && !msg.isError && index === messages.filter(m => m.role !== 'user').length - 1}
          />
        ))}
      </div>
      <p className="text-xs italic text-slate-500 pt-0 pb-4 px-5">
        Powered by AI
      </p>
    </div>
  )
}
