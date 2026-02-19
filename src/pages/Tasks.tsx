import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bot, ChevronRight, Plus } from 'lucide-react'
import type { AgentConfig } from './CreateAgent'

const STORAGE_KEY = 'agents:list'

const recurrenceLabels: Record<AgentConfig['recurrence'], string> = {
  daily: 'Journalier',
  weekly: 'Hebdomadaire',
  monthly: 'Mensuel',
}

function formatSchedule(agent: AgentConfig): string {
  return `${recurrenceLabels[agent.recurrence]} à ${agent.time}`
}

export default function Tasks() {
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Agents et tâches planifiées</h1>
          <p className="text-sm text-gray-500">
            Créez des agents IA récurrents pour automatiser vos recherches et analyses
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/agents"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Gérer les agents
          </Link>
          <Link
            to="/agents/create"
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" />
            Créer un agent
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          Mes agents
        </div>
        {agents.length === 0 ? (
          <div className="mt-4 rounded-lg border border-dashed border-gray-200 py-8 text-center">
            <Bot className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-2 text-sm text-gray-500">Aucun agent créé</p>
            <Link
              to="/agents/create"
              className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700"
            >
              <Plus className="h-4 w-4" />
              Créer votre premier agent
            </Link>
          </div>
        ) : (
          <div className="mt-3 divide-y divide-gray-100">
            {agents.map((agent) => (
              <Link
                key={agent.id}
                to={`/agents/${agent.id}`}
                className="flex items-center justify-between py-3 transition-colors hover:bg-gray-50"
              >
                <div>
                  <div className="text-sm font-medium text-gray-900">{agent.name}</div>
                  <div className="mt-0.5 text-xs text-gray-500">
                    {formatSchedule(agent)}
                    {agent.appSlugs.length > 0 && (
                      <> · Apps: {agent.appSlugs.join(', ')}</>
                    )}
                    {(agent.driveFolderPath ?? agent.driveFolderName) && (
                      <> · Dossier: {agent.driveFolderPath ?? agent.driveFolderName}</>
                    )}
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-gray-400" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
