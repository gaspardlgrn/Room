import type { LucideIcon } from 'lucide-react'
import { Bot, FileText, Sparkles } from 'lucide-react'

export type RoomAgentId =
  | 'intent_router'
  | 'market_analysis'
  | 'company_analysis'
  | 'ic_memo'
  | 'info_memo'
  | 'exit_analysis'
  | 'valuation_comps'
  | 'general'
  | 'doc_generation'
  | 'expert_call'
  | 'meeting_note'

export type RoomAgent = {
  id: RoomAgentId
  name: string
  description: string
  icon: LucideIcon
}

export const ROOM_AI_AGENTS: readonly RoomAgent[] = [
  { id: 'intent_router', name: "Routeur d'intent", description: "Classifie la demande pour router vers le bon agent spécialisé", icon: Sparkles },
  { id: 'market_analysis', name: 'Analyse de marché', description: 'Contexte, TAM/SAM/SOM, tendances, concurrence, risques', icon: Bot },
  { id: 'company_analysis', name: "Analyse d'entreprise", description: 'Description, positionnement, KPIs, finances, moat', icon: Bot },
  { id: 'ic_memo', name: 'IC Memo', description: 'Executive Summary, Thesis, Marche, Produit, Traction, Deal Terms', icon: FileText },
  { id: 'info_memo', name: 'Info Memo', description: 'Résumé, Contexte, Société, Marche, Traction, Projections', icon: FileText },
  { id: 'exit_analysis', name: 'Analyse de sortie', description: 'Options de sortie, acquéreurs, comparables, multiples', icon: Bot },
  { id: 'valuation_comps', name: 'Comparables', description: 'Tableau de multiples EV/Revenue, EV/EBITDA, P/E', icon: FileText },
  { id: 'general', name: 'Réponse générale', description: 'Adapte la structure à la demande', icon: Bot },
  { id: 'doc_generation', name: 'Génération de documents', description: "Crée docx, pptx ou xlsx à partir d'un prompt", icon: FileText },
  { id: 'expert_call', name: 'Analyse de call expert', description: "Synthèse et insights à partir d'une transcription", icon: FileText },
  { id: 'meeting_note', name: 'Note de réunion', description: "Structuration d'une transcription en note de réunion", icon: FileText },
] as const

const STORAGE_KEY = 'agents:room-prompts'

export type RoomAgentPrompts = Partial<Record<RoomAgentId, string>>

export function getRoomAgentPrompts(): RoomAgentPrompts {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as RoomAgentPrompts
    return typeof parsed === 'object' && parsed !== null ? parsed : {}
  } catch {
    return {}
  }
}

export function setRoomAgentPrompt(agentId: RoomAgentId, prompt: string): void {
  const current = getRoomAgentPrompts()
  if (prompt.trim()) {
    current[agentId] = prompt.trim()
  } else {
    delete current[agentId]
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(current))
}

export function getRoomAgentPrompt(agentId: RoomAgentId): string {
  return getRoomAgentPrompts()[agentId] ?? ''
}

const PREFERRED_AGENT_KEY = 'chat:preferred-agent'

/** Agent préféré pour identifier le besoin (sidebar/home). '' = automatique. */
export function getPreferredAgent(): RoomAgentId | '' {
  try {
    const raw = localStorage.getItem(PREFERRED_AGENT_KEY)
    if (!raw) return ''
    const id = raw as RoomAgentId
    return ROOM_AI_AGENTS.some((a) => a.id === id) ? id : ''
  } catch {
    return ''
  }
}

export function setPreferredAgent(agentId: RoomAgentId | ''): void {
  if (agentId) {
    localStorage.setItem(PREFERRED_AGENT_KEY, agentId)
  } else {
    localStorage.removeItem(PREFERRED_AGENT_KEY)
  }
}

/** Agents pertinents pour la barre de recherche (chat + documents). */
export const SEARCH_AGENTS = ROOM_AI_AGENTS.filter(
  (a) =>
    a.id !== 'intent_router' &&
    a.id !== 'expert_call' &&
    a.id !== 'meeting_note'
)
