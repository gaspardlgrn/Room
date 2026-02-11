import { useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import {
  CalendarClock,
  FileText,
  HelpCircle,
  History,
  Home,
  LayoutGrid,
  LogOut,
  MessageSquarePlus,
  Search,
  Settings,
  Shield,
  Sparkles,
} from 'lucide-react'
import { SignOutButton, useUser } from '@clerk/clerk-react'
import { RecentDocumentsProvider } from '@/state/recentDocuments'

const pageMetaByPath: Record<
  string,
  { title: string; placeholder: string; actionLabel?: string }
> = {
  '/dashboard': {
    title: 'Tables',
    placeholder: 'What type of table would you like to create?',
    actionLabel: 'New Table',
  },
  '/research': {
    title: 'Research',
    placeholder: 'Ask a follow up...',
  },
  '/tasks': {
    title: 'Scheduled Tasks',
    placeholder: 'Search tasks...',
    actionLabel: 'New Task',
  },
  '/settings': {
    title: 'Settings',
    placeholder: 'Search settings...',
  },
  '/admin': {
    title: 'Admin',
    placeholder: 'Search users...',
  },
}

function LayoutContent() {
  const location = useLocation()
  const { user } = useUser()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const userEmail = user?.primaryEmailAddress?.emailAddress?.toLowerCase() ?? ''
  const isAdminUser = userEmail === 'gaspard@getroom.io'

  const navigation = [
    { name: 'Home', href: '/dashboard', icon: Home },
    { name: 'Incognito File Chat', href: '/research', icon: FileText },
    { name: 'Tables', href: '/dashboard', icon: LayoutGrid },
    { name: 'Scheduled Tasks', href: '/tasks', icon: CalendarClock },
    { name: 'Shortcuts', href: '/settings', icon: Sparkles },
    { name: 'History', href: '/dashboard', icon: History },
    ...(isAdminUser ? [{ name: 'Admin', href: '/admin', icon: Shield }] : []),
  ]

  const pageMeta =
    pageMetaByPath[location.pathname] ||
    pageMetaByPath[`/${location.pathname.split('/')[1]}`] || {
      title: 'Room',
      placeholder: 'Search...',
    }

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="min-h-screen bg-[#f8f8f6]">
      <div className="flex">
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-gray-200 bg-white transition-transform lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex h-14 items-center px-5 text-xl font-semibold text-gray-900">
            rogo
          </div>
          <div className="px-4 pb-2">
            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
            >
              <MessageSquarePlus className="h-4 w-4" />
              New Chat
            </button>
          </div>
          <nav className="px-3 py-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 transition ${
                  isActive(item.href)
                    ? 'bg-gray-100 text-gray-900'
                    : 'hover:bg-gray-50'
                }`}
              >
                <item.icon className="h-4 w-4 text-gray-500" />
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="px-3 py-2">
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              History
            </div>
            <div className="mt-2 space-y-2 text-sm text-gray-600">
              {[
                'Create comps table for FDS',
                "Google's AI initiatives and ad",
                "Today's news summary",
                "CFO MAP's salary and comp",
                'Request to proofread attached',
                'Create a proofreading prompt',
              ].map((item) => (
                <div key={item} className="truncate px-2">
                  {item}
                </div>
              ))}
              <button className="flex items-center gap-2 px-2 text-xs text-gray-500">
                View all →
              </button>
            </div>
          </div>
          <div className="mt-auto px-3 py-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <HelpCircle className="h-4 w-4" />
              Help & Support
            </div>
            <div className="mt-3 flex items-center gap-2">
              <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50">
                <Settings className="h-4 w-4" />
              </button>
              <SignOutButton redirectUrl="/login">
                <button
                  type="button"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
                  aria-label="Déconnexion"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </SignOutButton>
            </div>
          </div>
        </aside>

        <div className="flex-1 lg:ml-64">
          <div className="sticky top-0 z-40 border-b border-gray-200 bg-[#f8f8f6]/95 backdrop-blur">
            <div className="flex items-center gap-4 px-6 py-4">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-600 lg:hidden"
              >
                Menu
              </button>
              <div className="min-w-[120px] text-sm font-semibold text-gray-900">
                {pageMeta.title}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-500 shadow-sm">
                  <Search className="h-4 w-4 text-gray-400" />
                  <input
                    className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
                    placeholder={pageMeta.placeholder}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                {pageMeta.actionLabel ? (
                  <button className="rounded-full bg-gray-900 px-4 py-2 text-xs font-semibold text-white shadow-sm">
                    {pageMeta.actionLabel}
                  </button>
                ) : null}
                <button className="rounded-full border border-gray-200 bg-white px-3 py-2 text-xs text-gray-600">
                  Help
                </button>
              </div>
            </div>
          </div>

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
