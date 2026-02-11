import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  ChevronRight,
  ExternalLink,
  Share2,
  UserRound,
} from 'lucide-react'

export default function HistoryChat() {
  const { id } = useParams()
  const chatId = id || 'default'
  const storageKey = `chat:history:${chatId}`
  const [showSources, setShowSources] = useState(true)
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [messages, setMessages] = useState<
    Array<{ id: string; role: 'user' | 'assistant'; text: string }>
  >([])

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey)
      if (raw) {
        const parsed = JSON.parse(raw) as typeof messages
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed)
          return
        }
      }
    } catch {
      // Ignore storage errors
    }
    setMessages([])
  }, [storageKey])

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(messages))
    } catch {
      // Ignore storage errors
    }
  }, [messages, storageKey])

  const handleSend = async () => {
    const trimmed = input.trim()
    if (!trimmed || isSending) {
      return
    }
    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user' as const,
      text: trimmed,
    }
    setInput('')
    setMessages((prev) => [...prev, userMessage])
    setIsSending(true)
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed }),
      })
      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || `Erreur chat (HTTP ${response.status})`)
      }
      const data = (await response.json()) as { reply?: string }
      const reply = data.reply?.trim() || ''
      if (!reply) {
        throw new Error('Réponse IA vide.')
      }
      setMessages((prev) => [
        ...prev,
        { id: `assistant-${Date.now() + 1}`, role: 'assistant', text: reply },
      ])
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now() + 1}`,
          role: 'assistant',
          text:
            error instanceof Error
              ? `Erreur: ${error.message}`
              : 'Erreur lors de la requête.',
        },
      ])
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="relative grid min-h-[80vh] gap-0 px-6 pb-24 pt-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="flex flex-col items-center">
        <div className="w-full max-w-3xl space-y-6">
          {messages.map((message) => {
            if (message.role === 'user') {
              return (
                <div key={message.id} className="flex justify-end">
                  <div className="max-w-2xl rounded-2xl bg-white px-4 py-3 text-sm text-gray-700 shadow-sm">
                    {message.text}
                  </div>
                </div>
              )
            }
            return (
              <div key={message.id} className="prose prose-sm max-w-none text-gray-800">
                <div className="rounded-2xl bg-white px-5 py-4 shadow-sm">
                  <div className="whitespace-pre-wrap">{message.text}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {showSources ? (
        <aside className="relative hidden border-l border-gray-200 pl-4 lg:flex lg:flex-col lg:self-stretch">
          <div className="flex items-center justify-between pt-1">
            <div className="text-xs text-gray-500">Sources</div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              2
              <button className="rounded-full border border-gray-200 bg-white p-1">
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowSources(false)}
            className="absolute right-4 top-0 hidden h-7 w-7 items-center justify-center rounded-full border border-gray-200 bg-white text-xs text-gray-500 lg:flex"
            aria-label="Fermer la colonne sources"
          >
            ×
          </button>
          <div className="mt-4 space-y-3" />
      </aside>
      ) : null}

      <div className="fixed bottom-6 left-0 right-0 z-10 px-6 lg:left-64 lg:right-80">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !isSending) {
                handleSend()
              }
            }}
            className="flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
            placeholder="Ask a follow up..."
          />
          <button
            onClick={handleSend}
            disabled={isSending || !input.trim()}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-700 text-white shadow-sm hover:bg-emerald-800"
            aria-label="Envoyer"
          >
            <ExternalLink className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="fixed right-6 top-6 flex items-center gap-2">
        <button className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-600 shadow-sm">
          <Share2 className="h-3 w-3" />
          Share
        </button>
        <button className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500">
          <UserRound className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
