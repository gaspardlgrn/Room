import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import { Download, ExternalLink, Loader2 } from 'lucide-react'
import MarkdownAnswer from '../components/MarkdownAnswer'
import OfficeLogo from '../components/OfficeLogo'
import SourcesPanel from '../components/SourcesPanel'

type DocumentMessage = {
  id: string
  role: 'document'
  prompt: string
  status: 'pending' | 'ready'
  filename?: string
  format?: string
  base64?: string
  error?: string
}

type ChatMessage =
  | { id: string; role: 'user'; text: string }
  | { id: string; role: 'assistant'; text: string; sources?: Array<{ title?: string; url?: string; publishedDate?: string; author?: string; excerpt?: string }> }
  | DocumentMessage

export default function HistoryChat() {
  const { getToken } = useAuth()
  const { id } = useParams()
  const chatId = id || 'default'
  const storageKey = `chat:history:${chatId}`
  const [showSources, setShowSources] = useState(true)
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const endRef = useRef<HTMLDivElement | null>(null)
  const hasAutoSentRef = useRef(false)
  const [thinkingSteps, setThinkingSteps] = useState<{
    description: string
    currentStep: string
    items: string[]
  } | null>(null)
  const thinkingIntervalRef = useRef<number | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])

  const generateDocument = useCallback(
    async (docMsg: DocumentMessage) => {
      if (docMsg.status !== 'pending') return
      try {
        const token = await getToken()
        const res = await fetch('/api/generate-from-prompt', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          credentials: 'include',
          body: JSON.stringify({ prompt: docMsg.prompt }),
        })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data?.error || `Erreur ${res.status}`)
        }
        const blob = await res.blob()
        const filename = decodeURIComponent(res.headers.get('X-Filename') || 'document')
        const format = res.headers.get('X-Format') || 'docx'
        const reader = new FileReader()
        reader.readAsDataURL(blob)
        reader.onloadend = () => {
          const base64 = (reader.result as string)?.split(',')[1]
          setMessages((prev) =>
            prev.map((m) =>
              m.id === docMsg.id && m.role === 'document'
                ? { ...m, status: 'ready' as const, filename, format, base64 }
                : m
            )
          )
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Erreur lors de la génération'
        setMessages((prev) =>
          prev.map((m) =>
            m.id === docMsg.id && m.role === 'document'
              ? { ...m, status: 'ready' as const, filename: 'Erreur', format: 'docx', error: msg }
              : m
          )
        )
      }
    },
    [getToken]
  )

  useEffect(() => {
    hasAutoSentRef.current = false
    try {
      const raw = window.localStorage.getItem(storageKey)
      if (raw) {
        const parsed = JSON.parse(raw) as ChatMessage[]
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed)
          const docPending = parsed.find((m) => m.role === 'document' && m.status === 'pending')
          if (docPending) {
            generateDocument(docPending as DocumentMessage)
          } else if (parsed.length === 1 && parsed[0].role === 'user' && !hasAutoSentRef.current) {
            hasAutoSentRef.current = true
            handleAutoSend(parsed[0].text)
          }
          return
        }
      }
    } catch {
      // Ignore storage errors
    }
    setMessages([])
  }, [storageKey, generateDocument])

  const sendMessageWithStreaming = async (messageText: string) => {
    if (isSending) return
    setIsSending(true)

    // Générer une description dynamique basée sur le message
    const generateDescription = (msg: string) => {
      const lowerMsg = msg.toLowerCase()
      if (lowerMsg.includes('tableau') || lowerMsg.includes('comps') || lowerMsg.includes('comparables')) {
        return `Je rassemble les métriques financières clés et j'analyse les comparables pour créer un tableau comparatif détaillé.`
      } else if (lowerMsg.includes('analyse') || lowerMsg.includes('marché') || lowerMsg.includes('market')) {
        return `J'analyse le marché, les tendances et la concurrence pour fournir une analyse complète.`
      } else if (lowerMsg.includes('société') || lowerMsg.includes('entreprise') || lowerMsg.includes('company')) {
        return `J'analyse la société, sa position, ses produits et sa performance financière.`
      }
      return `J'analyse votre demande et je prépare une réponse détaillée basée sur les informations disponibles.`
    }

    // Liste des étapes qui vont être streamées dans le bloc Working
    const steps = [
      'Analyse de la demande',
      "Recherche d'informations",
      'Analyse et synthèse',
      'Préparation de la réponse structurée',
    ]

    // Nettoyer un éventuel intervalle précédent
    if (thinkingIntervalRef.current !== null) {
      window.clearInterval(thinkingIntervalRef.current)
      thinkingIntervalRef.current = null
    }

    let stepIndex = 0

    // Initialiser les étapes de réflexion
    setThinkingSteps({
      description: generateDescription(messageText),
      currentStep: steps[stepIndex],
      items: [],
    })

    // Créer le message assistant initial vide
    const assistantMessageId = `assistant-${Date.now()}`
    setMessages((prev) => [
      ...prev,
      {
        id: assistantMessageId,
        role: 'assistant',
        text: '',
        sources: [],
      },
    ])

    // Extraire les entités mentionnées (sociétés, etc.)
    const extractEntities = (msg: string) => {
      const entities: string[] = []
      // Chercher des acronymes en majuscules (ex: FDS, S&P, etc.)
      const acronyms = msg.match(/\b[A-Z]{2,5}\b/g)
      if (acronyms) {
        entities.push(...acronyms.slice(0, 5))
      }
      return entities
    }

    const entities = extractEntities(messageText)

    // Lancer un intervalle qui met à jour les étapes en continu pendant que le LLM travaille
    thinkingIntervalRef.current = window.setInterval(() => {
      stepIndex = Math.min(stepIndex + 1, steps.length - 1)
      setThinkingSteps((prev) =>
        prev
          ? {
              ...prev,
              currentStep: steps[stepIndex],
              items: entities,
            }
          : null
      )
    }, 900)

    try {
      const token = await getToken()
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message: messageText }),
        credentials: 'include',
      })

      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || `Erreur chat (HTTP ${response.status})`)
      }

      if (!response.body) {
        throw new Error('Réponse vide.')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let fullText = ''
      let sources: Array<{
        title?: string
        url?: string
        publishedDate?: string
        author?: string
        excerpt?: string
      }> = []

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.type === 'chunk' && data.content) {
                fullText += data.content
                // On accumule seulement, on affichera tout d'un coup à la fin
              } else if (data.type === 'done' && data.sources) {
                sources = data.sources
                // Mettre à jour avec les sources finales
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? { ...msg, text: fullText, sources }
                      : msg
                  )
                )
              } else if (data.type === 'error') {
                throw new Error(data.error || 'Erreur lors de la génération')
              }
            } catch (e) {
              // Ignore les erreurs de parsing
            }
          }
        }
      }

      if (!fullText.trim()) {
        throw new Error('Réponse IA vide.')
      }

      if (thinkingIntervalRef.current !== null) {
        window.clearInterval(thinkingIntervalRef.current)
        thinkingIntervalRef.current = null
      }
      setThinkingSteps(null)
    } catch (error) {
      if (thinkingIntervalRef.current !== null) {
        window.clearInterval(thinkingIntervalRef.current)
        thinkingIntervalRef.current = null
      }
      setThinkingSteps(null)
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                text:
                  error instanceof Error
                    ? `Erreur: ${error.message}`
                    : 'Erreur lors de la requête.',
              }
            : msg
        )
      )
    } finally {
      setIsSending(false)
    }
  }

  const handleAutoSend = async (messageText: string) => {
    await sendMessageWithStreaming(messageText)
  }

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' })
  }, [messages])

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
    await sendMessageWithStreaming(trimmed)
  }

  return (
    <div className="relative min-h-[80vh] px-3 pb-24 pt-4">
      <div className="flex flex-col items-center lg:pr-[360px]">
        <div className="w-full max-w-3xl space-y-6 pb-16">
          {messages.map((message) => {
            if (message.role === 'user') {
              return (
                <div key={message.id} className="flex justify-end">
                  <div className="max-w-3xl rounded-2xl bg-gray-100 px-4 py-3 text-xs text-gray-700 shadow-sm">
                    {message.text}
                  </div>
                </div>
              )
            }
            if (message.role === 'document') {
              const isPending = message.status === 'pending'
              const hasError = !!message.error
              const filename = message.filename || 'document'
              const canDownload = message.status === 'ready' && message.base64
              return (
                <div key={message.id} className="flex justify-start">
                  <div className="flex max-w-3xl items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
                    <OfficeLogo format={message.format || 'docx'} size={40} />
                    <div className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-gray-700">
                        {isPending ? 'Génération en cours...' : hasError ? message.error : filename}
                      </span>
                    </div>
                    {isPending ? (
                      <Loader2 className="h-5 w-5 shrink-0 animate-spin text-gray-400" />
                    ) : canDownload ? (
                      <a
                        href={`data:${message.format === 'xlsx' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : message.format === 'pptx' ? 'application/vnd.openxmlformats-officedocument.presentationml.presentation' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'};base64,${message.base64}`}
                        download={filename}
                        className="flex shrink-0 items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Télécharger
                      </a>
                    ) : hasError ? (
                      <button
                        type="button"
                        onClick={() => {
                          setMessages((prev) =>
                            prev.map((m) =>
                              m.id === message.id && m.role === 'document'
                                ? { ...m, status: 'pending' as const, error: undefined }
                                : m
                            )
                          )
                          generateDocument({ ...message, status: 'pending', error: undefined })
                        }}
                        className="flex shrink-0 items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Réessayer
                      </button>
                    ) : null}
                  </div>
                </div>
              )
            }
            const isEmpty = !message.text || message.text.trim() === ''
            const isLastMessage = messages[messages.length - 1]?.id === message.id
            const showTyping = isEmpty && isLastMessage && isSending
            
            return (
              <div key={message.id} className="rounded-2xl bg-white px-6 py-5 shadow-sm">
                {showTyping && thinkingSteps ? (
                  <div className="space-y-4">
                    <div className="text-base font-semibold text-gray-900">Working...</div>
                    <div className="flex items-start gap-2 text-sm font-normal text-gray-700">
                      <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border border-emerald-400 bg-emerald-50">
                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                      </div>
                      <div className="flex-1">{thinkingSteps.description}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-xs font-normal text-gray-500">{thinkingSteps.currentStep}</div>
                      {thinkingSteps.items.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {thinkingSteps.items.map((item, idx) => (
                            <span
                              key={idx}
                              className="rounded-md bg-gray-100 px-2 py-1 text-xs font-normal text-gray-700"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : message.text ? (
                  <article className="ai-answer text-gray-800">
                    <MarkdownAnswer content={message.text} />
                  </article>
                ) : null}
              </div>
            )
          })}
          <div ref={endRef} className="scroll-mb-16" />
        </div>
      </div>

      {showSources ? (
        <SourcesPanel
          sources={
            (messages
              .slice()
              .reverse()
              .find((m): m is Extract<ChatMessage, { role: 'assistant' }> => m.role === 'assistant')
            )?.sources ?? []
          }
          onClose={() => setShowSources(false)}
        />
      ) : null}

      <div className="fixed bottom-6 left-0 right-0 z-10 px-3 lg:left-[var(--sidebar-width)] lg:right-[360px]">
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

      {/* Bandeau haut supprimé */}
    </div>
  )
}
