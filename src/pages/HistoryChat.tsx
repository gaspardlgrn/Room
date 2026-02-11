import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  ChevronRight,
  ExternalLink,
  Share2,
  UserRound,
} from 'lucide-react'

const HISTORY_CONTENT = [
  {
    id: '1',
    prompt: 'build a comps tables table for FDS vs peers (i.e. comps for rogo)',
    summary:
      "I'm gathering key financial metrics for FactSet and its competitors, including Bloomberg, S&P Global, Refinitiv, and Rogo. I'll analyze their Market Cap, Total Enterprise Value, EV/Sales, and EV/EBITDA over the last five periods to create a comprehensive comparative table.",
    companies: ['FDS', 'Rogo', 'Bloomberg', 'S&P Global', 'Refinitiv'],
  },
  {
    id: '2',
    prompt: "Google's AI initiatives and ad",
    summary:
      'Summarizing Alphabet AI initiatives and ad platform updates with a focus on recent earnings calls and product launches.',
    companies: ['Alphabet', 'Google', 'DeepMind'],
  },
  {
    id: '3',
    prompt: "Today's news summary",
    summary:
      'Compiling the top market-moving headlines across AI, fintech, and enterprise software.',
    companies: ['Nvidia', 'OpenAI', 'Microsoft'],
  },
  {
    id: '4',
    prompt: "CFO MAP's salary and comp",
    summary:
      "Pulling compensation benchmarks for CFO roles across comparable mid-cap software companies.",
    companies: ['Public comps', 'Peer group'],
  },
  {
    id: '5',
    prompt: 'Request to proofread attached',
    summary:
      'Reviewing attached document for clarity, tone, and correctness before final delivery.',
    companies: ['Internal doc'],
  },
  {
    id: '6',
    prompt: 'Create a proofreading prompt',
    summary:
      'Drafting a reusable prompt template for proofreading tasks.',
    companies: ['Template'],
  },
]

export default function HistoryChat() {
  const { id } = useParams()
  const content = useMemo(
    () => HISTORY_CONTENT.find((item) => item.id === id) || HISTORY_CONTENT[0],
    [id]
  )
  const [showSources, setShowSources] = useState(true)
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [messages, setMessages] = useState<
    Array<{ id: string; role: 'user' | 'assistant'; text: string }>
  >([
    {
      id: 'seed-user',
      role: 'user',
      text: content.prompt,
    },
    {
      id: 'seed-assistant',
      role: 'assistant',
      text: content.summary,
    },
  ])

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
      if (!data.reply) {
        throw new Error('Réponse IA vide.')
      }
      setMessages((prev) => [
        ...prev,
        { id: `assistant-${Date.now() + 1}`, role: 'assistant', text: data.reply },
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
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-2xl rounded-2xl px-4 py-3 text-sm shadow-sm ${
                  message.role === 'user'
                    ? 'bg-white text-gray-700'
                    : 'bg-gray-50 text-gray-700'
                }`}
              >
                {message.text}
              </div>
            </div>
          ))}

          <div>
            <div className="text-xs text-gray-500">Working...</div>
            <div className="mt-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full border border-gray-200 text-[10px] text-gray-500">
                  ✓
                </div>
                <div className="text-sm text-gray-700">{content.summary}</div>
              </div>
              <div className="mt-4 text-xs text-gray-500">Identifying companies</div>
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
                {content.companies.map((company) => (
                  <span
                    key={company}
                    className="rounded-full border border-gray-200 bg-gray-50 px-2 py-1"
                  >
                    {company}
                  </span>
                ))}
              </div>
            </div>
          </div>
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
          <div className="mt-4 space-y-3">
          {[
            {
              name: 'FactSet Research Systems Inc.',
              ticker: 'FDS',
              site: 'factset.com',
              metric: 'Market Cap',
              value: '$13.7B',
            },
            {
              name: 'S&P Global Inc.',
              ticker: 'SPGI',
              site: 'spglobal.com',
              metric: 'Market Cap',
              value: '$166.1B',
            },
          ].map((source) => (
            <div
              key={source.ticker}
              className="rounded-xl border border-gray-200 bg-white p-3 text-xs text-gray-600 shadow-sm"
            >
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded bg-gray-100 text-[10px] font-semibold text-gray-500">
                  {source.ticker[0]}
                </div>
                <div className="font-semibold text-gray-800">
                  {source.name}
                </div>
              </div>
              <div className="mt-1 text-[11px] text-gray-400">{source.site}</div>
              <div className="mt-3 rounded-lg border border-gray-100 bg-gray-50 px-2 py-2">
                <div className="text-[11px] text-gray-500">
                  {source.metric}
                </div>
                <div className="text-sm font-semibold text-gray-900">
                  {source.value}
                </div>
              </div>
            </div>
          ))}
        </div>
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
