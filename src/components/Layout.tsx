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
  Plus,
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
  const userEmail = user?.primaryEmailAddress?.emailAddress?.toLowerCase() ?? ''
  const isAdminUser = userEmail === 'gaspard@getroom.io'

  const navigation = [
    { name: 'New Chat', href: '/dashboard', icon: Plus },
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

  useEffect(() => {
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
  }, [])

  useEffect(() => {
    try {
      window.localStorage.setItem('history:items', JSON.stringify(historyItems))
    } catch {
      // ignore storage errors
    }
  }, [historyItems])

  const isActive = (path: string) => location.pathname === path
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
          <div className="flex h-14 items-center px-4 text-xl font-semibold text-gray-900">
            <span className={sidebarCollapsed ? 'text-lg' : ''}>
              {sidebarCollapsed ? 'r' : 'rogo'}
            </span>
          </div>
          {/* Ancien bouton New Chat au-dessus du menu supprimé : l'entrée est désormais dans la liste principale */}
          <nav className="px-3 py-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                title={item.name}
                className={`flex items-center rounded-lg px-3 py-2 text-sm text-gray-700 transition ${
                  isActive(item.href)
                    ? 'bg-gray-100 text-gray-900'
                    : 'bg-white'
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
          <div className="mt-auto px-3 py-4">
            <div className="flex flex-col gap-2">
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
              <button
                type="button"
                className={`flex items-center rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 ${
                  sidebarCollapsed ? 'justify-center' : 'gap-2'
                }`}
                title="Settings"
              >
                <Settings className="h-5 w-5 text-gray-700" />
                {!sidebarCollapsed ? 'Settings' : null}
              </button>
              <SignOutButton redirectUrl="/login">
                <button
                  type="button"
                  className={`flex items-center rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 ${
                    sidebarCollapsed ? 'justify-center' : 'gap-2'
                  }`}
                  aria-label="Déconnexion"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5 text-gray-700" />
                  {!sidebarCollapsed ? 'Logout' : null}
                </button>
              </SignOutButton>
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
