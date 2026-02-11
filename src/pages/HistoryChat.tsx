import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  ExternalLink,
  Share2,
  UserRound,
} from 'lucide-react'
import MarkdownAnswer from '../components/MarkdownAnswer'
import StructuredAnswer from '../components/StructuredAnswer'

export default function HistoryChat() {
  const { id } = useParams()
  const chatId = id || 'default'
  const storageKey = `chat:history:${chatId}`
  const [showSources, setShowSources] = useState(true)
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [messages, setMessages] = useState<
    Array<{
      id: string
      role: 'user' | 'assistant'
      text: string
      structured?: {
        title?: string
        summary?: string
        sections?: Array<{
          heading?: string
          paragraphs?: string[]
          bullets?: string[]
        }>
        tables?: Array<{
          title?: string
          columns?: string[]
          rows?: string[][]
        }>
        conclusion?: string
      }
      sources?: Array<{
        title?: string
        url?: string
        publishedDate?: string
        author?: string
        excerpt?: string
      }>
    }>
  >([])

  const getHost = (url?: string) => {
    if (!url) return 'Domaine inconnu'
    try {
      return new URL(url).hostname
    } catch {
      return url
    }
  }

  const parseStructured = (text?: string) => {
    if (!text) return null
    let cleaned = text.trim()
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim()
    }
    const normalize = (value: string) => {
      let normalized = value.trim()
      const start = normalized.indexOf('{')
      const end = normalized.lastIndexOf('}')
      if (start >= 0 && end > start) {
        normalized = normalized.slice(start, end + 1)
      }
      for (let i = 0; i < 5; i += 1) {
        normalized = normalized.replace(/^\{\s*\{/, '{')
      }
      return normalized
    }
    const tryParse = (value: string) => {
      try {
        return JSON.parse(value) as {
          title?: string
          summary?: string
          sections?: Array<{
            heading?: string
            paragraphs?: string[]
            bullets?: string[]
          }>
          tables?: Array<{
            title?: string
            columns?: string[]
            rows?: string[][]
          }>
          conclusion?: string
        }
      } catch {
        return null
      }
    }
    const normalized = normalize(cleaned)
    let parsed = tryParse(normalized)
    if (!parsed && normalized.startsWith('{{')) {
      parsed = tryParse(normalized.slice(1))
    }
    if (!parsed) return null
    const hasContent =
      !!parsed.title ||
      !!parsed.summary ||
      (parsed.sections?.length ?? 0) > 0 ||
      (parsed.tables?.length ?? 0) > 0 ||
      !!parsed.conclusion
    return hasContent ? parsed : null
  }

  const normalizeMessage = (
    message: {
      id: string
      role: 'user' | 'assistant'
      text: string
      structured?: {
        title?: string
        summary?: string
        sections?: Array<{
          heading?: string
          paragraphs?: string[]
          bullets?: string[]
        }>
        tables?: Array<{
          title?: string
          columns?: string[]
          rows?: string[][]
        }>
        conclusion?: string
      }
      sources?: Array<{
        title?: string
        url?: string
        publishedDate?: string
        author?: string
        excerpt?: string
      }>
    }
  ) => {
    if (message.role !== 'assistant') return message
    const parsed = message.structured || parseStructured(message.text)
    const jsonish =
      message.text.trim().includes('"title"') ||
      message.text.trim().includes('"sections"') ||
      (message.text.includes('{') && message.text.includes('}'))
    if (parsed) {
      return { ...message, structured: parsed, text: jsonish ? '' : message.text }
    }
    if (jsonish) {
      return { ...message, text: 'Réponse en cours de normalisation.' }
    }
    return message
  }

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey)
      if (raw) {
        const parsed = JSON.parse(raw) as typeof messages
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed.map(normalizeMessage))
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
      const data = (await response.json()) as {
        reply?: string
        structured?: {
          title?: string
          summary?: string
          sections?: Array<{
            heading?: string
            paragraphs?: string[]
            bullets?: string[]
          }>
          tables?: Array<{
            title?: string
            columns?: string[]
            rows?: string[][]
          }>
          conclusion?: string
        }
        sources?: Array<{
          title?: string
          url?: string
          publishedDate?: string
          author?: string
          excerpt?: string
        }>
      }
      const reply = data.reply?.trim() || ''
      if (!reply && !data.structured) {
        throw new Error('Réponse IA vide.')
      }
      const sources = Array.isArray(data.sources) ? data.sources : []
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now() + 1}`,
          role: 'assistant',
          text: reply,
          structured: data.structured,
          sources,
        },
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
    <div className="relative min-h-[80vh] px-6 pb-24 pt-4">
      <div className="flex flex-col items-center lg:pr-[360px]">
        <div className="w-full max-w-3xl space-y-6">
          {messages.map((message) => {
            if (message.role === 'user') {
              return (
                <div key={message.id} className="flex justify-end">
                  <div className="max-w-2xl rounded-2xl bg-white px-4 py-3 text-xs text-gray-700 shadow-sm">
                    {message.text}
                  </div>
                </div>
              )
            }
            const structured = message.structured || parseStructured(message.text)
            return (
              <div key={message.id} className="rounded-2xl bg-white px-6 py-5 shadow-sm">
                <article className="ai-answer text-gray-800">
                  {structured ? (
                    <StructuredAnswer answer={structured} />
                  ) : (
                    <MarkdownAnswer content={message.text} />
                  )}
                </article>
              </div>
            )
          })}
        </div>
      </div>

      {showSources ? (
        <aside className="fixed right-0 top-0 z-30 hidden h-screen w-[320px] border-l-2 border-gray-200 bg-white px-4 pt-5 lg:flex lg:flex-col">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              Sources
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                {(messages
                  .slice()
                  .reverse()
                  .find((item) => item.role === 'assistant' && item.sources?.length)
                  ?.sources?.length ?? 0) || 0}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowSources(false)}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 bg-white text-xs text-gray-500"
              aria-label="Fermer la colonne sources"
            >
              ×
            </button>
          </div>
          <button
            type="button"
            onClick={() => setShowSources(false)}
            className="sr-only"
            aria-label="Fermer la colonne sources"
          >
            ×
          </button>
          <div className="mt-4 space-y-4 overflow-y-auto pr-1">
            {(messages
              .slice()
              .reverse()
              .find((item) => item.role === 'assistant' && item.sources?.length)
              ?.sources || []
            ).map((source, index) => (
              <div
                key={`${source.url || source.title || index}`}
                className="rounded-xl border border-gray-200 bg-white px-3 py-3 text-xs text-gray-600 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-[11px] font-semibold text-emerald-700">
                    {index + 1}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 bg-white text-sm font-semibold text-gray-700">
                        {(source.title || source.url || 'S').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">
                          {source.title || 'Source'}
                        </div>
                        <div className="text-[11px] text-gray-500">
                          {getHost(source.url)}
                        </div>
                      </div>
                    </div>
                    {source.excerpt ? (
                      <p className="mt-2 text-[11px] text-gray-600">
                        {source.excerpt}
                      </p>
                    ) : null}
                    <div className="mt-3 text-[11px] font-semibold text-gray-500">
                      Overview
                    </div>
                    <div className="mt-1 grid grid-cols-2 gap-2 text-[11px] text-gray-600">
                      <div>
                        <div className="text-gray-400">Name</div>
                        <div className="font-semibold text-gray-700">
                          {source.title || 'Source'}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400">Published</div>
                        <div className="font-semibold text-gray-700">
                          {source.publishedDate || 'N/A'}
                        </div>
                      </div>
                    </div>
                    {source.url ? (
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800"
                      >
                        Ouvrir
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </aside>
      ) : null}

      <div className="fixed bottom-6 left-0 right-0 z-10 px-6 lg:left-[var(--sidebar-width)] lg:right-[360px]">
        <div className="mx-auto flex w-full max-w-2xl items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm">
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
