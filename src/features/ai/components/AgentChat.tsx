'use client'

import { useEffect, useRef, useState } from 'react'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const INITIAL_MESSAGE: ChatMessage = {
  id: 'init',
  role: 'assistant',
  content: 'Hola! Soy tu asistente. Puedo consultar datos del centro o ejecutar acciones. ¿En qué te ayudo?',
}

export function AgentChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [historyLoaded, setHistoryLoaded] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && !historyLoaded) {
      fetch('/api/ai/history')
        .then((r) => r.json())
        .then((history: ChatMessage[]) => {
          if (Array.isArray(history) && history.length > 0) {
            setMessages([INITIAL_MESSAGE, ...history])
          }
          setHistoryLoaded(true)
        })
        .catch(() => setHistoryLoaded(true))
    }
  }, [isOpen, historyLoaded])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || isLoading) return

    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: 'user', content: text }
    const assistantId = crypto.randomUUID()
    const assistantMsg: ChatMessage = { id: assistantId, role: 'assistant', content: '' }

    setMessages((prev) => [...prev, userMsg, assistantMsg])
    setInput('')
    setIsLoading(true)

    // Filter out the hardcoded welcome message — APIs require conversations to start with 'user'
    const history = [...messages, userMsg]
      .filter((m) => m.id !== 'init')
      .map((m) => ({ role: m.role, content: m.content }))

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || 'Error del servidor de IA')
      }

      if (!response.body) throw new Error('No response body')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: accumulated } : m))
        )
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, content: 'Ocurrió un error. Intentá de nuevo.' } : m
        )
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(e as unknown as React.FormEvent)
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg text-white text-xl transition-transform hover:scale-110"
        style={{
          background: 'linear-gradient(135deg, #7C3AED, #4F46E5)',
          boxShadow: '0 8px 32px rgba(124,58,237,0.4)',
        }}
        aria-label="Abrir asistente"
      >
        {isOpen ? '✕' : '✦'}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 z-50 flex flex-col rounded-2xl overflow-hidden"
          style={{
            width: '380px',
            height: '520px',
            background: '#1A0A30',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 25px 50px -12px rgba(124,58,237,0.25)',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 shrink-0"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: '#150825' }}
          >
            <div className="flex items-center gap-2">
              <span className="text-purple-400 text-lg">✦</span>
              <span className="text-white font-medium text-sm">Asistente</span>
              {isLoading && (
                <span className="text-xs text-purple-400 animate-pulse">procesando...</span>
              )}
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/40 hover:text-white/80 text-sm transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className="max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap"
                  style={
                    m.role === 'user'
                      ? { background: 'rgba(124,58,237,0.25)', color: '#E9D5FF' }
                      : { background: 'rgba(255,255,255,0.06)', color: '#D1D5DB' }
                  }
                >
                  {m.content || (isLoading ? <span className="animate-pulse text-purple-400">...</span> : '')}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            className="shrink-0 px-3 py-3"
            style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
          >
            <form onSubmit={sendMessage} className="flex gap-2 items-end">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribí tu consulta..."
                rows={1}
                className="flex-1 resize-none rounded-xl px-3 py-2 text-sm text-white placeholder-white/30 outline-none"
                style={{
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  maxHeight: '100px',
                }}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-white disabled:opacity-40 transition-opacity"
                style={{ background: 'linear-gradient(135deg, #7C3AED, #4F46E5)' }}
              >
                →
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
