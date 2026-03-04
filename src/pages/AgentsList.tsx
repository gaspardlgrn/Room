import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bot, ChevronRight, Plus } from 'lucide-react'
import type { AgentConfig } from './CreateAgent'
import { ROOM_AI_AGENTS } from '@/lib/roomAgents'

const STORAGE_KEY = 'agents:list'

const recurrenceLabels: Record<AgentConfig['recurrence'], string> = {
  daily: 'Journalier',
  weekly: 'Hebdomadaire',
  monthly: 'Mensuel',
}

function formatSchedule(agent: AgentConfig): string {
  return `${recurrenceLabels[agent.recurrence]} à ${agent.time}`
}

export default function AgentsList() {
  const [agents, setAgents] = useState<AgentConfig[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      const list = raw ? (JSON.parse(raw) as AgentConfig[]) : []
      setAgents(list)
    } catch {
      setAgents([])
    }
  }, [])

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes agents</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gérez vos agents IA récurrents
          </p>
        </div>
        <Link
          to="/agents/create"
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" />
          Créer un agent
        </Link>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        {agents.length === 0 ? (
          <div className="rounded-lg border-dashed border-gray-200 py-12 text-center">
            <Bot className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-3 text-sm text-gray-500">Aucun agent créé</p>
            <Link
              to="/agents/create"
              className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700"
            >
              <Plus className="h-4 w-4" />
              Créer votre premier agent
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {agents.map((agent) => (
              <li key={agent.id}>
                <Link
                  to={`/agents/${agent.id}`}
                  className="flex items-center justify-between px-4 py-4 transition-colors hover:bg-gray-50"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-gray-900">{agent.name}</div>
                    <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-500">
                      <span>{formatSchedule(agent)}</span>
                      {agent.appSlugs.length > 0 && (
                        <span>· {agent.appSlugs.join(', ')}</span>
                      )}
                      {(agent.driveFolderPath ?? agent.driveFolderName) && (
                        <span>· {agent.driveFolderPath ?? agent.driveFolderName}</span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-gray-400" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          Agents IA Room
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Agents créés pour les recherches, la création de documents et l'affichage d'analyses
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {ROOM_AI_AGENTS.map((agent) => (
            <Link
              key={agent.id}
              to={`/agents/room/${agent.id}`}
              className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50/50 px-3 py-2.5 transition-colors hover:border-gray-200 hover:bg-gray-50"
            >
              <agent.icon className="mt-0.5 h-4 w-4 shrink-0 text-gray-500" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-gray-900">{agent.name}</div>
                <div className="text-xs text-gray-500">{agent.description}</div>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
