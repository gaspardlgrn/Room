import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Send, Sparkles } from 'lucide-react'

export default function Dashboard() {
  const [prompt, setPrompt] = useState('')
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleSend = () => {
    const trimmed = prompt.trim()
    if (!trimmed) return

    setError(null)
    const newChatId = Date.now()
    const label = trimmed.length > 50 ? trimmed.substring(0, 50) + '...' : trimmed

    const userMessage = { id: `user-${Date.now()}`, role: 'user' as const, text: trimmed }
    const docMessage = {
      id: `document-${Date.now()}`,
      role: 'document' as const,
      prompt: trimmed,
      status: 'pending' as const,
    }

    try {
      const raw = window.localStorage.getItem('history:items')
      const existingItems = raw ? JSON.parse(raw) : []
      const newItems = [
        { id: newChatId, label },
        ...existingItems.filter((item: { id: number }) => item.id !== newChatId),
      ]
      window.localStorage.setItem('history:items', JSON.stringify(newItems))
    } catch {
      // ignore
    }

    const storageKey = `chat:history:${newChatId}`
    try {
      window.localStorage.setItem(storageKey, JSON.stringify([userMessage, docMessage]))
    } catch {
      // ignore
    }

    navigate(`/history/${newChatId}`)
  }

  return (
    <div className="relative flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-4">
      <div className="max-w-2xl text-center">
        <div className="font-display text-[24px] leading-tight text-gray-900">
          What can Room help with today?
        </div>
      </div>

      <div className="mt-6 w-full max-w-2xl rounded-2xl border border-gray-200 !bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2 text-[11px] text-gray-400">
          <Sparkles className="h-3 w-3" />
          Ask Room anything...
        </div>
        <div className="mt-3 flex items-center gap-3">
          <input
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                handleSend()
              }
            }}
            placeholder="Ask Room anything..."
            className="flex-1 bg-transparent text-[14px] text-gray-800 outline-none placeholder:text-gray-400"
          />
          <button
            onClick={handleSend}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        {error && (
          <p className="mt-3 text-xs text-red-600">{error}</p>
        )}
      </div>
    </div>
  )
}
