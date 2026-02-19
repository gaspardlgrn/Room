import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import CreateAgent from './CreateAgent'
import type { AgentConfig } from './CreateAgent'

const STORAGE_KEY = 'agents:list'

export default function AgentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [agent, setAgent] = useState<AgentConfig | null>(undefined)

  useEffect(() => {
    if (!id) {
      navigate('/agents')
      return
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      const list: AgentConfig[] = raw ? JSON.parse(raw) : []
      const found = list.find((a) => a.id === id)
      setAgent(found ?? null)
    } catch {
      setAgent(null)
    }
  }, [id, navigate])

  useEffect(() => {
    if (agent === null) {
      navigate('/agents')
    }
  }, [agent, navigate])

  if (agent === undefined) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-emerald-600" />
      </div>
    )
  }

  if (!agent) return null

  return <CreateAgent initialAgent={agent} />
}
