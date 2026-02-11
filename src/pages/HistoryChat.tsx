import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { ChevronRight, ExternalLink } from 'lucide-react'

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

  return (
    <div className="relative flex min-h-[70vh] flex-col items-center justify-center px-4">
      <div className="w-full max-w-3xl">
        <div className="flex justify-end">
          <div className="max-w-xl rounded-full bg-white px-4 py-2 text-sm text-gray-700 shadow-sm">
            {content.prompt}
          </div>
        </div>

        <div className="mt-8">
          <div className="text-xs text-gray-500">Working...</div>
          <div className="mt-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
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

          <div className="mt-6 flex items-center gap-2 text-xs text-gray-400">
            <span>Sources</span>
            <ChevronRight className="h-3 w-3" />
            <ExternalLink className="h-3 w-3" />
          </div>
        </div>
      </div>

      <div className="mt-12 w-full max-w-3xl rounded-full border border-gray-200 bg-white px-4 py-3 text-sm text-gray-500 shadow-sm">
        Ask a follow up...
      </div>
    </div>
  )
}
