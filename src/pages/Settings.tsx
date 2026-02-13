import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { RefreshCw } from 'lucide-react'

export default function Settings() {
  const [searchParams] = useSearchParams()
  const [composioState, setComposioState] = useState<{
    loading: boolean
    error?: string
    toolkits: Array<{
      name?: string
      slug?: string
      description?: string
      categories?: string[]
      category?: string
      meta?: {
        logo?: string
        app_url?: string
        categories?: Array<{ name?: string }>
      }
    }>
    connectedSlugs: Set<string>
  }>({ loading: true, toolkits: [], connectedSlugs: new Set() })
  const [composioSearch, setComposioSearch] = useState('')
  const [ragSync, setRagSync] = useState<{ loading: boolean; message?: string }>({ loading: false })
  const composioMessage = useMemo(() => {
    const statusParam = searchParams.get('composio')
    const toolkitParam = searchParams.get('toolkit')
    if (!statusParam) {
      return null
    }
    if (statusParam === 'connected') {
      return {
        type: 'success',
        text: toolkitParam
          ? `Application connectée: ${toolkitParam}`
          : 'Application connectée.',
      }
    }
    if (statusParam === 'error') {
      return { type: 'error', text: 'Erreur lors de la connexion Composio.' }
    }
    return null
  }, [searchParams])

  const loadComposioToolkits = useCallback(async (query: string) => {
    setComposioState((prev) => ({ ...prev, loading: true, error: undefined }))
    try {
      const params = new URLSearchParams()
      if (query) {
        params.set('search', query)
      }
      const response = await fetch(`/api/composio/toolkits?${params.toString()}`)
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.error || 'Impossible de charger les applications.')
      }
      setComposioState((prev) => ({
        ...prev,
        loading: false,
        toolkits: Array.isArray(data?.items) ? data.items : [],
      }))
    } catch (error) {
      setComposioState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Erreur Composio.',
      }))
    }
  }, [])

  const loadComposioConnections = useCallback(async () => {
    try {
      const response = await fetch('/api/composio/connected-accounts')
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.error || 'Impossible de charger les connexions.')
      }
      const items = Array.isArray(data?.items) ? data.items : []
      const connected = new Set<string>()
      items.forEach((item: any) => {
        const slug =
          item?.toolkit?.slug ||
          item?.toolkit_slug ||
          item?.toolkit ||
          item?.toolkitSlug
        if (slug) {
          connected.add(String(slug))
        }
      })
      setComposioState((prev) => ({ ...prev, connectedSlugs: connected }))
    } catch (error) {
      setComposioState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erreur Composio.',
      }))
    }
  }, [])

  const handleRagSync = async () => {
    setRagSync({ loading: true })
    try {
      const res = await fetch('/api/rag/sync', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Erreur sync')
      setRagSync({ loading: false, message: data?.message || 'Documents indexés.' })
    } catch (e) {
      setRagSync({
        loading: false,
        message: e instanceof Error ? e.message : 'Erreur lors de la synchronisation.',
      })
    }
  }

  const handleComposioConnect = async (toolkitSlug?: string) => {
    if (!toolkitSlug) {
      return
    }
    try {
      const response = await fetch('/api/composio/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolkitSlug }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.error || 'Connexion impossible.')
      }
      if (data?.redirect_url) {
        window.location.assign(data.redirect_url)
      }
    } catch (error) {
      setComposioState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erreur Composio.',
      }))
    }
  }

  const sanitizeDomain = (value: string) =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9.-]/g, '')
      .replace(/^\.+|\.+$/g, '')

  const DOMAIN_OVERRIDES: Record<string, string> = {
    bloomberg: 'bloomberg.com',
    capitaliq: 'spglobal.com',
    capiq: 'spglobal.com',
    crunchbase: 'crunchbase.com',
    dataroom: 'datasite.com',
    datasite: 'datasite.com',
    dealcloud: 'dealcloud.com',
    dropbox: 'dropbox.com',
    factset: 'factset.com',
    google: 'google.com',
    gmail: 'mail.google.com',
    googlecalendar: 'calendar.google.com',
    gcal: 'calendar.google.com',
    googledrive: 'drive.google.com',
    gdrive: 'drive.google.com',
    googledocs: 'docs.google.com',
    gdocs: 'docs.google.com',
    googlesheets: 'sheets.google.com',
    gsheets: 'sheets.google.com',
    googleslides: 'slides.google.com',
    gslides: 'slides.google.com',
    googlemeet: 'meet.google.com',
    gmeet: 'meet.google.com',
    googlechat: 'chat.google.com',
    gchat: 'chat.google.com',
    googleads: 'ads.google.com',
    google_analytics: 'analytics.google.com',
    googleanalytics: 'analytics.google.com',
    google_maps: 'www.google.com',
    googlemaps: 'www.google.com',
    googlebigquery: 'cloud.google.com',
    googletasks: 'tasks.google.com',
    googlephotos: 'photos.google.com',
    googlesuper: 'www.google.com',
    gemini: 'ai.google.dev',
    hubspot: 'hubspot.com',
    interlinks: 'interlinks.com',
    linkedin: 'linkedin.com',
    notion: 'notion.so',
    pitchbook: 'pitchbook.com',
    salesforce: 'salesforce.com',
    sharepoint: 'microsoft.com',
    slack: 'slack.com',
    teams: 'microsoft.com',
    zoom: 'zoom.us',
  }

  const buildLogoCandidates = (toolkit: {
    logo?: string
    icon?: string
    image?: string
    logo_url?: string
    icon_url?: string
    name?: string
    slug?: string
    meta?: { logo?: string; app_url?: string }
  }) => {
    const candidates = [
      toolkit.logo,
      toolkit.icon,
      toolkit.image,
      toolkit.logo_url,
      toolkit.icon_url,
      toolkit.meta?.logo,
    ].filter(Boolean) as string[]

    const slug = toolkit.slug ? sanitizeDomain(toolkit.slug) : ''
    const name = toolkit.name ? sanitizeDomain(toolkit.name) : ''
    const rawDomain = slug.includes('.') ? slug : name.includes('.') ? name : ''

    const domains = new Set<string>()
    const overrideDomain =
      (slug && DOMAIN_OVERRIDES[slug]) || (name && DOMAIN_OVERRIDES[name])
    if (overrideDomain) {
      domains.add(overrideDomain)
    }
    if (rawDomain) {
      domains.add(rawDomain)
    }
    if (toolkit.meta?.app_url) {
      try {
        const url = new URL(toolkit.meta.app_url)
        if (url.hostname) {
          domains.add(url.hostname)
        }
      } catch {
        // ignore invalid URLs
      }
    }
    if (slug && !slug.includes('.')) {
      domains.add(`${slug}.com`)
      domains.add(`${slug}.io`)
      domains.add(`${slug}.ai`)
    }
    if (name && !name.includes('.') && name !== slug) {
      domains.add(`${name}.com`)
      domains.add(`${name}.io`)
      domains.add(`${name}.ai`)
    }

    domains.forEach((domain) => {
      candidates.push(`https://logo.clearbit.com/${domain}`)
      candidates.push(`https://logo.clearbit.com/${domain}?size=64`)
      candidates.push(
        `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
      )
      candidates.push(`https://icons.duckduckgo.com/ip3/${domain}.ico`)
    })

    return Array.from(new Set(candidates))
  }

  const ToolkitLogo = ({ toolkit }: { toolkit: any }) => {
    const candidates = useMemo(() => buildLogoCandidates(toolkit), [toolkit])
    const [index, setIndex] = useState(0)
    const label = String(toolkit.name || toolkit.slug || 'App')
      .slice(0, 2)
      .toUpperCase()
    const src = candidates[index]

    if (!src) {
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-50 text-xs font-semibold text-gray-600">
          {label}
        </div>
      )
    }

    return (
      <img
        src={src}
        alt={toolkit.name || toolkit.slug || 'Application'}
        className="h-8 w-8 rounded-md bg-white object-contain"
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => setIndex((prev) => prev + 1)}
      />
    )
  }

  useEffect(() => {
    const handle = window.setTimeout(() => {
      void loadComposioToolkits(composioSearch)
    }, 250)
    return () => window.clearTimeout(handle)
  }, [composioSearch, loadComposioToolkits])

  useEffect(() => {
    void loadComposioConnections()
  }, [loadComposioConnections])

  useEffect(() => {
    if (searchParams.get('composio')) {
      void loadComposioConnections()
    }
  }, [loadComposioConnections, searchParams])

  const orderedToolkits = useMemo(() => {
    const list = [...composioState.toolkits]
    const connected = composioState.connectedSlugs
    list.sort((a, b) => {
      const slugA = a.slug || a.name
      const slugB = b.slug || b.name
      const aConnected = slugA ? connected.has(String(slugA)) : false
      const bConnected = slugB ? connected.has(String(slugB)) : false
      if (aConnected && !bConnected) return -1
      if (!aConnected && bConnected) return 1
      const nameA = (a.name || a.slug || '').toLowerCase()
      const nameB = (b.name || b.slug || '').toLowerCase()
      return nameA.localeCompare(nameB)
    })
    return list
  }, [composioState.toolkits, composioState.connectedSlugs])

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-black">Paramètres</h1>
      <section className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="text-xs font-semibold text-gray-800 uppercase tracking-wider">
              Applications professionnelles
            </div>
            <p className="text-sm text-gray-800">
              Connectez vos outils métiers (M&A, private equity, banque
              d'investissement) pour centraliser les données dans Room.
            </p>
          </div>
          <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
            Composio
          </span>
        </div>

        {composioMessage && (
          <div
            className={`rounded-md border px-4 py-3 text-sm ${
              composioMessage.type === 'success'
                ? 'border-green-200 bg-green-50 text-green-700'
                : 'border-red-200 bg-red-50 text-red-700'
            }`}
          >
            {composioMessage.text}
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <input
            type="text"
            value={composioSearch}
            onChange={(event) => setComposioSearch(event.target.value)}
            placeholder="Rechercher une application (CRM, data room, market data...)"
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500 sm:max-w-md"
          />
          <div className="flex items-center gap-2">
            {(composioState.connectedSlugs.has('googledrive') ||
              composioState.connectedSlugs.has('google_drive') ||
              composioState.connectedSlugs.has('onedrive') ||
              composioState.connectedSlugs.has('one_drive')) && (
              <button
                type="button"
                onClick={handleRagSync}
                disabled={ragSync.loading}
                className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-800 hover:bg-emerald-100 disabled:opacity-50"
              >
                {ragSync.loading ? 'Indexation...' : 'Synchroniser documents Drive'}
                <RefreshCw className={`h-4 w-4 ${ragSync.loading ? 'animate-spin' : ''}`} />
              </button>
            )}
            <button
              type="button"
              onClick={() => loadComposioToolkits(composioSearch)}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
            >
              Rafraîchir
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {ragSync.message && (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {ragSync.message}
          </div>
        )}

        {composioState.error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {composioState.error}
          </div>
        )}

        {composioState.loading && (
          <div className="text-sm text-gray-600">Chargement des applications...</div>
        )}

        {!composioState.loading && composioState.toolkits.length === 0 && (
          <div className="text-sm text-gray-600">Aucune application trouvée.</div>
        )}

        {composioState.toolkits.length > 0 && (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {orderedToolkits.map((toolkit) => {
              const slug = toolkit.slug || toolkit.name
              const isConnected = slug
                ? composioState.connectedSlugs.has(String(slug))
                : false
              return (
                <div
                  key={slug}
                  className="rounded-md border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <ToolkitLogo toolkit={toolkit} />
                        <div className="font-semibold text-black">
                          {toolkit.name || toolkit.slug || 'Application'}
                        </div>
                      </div>
                      <div className="text-xs text-gray-600">
                        {toolkit.description || 'Intégration professionnelle'}
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                        {(toolkit.meta?.categories || [])
                          .map((category) => category.name)
                          .filter(Boolean)
                          .slice(0, 3)
                          .map((category) => (
                            <span
                              key={category}
                              className="rounded-full border border-gray-200 px-2 py-0.5"
                            >
                              {category}
                            </span>
                          ))}
                        {!toolkit.meta?.categories?.length && toolkit.category && (
                          <span className="rounded-full border border-gray-200 px-2 py-0.5">
                            {toolkit.category}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          isConnected
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {isConnected ? 'Connecté' : 'Non connecté'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleComposioConnect(String(slug))}
                        disabled={!slug}
                        className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                          isConnected
                            ? 'border border-green-200 text-green-700'
                            : 'border border-gray-200 text-gray-800 hover:bg-gray-50'
                        }`}
                      >
                        {isConnected ? 'Reconnecter' : 'Connecter'}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
