import { useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import {
  CalendarClock,
  HelpCircle,
  LayoutGrid,
  LogOut,
  Search,
  Settings,
  Shield,
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
    { name: 'Tables', href: '/dashboard', icon: LayoutGrid },
    { name: 'Research', href: '/research', icon: Search },
    { name: 'Tasks', href: '/tasks', icon: CalendarClock },
    { name: 'Settings', href: '/settings', icon: Settings },
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
          className={`fixed inset-y-0 left-0 z-50 w-16 border-r border-gray-200 bg-white transition-transform lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex h-16 items-center justify-center border-b border-gray-200">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900 text-xs font-semibold text-white">
              R
            </div>
          </div>
          <nav className="flex h-full flex-col items-center gap-2 py-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                aria-label={item.name}
                className={`flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 transition ${
                  isActive(item.href)
                    ? 'bg-gray-900 text-white'
                    : 'hover:bg-gray-100'
                }`}
              >
                <item.icon className="h-4 w-4" />
              </Link>
            ))}
            <div className="mt-auto flex flex-col items-center gap-2 pb-6">
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
                aria-label="Aide"
              >
                <HelpCircle className="h-4 w-4" />
              </button>
              <SignOutButton redirectUrl="/login">
                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
                  aria-label="Déconnexion"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </SignOutButton>
            </div>
          </nav>
        </aside>

        <div className="flex-1 lg:ml-16">
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
