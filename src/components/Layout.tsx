import { useEffect, useMemo, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import {
  CalendarClock,
  FileText,
  HelpCircle,
  History,
  Home,
  LayoutGrid,
  LogOut,
  Search,
  Settings,
  Shield,
  Sparkles,
} from 'lucide-react'
import { SignOutButton, useUser } from '@clerk/clerk-react'
import { RecentDocumentsProvider } from '@/state/recentDocuments'

function LayoutContent() {
  const location = useLocation()
  const { user } = useUser()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [activeNavItem, setActiveNavItem] = useState<string | null>(null)
  const userEmail = user?.primaryEmailAddress?.emailAddress?.toLowerCase() ?? ''
  const isAdminUser = userEmail === 'gaspard@getroom.io'

  const navigation = [
    { name: 'Home', href: '/dashboard', icon: Home },
    { name: 'Incognito File Chat', href: '/research', icon: FileText },
    { name: 'Tables', href: '/dashboard', icon: LayoutGrid },
    { name: 'Scheduled Tasks', href: '/tasks', icon: CalendarClock },
    { name: 'Shortcuts', href: '/settings', icon: Sparkles },
    { name: 'History', href: '/history/1', icon: History },
    ...(isAdminUser ? [{ name: 'Admin', href: '/admin', icon: Shield }] : []),
  ]
  const defaultHistoryItems = [
    { id: 1, label: 'Create comps table for FDS' },
    { id: 2, label: "Google's AI initiatives and ad" },
    { id: 3, label: "Today's news summary" },
    { id: 4, label: "CFO MAP's salary and comp" },
    { id: 5, label: 'Request to proofread attached' },
    { id: 6, label: 'Create a proofreading prompt' },
  ]
  const [historyItems, setHistoryItems] = useState(defaultHistoryItems)

  const loadHistoryItems = () => {
    try {
      const raw = window.localStorage.getItem('history:items')
      if (raw) {
        const parsed = JSON.parse(raw) as typeof defaultHistoryItems
        if (Array.isArray(parsed)) {
          setHistoryItems(parsed)
        }
      }
    } catch {
      // ignore storage errors
    }
  }

  useEffect(() => {
    loadHistoryItems()
  }, [])

  // Recharger les history items quand on navigue (pour détecter les nouvelles conversations)
  useEffect(() => {
    loadHistoryItems()
  }, [location.pathname])

  useEffect(() => {
    try {
      window.localStorage.setItem('history:items', JSON.stringify(historyItems))
    } catch {
      // ignore storage errors
    }
  }, [historyItems])

  // Initialiser l'état actif basé sur le pathname actuel
  useEffect(() => {
    if (location.pathname === '/dashboard') {
      // Si on est sur /dashboard et qu'aucun élément n'est encore sélectionné, mettre "Home" par défaut
      if (activeNavItem === null) {
        setActiveNavItem('Home')
      }
    } else {
      // Pour les autres routes, trouver l'élément correspondant
      const matchingItem = navigation.find((item) => location.pathname === item.href)
      if (matchingItem) {
        setActiveNavItem(matchingItem.name)
      }
    }
  }, [location.pathname])

  const isActiveItem = (item: { name: string; href: string }) => {
    // Si on est sur /dashboard, utiliser l'état local pour déterminer quel élément est actif
    if (location.pathname === '/dashboard') {
      return activeNavItem === item.name
    }
    // Pour les autres routes, utiliser le pathname
    return location.pathname === item.href
  }
  const sidebarWidth = useMemo(
    () => (sidebarCollapsed ? '4rem' : '16rem'),
    [sidebarCollapsed]
  )

  return (
    <div
      className="min-h-screen bg-white"
      style={{ ['--sidebar-width' as string]: sidebarWidth }}
    >
      <div className="flex">
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex h-full w-64 flex-col border-r border-gray-200 bg-white transition-transform lg:w-[var(--sidebar-width)] lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          onMouseEnter={() => setSidebarCollapsed(false)}
          onMouseLeave={() => setSidebarCollapsed(true)}
        >
          <div className="flex h-14 shrink-0 items-center px-4 text-xl font-semibold text-gray-900">
            <span className={sidebarCollapsed ? 'text-lg' : ''}>
              {sidebarCollapsed ? 'r' : 'rogo'}
            </span>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto pb-28">
          {/* Ancien bouton New Chat au-dessus du menu supprimé : l'entrée est désormais dans la liste principale */}
          <nav className="px-3 py-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                title={item.name}
                onClick={() => setActiveNavItem(item.name)}
                className={`flex items-center rounded-lg px-3 py-2 text-sm text-gray-700 transition ${
                  isActiveItem(item)
                    ? 'bg-gray-100 text-gray-900'
                    : 'bg-white hover:bg-white'
                } ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}
              >
                <item.icon className="h-5 w-5 text-gray-700" />
                {!sidebarCollapsed ? item.name : null}
              </Link>
            ))}
          </nav>
          {!sidebarCollapsed ? (
            <div className="px-3 py-2">
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                History
              </div>
              <div className="mt-2">
                <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-500">
                  <Search className="h-3 w-3 text-gray-400" />
                  <input
                    className="w-full bg-transparent text-xs text-gray-600 outline-none placeholder:text-gray-400"
                    placeholder="Search"
                  />
                </div>
              </div>
              <div className="mt-3 space-y-2 text-sm text-gray-600">
                {historyItems.map((item) => {
                  const href = `/history/${item.id}`
                  const active = location.pathname === href
                return (
                  <div
                    key={item.id}
                    className={`group flex items-center justify-between gap-2 rounded-md px-2 py-1 ${
                      active ? 'bg-gray-100 text-gray-900' : 'hover:bg-gray-50'
                    }`}
                  >
                    <Link to={href} className="truncate">
                      {item.label}
                    </Link>
                    <button
                      type="button"
                      onClick={() =>
                        setHistoryItems((prev) =>
                          prev.filter((entry) => entry.id !== item.id)
                        )
                      }
                      className="hidden text-xs text-gray-400 hover:text-gray-600 group-hover:block"
                      aria-label="Supprimer de l'historique"
                    >
                      ×
                    </button>
                  </div>
                )
                })}
                <button className="flex items-center gap-2 px-2 text-xs text-gray-500">
                  View all →
                </button>
              </div>
            </div>
          ) : null}
          </div>

          {/* Barre fixe en bas : Support + Profil, figée au-dessus de la ligne d'horizon */}
          <div
              className="fixed bottom-0 left-0 z-50 flex w-[var(--sidebar-width)] flex-col gap-2 border-t border-gray-200 bg-white px-3 py-4 shadow-[0_-2px_10px_rgba(0,0,0,0.04)]"
              aria-label="Support et profil"
            >
              <button
                type="button"
                className={`flex items-center rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 ${
                  sidebarCollapsed ? 'justify-center' : 'gap-2'
                }`}
                title="Help & Support"
              >
                <HelpCircle className="h-5 w-5 text-gray-700" />
                {!sidebarCollapsed ? 'Help & Support' : null}
              </button>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileMenuOpen((o) => !o)}
                  className={`flex w-full items-center gap-2 text-sm ${
                    sidebarCollapsed ? 'justify-center px-0 py-0' : 'rounded-lg border border-gray-200 px-3 py-2 text-gray-700 hover:bg-gray-50'
                  }`}
                  title="Profil"
                  aria-expanded={profileMenuOpen}
                  aria-haspopup="true"
                >
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-gray-700 text-xs font-medium text-white"
                    aria-hidden
                  >
                    {user?.firstName || user?.lastName
                      ? [user.firstName?.[0], user.lastName?.[0]]
                          .filter(Boolean)
                          .join('')
                          .toUpperCase()
                          .slice(0, 2) || '?'
                      : user?.primaryEmailAddress?.emailAddress?.[0]?.toUpperCase() ?? '?'}
                  </span>
                  {!sidebarCollapsed ? (
                    <span className="min-w-0 truncate text-left">
                      {user?.firstName || user?.lastName
                        ? [user.firstName, user.lastName].filter(Boolean).join(' ')
                        : user?.primaryEmailAddress?.emailAddress ?? 'Profil'}
                    </span>
                  ) : null}
                </button>
                {profileMenuOpen ? (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      aria-hidden
                      onClick={() => setProfileMenuOpen(false)}
                    />
                    <div
                      className="absolute bottom-full left-0 mb-1 w-full min-w-[180px] rounded-lg border border-gray-200 bg-white py-1 shadow-lg z-50"
                      role="menu"
                    >
                      <Link
                        to="/settings"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        role="menuitem"
                      >
                        <Settings className="h-4 w-4 text-gray-500" />
                        Paramètres
                      </Link>
                      <SignOutButton redirectUrl="/login">
                        <button
                          type="button"
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                          role="menuitem"
                          onClick={() => setProfileMenuOpen(false)}
                        >
                          <LogOut className="h-4 w-4 text-gray-500" />
                          Déconnexion
                        </button>
                      </SignOutButton>
                    </div>
                  </>
                ) : null}
              </div>
            </div>
        </aside>

        <div
          className="flex-1 lg:ml-[var(--sidebar-width)]"
          onClick={() => setSidebarCollapsed(true)}
        >
          <main className="px-6 py-8">
            <Outlet />
          </main>
        </div>
      </div>

      {sidebarOpen ? (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}
    </div>
  )
}

export default function Layout() {
  return (
    <RecentDocumentsProvider>
      <LayoutContent />
    </RecentDocumentsProvider>
  )
}
