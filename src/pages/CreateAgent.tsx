import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import { Bot, Calendar, ChevronRight, FolderOpen, Sparkles, X } from 'lucide-react'

const STORAGE_KEY = 'agents:list'

const APP_LABELS: Record<string, string> = {
  googledrive: 'Google Drive',
  google_drive: 'Google Drive',
  gmail: 'Gmail',
  outlook: 'Outlook',
  microsoft_outlook: 'Outlook',
  googlesheets: 'Google Sheets',
  google_sheets: 'Google Sheets',
  onedrive: 'OneDrive',
  one_drive: 'OneDrive',
  notion: 'Notion',
  slack: 'Slack',
}

function getAppLabel(slug: string): string {
  return APP_LABELS[slug] ?? slug.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function getAppFavicon(slug: string): string {
  const domain =
    slug === 'googledrive' || slug === 'google_drive'
      ? 'drive.google.com'
      : slug === 'gmail'
        ? 'mail.google.com'
        : slug === 'googlesheets' || slug === 'google_sheets'
          ? 'sheets.google.com'
          : slug === 'onedrive' || slug === 'one_drive'
            ? 'onedrive.live.com'
            : slug === 'outlook' || slug === 'microsoft_outlook'
              ? 'outlook.com'
              : `${slug}.com`
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
}

export type AgentConfig = {
  id: string
  name: string
  prompt: string
  appSlugs: string[]
  driveFolderId: string | null
  driveFolderName: string | null
  driveFolderPath: string | null
  recurrence: 'daily' | 'weekly' | 'monthly'
  time: string
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
  const [selectedFolder, setSelectedFolder] = useState<{
    id: string
    name: string
    path: string
  } | null>(null)
  const [recurrence, setRecurrence] = useState<AgentConfig['recurrence']>('daily')
  const [time, setTime] = useState('09:00')
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const [connectedAccounts, setConnectedAccounts] = useState<
    Array<{ id: string; slug: string; name?: string }>
  >([])
  const [folderModalOpen, setFolderModalOpen] = useState(false)
  const [folders, setFolders] = useState<DriveFolder[]>([])
  const [foldersLoading, setFoldersLoading] = useState(false)
  const [parentId, setParentId] = useState('root')
  const [folderPath, setFolderPath] = useState<{ id: string; name: string }[]>([])
  const [expandedNodes, setExpandedNodes] = useState<Map<string, DriveFolder[]>>(new Map())
  const [loadingFolderId, setLoadingFolderId] = useState<string | null>(null)

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

  const loadFolderChildren = useCallback(
    async (folderId: string): Promise<DriveFolder[]> => {
      const token = await getToken()
      const res = await fetch(
        `/api/drive/folders?parentId=${encodeURIComponent(folderId)}`,
        {
          credentials: 'include',
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }
      )
      const data = await parseJsonResponse(res)
      if (!res.ok) return []
      return Array.isArray(data?.folders) ? data.folders : []
    },
    [getToken]
  )

  useEffect(() => {
    void loadConnectedAccounts()
  }, [loadConnectedAccounts])

  useEffect(() => {
    if (folderModalOpen) void loadFolders(parentId)
  }, [folderModalOpen, parentId, loadFolders])

  const toggleApp = (slug: string) => {
    setSelectedApps((prev) => {
      const next = new Set(prev)
      if (next.has(slug)) next.delete(slug)
      else next.add(slug)
      return next
    })
  }

  const openFolderModal = () => {
    setParentId('root')
    setFolderPath([])
    setExpandedNodes(new Map())
    setFolderModalOpen(true)
  }

  const selectFolderAndClose = (folder: DriveFolder, path: string) => {
    setSelectedFolder({ id: folder.id, name: folder.name, path })
    setFolderModalOpen(false)
  }

  const toggleExpand = async (folder: DriveFolder) => {
    if (expandedNodes.has(folder.id)) {
      setExpandedNodes((prev) => {
        const next = new Map(prev)
        next.delete(folder.id)
        return next
      })
      return
    }
    setLoadingFolderId(folder.id)
    try {
      const children = await loadFolderChildren(folder.id)
      setExpandedNodes((prev) => new Map(prev).set(folder.id, children))
    } finally {
      setLoadingFolderId(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim()) {
      setSubmitStatus('error')
      return
    }
    setSubmitStatus('loading')
    try {
      const fullPath = selectedFolder?.path ?? selectedFolder?.name ?? null
      const agent: AgentConfig = {
        id: crypto.randomUUID(),
        name: prompt.trim().slice(0, 60) || 'Agent',
        prompt: prompt.trim(),
        appSlugs: Array.from(selectedApps),
        driveFolderId: selectedFolder?.id ?? null,
        driveFolderName: selectedFolder?.name ?? null,
        driveFolderPath: fullPath,
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

  const buildPathString = (extra?: { name: string }) => {
    const parts = [...folderPath.map((p) => p.name)]
    if (extra) parts.push(extra.name)
    return parts.length > 0 ? parts.join(' / ') : 'Mon Drive'
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
        {/* Récurrence en premier */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
            <Calendar className="h-4 w-4 text-emerald-600" />
            Récurrence et horaire
          </div>
          <div className="mt-3 flex flex-wrap gap-6">
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

        {/* Applications - affichage amélioré avec logos */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
            <Bot className="h-4 w-4 text-emerald-600" />
            Applications accessibles
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Applications auxquelles vous êtes connecté. Sélectionnez celles auxquelles l'agent aura accès.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {connectedAccounts.length === 0 ? (
              <p className="col-span-full text-sm text-gray-500">
                Aucune app connectée. Allez dans Paramètres pour connecter Gmail, Drive, etc.
              </p>
            ) : (
              connectedAccounts.map((acc) => (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => toggleApp(acc.slug)}
                  className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                    selectedApps.has(acc.slug)
                      ? 'border-emerald-300 bg-emerald-50 shadow-sm'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <img
                    src={getAppFavicon(acc.slug)}
                    alt=""
                    className="h-9 w-9 shrink-0 rounded-lg bg-white object-contain p-1 shadow-sm"
                  />
                  <div className="min-w-0 flex-1">
                    <span
                      className={`block truncate text-sm font-medium ${
                        selectedApps.has(acc.slug) ? 'text-emerald-800' : 'text-gray-800'
                      }`}
                    >
                      {acc.name || getAppLabel(acc.slug)}
                    </span>
                    {selectedApps.has(acc.slug) && (
                      <span className="text-xs text-emerald-600">Sélectionné</span>
                    )}
                  </div>
                  {selectedApps.has(acc.slug) && (
                    <span className="shrink-0 text-emerald-600">✓</span>
                  )}
                </button>
              ))
            )}
          </div>
        </section>

        {/* Dossier Drive - bouton qui ouvre la modale */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
            <FolderOpen className="h-4 w-4 text-emerald-600" />
            Dossier Drive
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Choisissez le dossier auquel l'agent peut accéder (Google Drive connecté requis).
          </p>
          <div className="mt-3">
            <button
              type="button"
              onClick={openFolderModal}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              <FolderOpen className="h-4 w-4 text-gray-500" />
              {selectedFolder ? selectedFolder.path || selectedFolder.name : 'Sélectionner le dossier'}
            </button>
            {selectedFolder && (
              <p className="mt-2 text-xs text-gray-600">
                Dossier sélectionné : <strong>{selectedFolder.path || selectedFolder.name}</strong>
              </p>
            )}
          </div>
        </section>

        {/* Modale arborescence Drive */}
        {folderModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={() => setFolderModalOpen(false)}
          >
            <div
              className="max-h-[80vh] w-full max-w-lg rounded-2xl border border-gray-200 bg-white shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                <h3 className="text-sm font-semibold text-gray-900">Sélectionner un dossier</h3>
                <button
                  type="button"
                  onClick={() => setFolderModalOpen(false)}
                  className="rounded-lg p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="max-h-96 overflow-y-auto p-4">
                <div className="text-xs font-medium text-gray-500 mb-2">
                  {buildPathString()}
                </div>
                {foldersLoading ? (
                  <p className="py-8 text-center text-sm text-gray-500">Chargement...</p>
                ) : folders.length === 0 && parentId === 'root' ? (
                  <p className="py-8 text-center text-sm text-gray-500">
                    Aucun dossier. Connectez Google Drive dans Paramètres.
                  </p>
                ) : (
                  <div className="space-y-0.5">
                    {parentId === 'root' && (
                      <div className="mb-2 flex items-center justify-between rounded-lg border border-emerald-100 bg-emerald-50/50 p-2">
                        <span className="text-sm font-medium text-gray-800">Mon Drive (racine)</span>
                        <button
                          type="button"
                          onClick={() =>
                            selectFolderAndClose(
                              { id: 'root', name: 'Mon Drive', accountId: '' },
                              'Mon Drive'
                            )
                          }
                          className="rounded bg-emerald-600 px-3 py-1 text-xs text-white hover:bg-emerald-700"
                        >
                          Sélectionner
                        </button>
                      </div>
                    )}
                    {folders.map((f) => {
                      const children = expandedNodes.get(f.id)
                      const isExpanded = expandedNodes.has(f.id)
                      const isLoading = loadingFolderId === f.id
                      return (
                        <div key={f.id} className="rounded-lg border border-gray-100">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => toggleExpand(f)}
                              disabled={isLoading}
                              className="flex h-8 w-8 shrink-0 items-center justify-center text-gray-400 hover:text-gray-600 disabled:opacity-50"
                            >
                              {isLoading ? (
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-emerald-600" />
                              ) : (
                                <ChevronRight
                                  className={`h-4 w-4 transition-transform ${
                                    isExpanded ? 'rotate-90' : ''
                                  }`}
                                />
                              )}
                            </button>
                            <div className="min-w-0 flex-1 py-2">
                              <span className="text-sm font-medium text-gray-800">{f.name}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                selectFolderAndClose(f, buildPathString({ name: f.name }))
                              }
                              className="shrink-0 rounded-md bg-emerald-600 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-700"
                            >
                              Sélectionner
                            </button>
                          </div>
                          {isExpanded && children && children.length > 0 && (
                            <div className="ml-6 border-l border-gray-200 pl-2">
                              {children.map((child) => (
                                <div
                                  key={child.id}
                                  className="flex items-center justify-between py-1.5"
                                >
                                  <span className="text-sm text-gray-700">{child.name}</span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      selectFolderAndClose(
                                        child,
                                        `${buildPathString({ name: f.name })} / ${child.name}`
                                      )
                                    }
                                    className="rounded bg-emerald-600 px-2 py-0.5 text-xs text-white hover:bg-emerald-700"
                                  >
                                    Sélectionner
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

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
            {submitStatus === 'loading' ? 'Création...' : "Créer l'agent"}
          </button>
        </div>
      </form>
    </div>
  )
}
