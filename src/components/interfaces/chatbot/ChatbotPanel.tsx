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
  /** Optional callback to sync the full transcript to the parent */
  onTranscriptUpdate?: (transcript: { role: 'user' | 'bot'; text: string }[]) => void
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

export function ChatbotPanel({ productId, onTranscriptUpdate }: ChatbotPanelProps) {
  const { waitingForAction, dispatchTutorialAction } = useTutorial()
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)

  // Abort controller ref so we can cancel in-flight requests
  const abortControllerRef = useRef<AbortController | null>(null)
  const isTutorialChatTriggered = useRef(false)
  const fullTranscriptRef = useRef<{ role: 'user' | 'bot'; text: string }[]>([])

  const questionsKey = productId.toUpperCase()
  const suggestedQuestions = SUGGESTED_QUESTIONS[questionsKey] || SUGGESTED_QUESTIONS.EARBUDS

  /**
   * Sends the user query to the RAG chat API and streams the response
   * token-by-token into the message display.
   */
  const handleSend = useCallback(async (text: string) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    const abortController = new AbortController()
    abortControllerRef.current = abortController

    if (waitingForAction === 'CHATBOT_SUGGESTION_CLICK') {
      isTutorialChatTriggered.current = true
    }

    const querySentAt = Date.now()

    // Log the user's query immediately so it's not lost if they submit right away
    fullTranscriptRef.current.push({ role: 'user', text })
    if (onTranscriptUpdate) onTranscriptUpdate([...fullTranscriptRef.current])

    const userMessage: Message = { role: 'user', text }
    setMessages([userMessage])
    setIsLoading(true)
    setIsStreaming(false)

    let accumulatedText = ''

    try {
      const response = await fetch('/api/study/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: text, productId }),
        signal: abortController.signal,
      })

      if (!response.ok) {
        let errorMessage = 'Something went wrong. Please try again.'
        try {
          const errorBody = await response.json()
          if (errorBody.error) {
            errorMessage = errorBody.error
          }
        } catch {}

        setMessages([userMessage, { role: 'bot', text: errorMessage, isError: true }])
        setIsLoading(false)
        isTutorialChatTriggered.current = false
        
        fullTranscriptRef.current.push({ role: 'bot', text: errorMessage })
        if (onTranscriptUpdate) onTranscriptUpdate([...fullTranscriptRef.current])
        return
      }

      const reader = response.body?.getReader()
      if (!reader) {
        setMessages([
          userMessage,
          { role: 'bot', text: 'Failed to read the response stream.', isError: true },
        ])
        setIsLoading(false)
        isTutorialChatTriggered.current = false
        
        fullTranscriptRef.current.push({ role: 'bot', text: 'Failed to read the response stream.' })
        if (onTranscriptUpdate) onTranscriptUpdate([...fullTranscriptRef.current])
        return
      }

      const decoder = new TextDecoder()
      setMessages([userMessage, { role: 'bot', text: '' }])
      setIsStreaming(true)

      while (true) {
        const { done, value } = await reader.read()

        if (done) break

        accumulatedText += decoder.decode(value, { stream: true })
        setMessages([userMessage, { role: 'bot', text: accumulatedText }])
      }

      setIsStreaming(false)
      setIsLoading(false)

      fullTranscriptRef.current.push({ role: 'bot', text: accumulatedText })
      if (onTranscriptUpdate) onTranscriptUpdate([...fullTranscriptRef.current])

      if (isTutorialChatTriggered.current) {
        isTutorialChatTriggered.current = false
        dispatchTutorialAction('CHATBOT_SUGGESTION_CLICK')
      }

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
      }).catch(() => {})
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        // Log whatever we had before aborting
        fullTranscriptRef.current.push({ role: 'bot', text: accumulatedText ? (accumulatedText + ' (aborted)') : '(aborted)' })
        if (onTranscriptUpdate) onTranscriptUpdate([...fullTranscriptRef.current])
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
      
      fullTranscriptRef.current.push({ role: 'bot', text: 'Connection lost. Please check your internet and try again.' })
      if (onTranscriptUpdate) onTranscriptUpdate([...fullTranscriptRef.current])
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
