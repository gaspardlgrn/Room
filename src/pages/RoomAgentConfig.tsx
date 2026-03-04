import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import {
  ROOM_AI_AGENTS,
  getRoomAgentPrompt,
  setRoomAgentPrompt,
  type RoomAgentId,
} from '@/lib/roomAgents'

const VALID_IDS = new Set(ROOM_AI_AGENTS.map((a) => a.id))

export default function RoomAgentConfig() {
  const { agentId } = useParams<{ agentId: string }>()
  const navigate = useNavigate()
  const [additionalPrompt, setAdditionalPrompt] = useState('')
  const [saved, setSaved] = useState(false)

  const agent = agentId && VALID_IDS.has(agentId as RoomAgentId)
    ? ROOM_AI_AGENTS.find((a) => a.id === agentId)
    : null

  useEffect(() => {
    if (!agent) {
      navigate('/agents')
      return
    }
    setAdditionalPrompt(getRoomAgentPrompt(agent.id))
  }, [agent, navigate])

  const handleSave = () => {
    if (!agent) return
    setRoomAgentPrompt(agent.id, additionalPrompt)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (!agent) return null

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link
          to="/agents"
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Link>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <agent.icon className="mt-0.5 h-8 w-8 shrink-0 text-emerald-600" />
          <div>
            <h1 className="text-xl font-bold text-gray-900">{agent.name}</h1>
            <p className="mt-1 text-sm text-gray-500">{agent.description}</p>
          </div>
        </div>

        <div className="mt-6">
          <label
            htmlFor="additional-prompt"
            className="block text-sm font-medium text-gray-700"
          >
            Prompt supplémentaire
          </label>
          <p className="mt-0.5 text-xs text-gray-500">
            Instructions additionnelles prises en compte si ce champ est rempli
          </p>
          <textarea
            id="additional-prompt"
            value={additionalPrompt}
            onChange={(e) => setAdditionalPrompt(e.target.value)}
            onBlur={handleSave}
            rows={6}
            placeholder="Ex: Toujours citer les sources en français. Privilégier les données les plus récentes."
            className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            <Save className="h-4 w-4" />
            Enregistrer
          </button>
          {saved && (
            <span className="text-sm text-emerald-600">Enregistré</span>
          )}
        </div>
      </div>
    </div>
  )
}
