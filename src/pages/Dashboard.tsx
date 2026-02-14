import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, Send, Sparkles } from 'lucide-react'
import { useAuth } from '@clerk/clerk-react'

export default function Dashboard() {
  const [prompt, setPrompt] = useState('')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const { getToken } = useAuth()

  const handleSend = async () => {
    const trimmed = prompt.trim()
    if (!trimmed) return

    setError(null)
    setGenerating(true)
    try {
      const token = await getToken()
      const res = await fetch('/api/generate-from-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({ prompt: trimmed }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error || `Erreur ${res.status}`)
      }
      const blob = await res.blob()
      const filename = decodeURIComponent(res.headers.get('X-Filename') || 'document')
      const format = res.headers.get('X-Format') || 'docx'
      const url = URL.createObjectURL(blob)
      navigate('/document-result', {
        state: { downloadUrl: url, filename, format },
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la génération')
    } finally {
      setGenerating(false)
    }
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
            disabled={generating}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            {generating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
        {error && (
          <p className="mt-3 text-xs text-red-600">{error}</p>
        )}
      </div>
    </div>
  )
}
