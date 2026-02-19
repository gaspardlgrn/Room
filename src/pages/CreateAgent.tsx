import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import { Bot, Calendar, ChevronDown, FolderOpen, Sparkles } from 'lucide-react'

const STORAGE_KEY = 'agents:list'

export type AgentConfig = {
  id: string
  name: string
  prompt: string
  appSlugs: string[]
  driveFolderId: string | null
  driveFolderName: string | null
  recurrence: 'daily' | 'weekly' | 'monthly'
  time: string // HH:mm
  createdAt: string
}

type DriveFolder = { id: string; name: string; accountId: string }

async function parseJsonResponse(res: Response): Promise<Record<string, unknown>> {
  const text = await res.text()
  try {
    return (text ? JSON.parse(text) : {}) as Record<string, unknown>
  } catch {
    return { error: text || 'Erreur serveur' }
  }
}

export default function CreateAgent() {
  const { getToken } = useAuth()
  const navigate = useNavigate()
  const [prompt, setPrompt] = useState('')
  const [selectedApps, setSelectedApps] = useState<Set<string>>(new Set())
  const [selectedFolder, setSelectedFolder] = useState<{ id: string; name: string } | null>(null)
  const [recurrence, setRecurrence] = useState<AgentConfig['recurrence']>('daily')
  const [time, setTime] = useState('09:00')
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const [connectedAccounts, setConnectedAccounts] = useState<
    Array<{ id: string; slug: string; name?: string }>
  >([])
  const [folders, setFolders] = useState<DriveFolder[]>([])
  const [foldersLoading, setFoldersLoading] = useState(false)
  const [parentId, setParentId] = useState('root')
  const [folderPath, setFolderPath] = useState<{ id: string; name: string }[]>([])

  const loadConnectedAccounts = useCallback(async () => {
    try {
      const token = await getToken()
      const res = await fetch('/api/composio/connected-accounts', {
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })
      const data = await parseJsonResponse(res)
      if (!res.ok) throw new Error(String(data?.error || 'Erreur'))
      const items = Array.isArray(data?.items) ? data.items : []
      const accounts = items
        .map((item: any) => {
          const slug =
            item?.toolkit?.slug || item?.toolkit_slug || item?.toolkit || item?.slug
          const id = item?.id ?? item?.connected_account_id
          return slug && id ? { id, slug: String(slug), name: item?.toolkit?.name } : null
        })
        .filter(Boolean) as { id: string; slug: string; name?: string }[]
      setConnectedAccounts(accounts)
    } catch {
      setConnectedAccounts([])
    }
  }, [getToken])

  const loadFolders = useCallback(
    async (parent: string) => {
      setFoldersLoading(true)
      try {
        const token = await getToken()
        const res = await fetch(
          `/api/drive/folders?parentId=${encodeURIComponent(parent)}`,
          {
            credentials: 'include',
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          }
        )
        const data = await parseJsonResponse(res)
        if (!res.ok) throw new Error(String(data?.error || 'Erreur'))
        const list = Array.isArray(data?.folders) ? data.folders : []
        setFolders(list)
      } catch {
        setFolders([])
      } finally {
        setFoldersLoading(false)
      }
    },
    [getToken]
  )

  useEffect(() => {
    void loadConnectedAccounts()
  }, [loadConnectedAccounts])

  useEffect(() => {
    void loadFolders(parentId)
  }, [parentId, loadFolders])

  const toggleApp = (slug: string) => {
    setSelectedApps((prev) => {
      const next = new Set(prev)
      if (next.has(slug)) next.delete(slug)
      else next.add(slug)
      return next
    })
  }

  const selectFolder = (folder: DriveFolder) => {
    setSelectedFolder({ id: folder.id, name: folder.name })
  }

  const drillIntoFolder = (folder: DriveFolder) => {
    setParentId(folder.id)
    setFolderPath((prev) => [...prev, { id: folder.id, name: folder.name }])
    setSelectedFolder(null)
  }

  const goUpFolder = () => {
    const next = folderPath.slice(0, -1)
    setFolderPath(next)
    setParentId(next.length > 0 ? next[next.length - 1].id : 'root')
    setSelectedFolder(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim()) {
      setSubmitStatus('error')
      return
    }
    setSubmitStatus('loading')
    try {
      const agent: AgentConfig = {
        id: crypto.randomUUID(),
        name: prompt.trim().slice(0, 60) || 'Agent',
        prompt: prompt.trim(),
        appSlugs: Array.from(selectedApps),
        driveFolderId: selectedFolder?.id ?? null,
        driveFolderName: selectedFolder?.name ?? null,
        recurrence,
        time,
        createdAt: new Date().toISOString(),
      }
      const raw = localStorage.getItem(STORAGE_KEY)
      const list: AgentConfig[] = raw ? (JSON.parse(raw) as AgentConfig[]) : []
      list.unshift(agent)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
      setSubmitStatus('success')
      navigate('/tasks')
    } catch {
      setSubmitStatus('error')
    }
  }

  const recurrenceLabels: Record<AgentConfig['recurrence'], string> = {
    daily: 'Journalier',
    weekly: 'Hebdomadaire',
    monthly: 'Mensuel',
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Créer un agent IA</h1>
        <p className="mt-1 text-sm text-gray-500">
          Configurez un agent avec un prompt précis, des applications et un dossier Drive.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
            <Sparkles className="h-4 w-4 text-emerald-600" />
            Prompt de l'agent
          </div>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ex: Analyse les emails de la semaine et rédige un résumé des opportunités d'investissement mentionnées..."
            rows={5}
            className="mt-3 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            required
          />
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
            <Bot className="h-4 w-4 text-emerald-600" />
            Applications accessibles
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Sélectionnez les apps auxquelles l'agent aura accès (connectez-les dans Paramètres si besoin).
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {connectedAccounts.length === 0 ? (
              <p className="text-sm text-gray-500">
                Aucune app connectée. Allez dans Paramètres pour connecter Gmail, Drive, etc.
              </p>
            ) : (
              connectedAccounts.map((acc) => (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => toggleApp(acc.slug)}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                    selectedApps.has(acc.slug)
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {acc.name || acc.slug}
                  {selectedApps.has(acc.slug) && ' ✓'}
                </button>
              ))
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
            <FolderOpen className="h-4 w-4 text-emerald-600" />
            Dossier Drive
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Choisissez le dossier auquel l'agent peut accéder (Google Drive connecté requis).
          </p>
          <div className="mt-3 space-y-2">
            {folderPath.length > 0 && (
              <button
                type="button"
                onClick={goUpFolder}
                className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900"
              >
                <ChevronDown className="h-3 w-3 rotate-90" />
                Retour : {folderPath.length >= 2 ? folderPath[folderPath.length - 2].name : 'Racine'}
              </button>
            )}
            {foldersLoading ? (
              <p className="text-sm text-gray-500">Chargement des dossiers...</p>
            ) : folders.length === 0 && parentId === 'root' ? (
              <p className="text-sm text-gray-500">
                Aucun dossier trouvé. Connectez Google Drive dans Paramètres.
              </p>
            ) : (
              <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-gray-200 p-2">
                {folders.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-gray-50"
                  >
                    <button
                      type="button"
                      onClick={() => selectFolder(f)}
                      className={`flex-1 text-left text-sm ${
                        selectedFolder?.id === f.id ? 'font-medium text-emerald-700' : 'text-gray-700'
                      }`}
                    >
                      {f.name}
                      {selectedFolder?.id === f.id && ' ✓'}
                    </button>
                    <button
                      type="button"
                      onClick={() => drillIntoFolder(f)}
                      className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-700"
                      title="Ouvrir le dossier"
                    >
                      <ChevronDown className="h-4 w-4 -rotate-90" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {selectedFolder && (
              <p className="text-xs text-gray-600">
                Dossier sélectionné : <strong>{selectedFolder.name}</strong>
              </p>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
            <Calendar className="h-4 w-4 text-emerald-600" />
            Récurrence et horaire
          </div>
          <div className="mt-3 flex flex-wrap gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500">Fréquence</label>
              <select
                value={recurrence}
                onChange={(e) => setRecurrence(e.target.value as AgentConfig['recurrence'])}
                className="mt-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {(['daily', 'weekly', 'monthly'] as const).map((r) => (
                  <option key={r} value={r}>
                    {recurrenceLabels[r]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500">Heure</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="mt-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </section>

        {submitStatus === 'success' && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Agent créé. Redirection vers les tâches...
          </div>
        )}
        {submitStatus === 'error' && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Erreur lors de la création. Vérifiez le prompt.
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/tasks')}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={submitStatus === 'loading' || !prompt.trim()}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {submitStatus === 'loading' ? 'Création...' : 'Créer l\'agent'}
          </button>
        </div>
      </form>
    </div>
  )
}
