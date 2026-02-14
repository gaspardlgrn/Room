import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CalendarClock,
  FileSearch,
  Plus,
  Send,
  Sparkles,
} from 'lucide-react'

export default function Dashboard() {
  const [prompt, setPrompt] = useState('')
  const navigate = useNavigate()

  const handleSend = () => {
    const trimmed = prompt.trim()
    if (!trimmed) return

    // Générer un nouvel ID de conversation
    const newChatId = Date.now()

    // Créer le label (tronqué à 50 caractères)
    const label = trimmed.length > 50 ? trimmed.substring(0, 50) + '...' : trimmed

    // Charger les history items existants
    try {
      const raw = window.localStorage.getItem('history:items')
      const existingItems = raw ? JSON.parse(raw) : []
      
      // Ajouter le nouvel item au début de la liste
      const newItems = [
        { id: newChatId, label },
        ...existingItems.filter((item: { id: number }) => item.id !== newChatId),
      ]
      
      // Sauvegarder dans localStorage
      window.localStorage.setItem('history:items', JSON.stringify(newItems))
    } catch {
      // Ignore storage errors
    }

    // Créer le message initial dans localStorage pour cette conversation
    const storageKey = `chat:history:${newChatId}`
    const initialMessage = {
      id: `user-${Date.now()}`,
      role: 'user' as const,
      text: trimmed,
    }
    try {
      window.localStorage.setItem(storageKey, JSON.stringify([initialMessage]))
    } catch {
      // Ignore storage errors
    }

    // Naviguer vers la nouvelle page de discussion
    navigate(`/history/${newChatId}`)
  }

  return (
    <div className="relative flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-4">
      <div className="max-w-2xl text-center">
        <div className="font-display text-[24px] leading-tight text-gray-900">
          What can Room help with today?
        </div>
      </div>

      <div className="mt-6 w-full max-w-2xl rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
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
        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-gray-500">
          <button className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1">
            <FileSearch className="h-3 w-3" />
            Search Public Files
          </button>
          <button className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1">
            <CalendarClock className="h-3 w-3" />
            Schedule Task
          </button>
          <button className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1">
            <Plus className="h-3 w-3" />
            New Table
          </button>
        </div>
      </div>
    </div>
  )
}
