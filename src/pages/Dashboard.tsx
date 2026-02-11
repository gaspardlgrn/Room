import { useState } from 'react'
import {
  CalendarClock,
  FileSearch,
  Plus,
  Send,
  Sparkles,
} from 'lucide-react'

export default function Dashboard() {
  const [prompt, setPrompt] = useState('')

  return (
    <div className="relative flex min-h-[70vh] flex-col items-center justify-center px-4">
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
            placeholder="Ask Room anything..."
            className="flex-1 bg-transparent text-[14px] text-gray-800 outline-none placeholder:text-gray-400"
          />
          <button className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50">
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

      <div className="pointer-events-none absolute bottom-4 right-4 hidden w-40 overflow-hidden rounded-2xl bg-black/90 shadow-xl sm:block">
        <div className="h-28 bg-gradient-to-br from-gray-700 via-gray-900 to-black" />
        <div className="px-3 py-2 text-xs text-white/80">Room demo</div>
      </div>
    </div>
  )
}
