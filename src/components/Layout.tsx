import { useEffect, useRef, useState, type DragEvent } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import {
  BarChart3,
  Calculator,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock,
  FileText,
  Headphones,
  Home,
  LogOut,
  Menu,
  MoreHorizontal,
  Settings,
  Shield,
  Video,
} from 'lucide-react'
import { SignOutButton } from '@clerk/clerk-react'
import { useUser } from '@clerk/clerk-react'
import { RecentDocumentsProvider, useRecentDocuments } from '@/state/recentDocuments'
import type { DocumentCategory } from '@/types'

function LayoutContent() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const location = useLocation()
  const { recentDocuments, renameRecentDocument, removeRecentDocument } =
    useRecentDocuments()
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [projectAssignments, setProjectAssignments] = useState<
    Record<string, string[]>
  >(() => {
    if (typeof window === 'undefined') {
      return {}
    }
    try {
      const stored = window.localStorage.getItem('room_project_assignments')
      if (!stored) {
        return {}
      }
      const parsed = JSON.parse(stored) as Record<string, string[]>
      return parsed && typeof parsed === 'object' ? parsed : {}
    } catch (error) {
      console.error('Impossible de charger les projets', error)
      return {}
    }
  })
  const [dragOverProject, setDragOverProject] = useState<string | null>(null)
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>(
    {}
  )
  const [projectsOpen, setProjectsOpen] = useState(true)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const profileMenuRef = useRef<HTMLDivElement | null>(null)
  const assignmentsStorageKey = 'room_project_assignments'
  const { user } = useUser()

  const userEmail = user?.primaryEmailAddress?.emailAddress?.toLowerCase() ?? ''
  const isAdminUser = userEmail === 'gaspard@getroom.io'

  const navigation = [
    { name: 'Accueil', href: '/dashboard', icon: Home },
    ...(isAdminUser ? [{ name: 'Admin', href: '/admin', icon: Shield }] : []),
  ]

  const projects = [
    { name: 'Mistral', icon: 'M', color: 'bg-orange-500' },
    { name: 'Somfy', icon: 'S', color: 'bg-yellow-500' },
    { name: 'Arkea', icon: 'A', color: 'bg-red-500' },
    { name: 'Webedia', icon: 'W', color: 'bg-blue-500' },
  ]

  const isActive = (path: string) => location.pathname === path
  const recentById = new Map(recentDocuments.map((doc) => [doc.id, doc]))
  const isProjectExpanded = (projectName: string) =>
    expandedProjects[projectName] ?? false
  const documentIconByCategory: Record<DocumentCategory, typeof Calculator> = {
    valuation: Calculator,
    'market-analysis': BarChart3,
    'expert-call': Headphones,
    'investment-note': FileText,
    'meeting-note': Video,
  }

  const toggleProject = (projectName: string) => {
    setExpandedProjects((prev) => ({
      ...prev,
      [projectName]: !isProjectExpanded(projectName),
    }))
  }

  useEffect(() => {
    try {
      window.localStorage.setItem(
        assignmentsStorageKey,
        JSON.stringify(projectAssignments)
      )
    } catch (error) {
      console.error('Impossible de sauvegarder les projets', error)
    }
  }, [assignmentsStorageKey, projectAssignments])

  useEffect(() => {
    if (!profileMenuOpen) {
      return
    }
    const handleClickOutside = (event: MouseEvent) => {
      if (!profileMenuRef.current) {
        return
      }
      if (!profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [profileMenuOpen])

  const handleDragStart = (event: DragEvent<HTMLDivElement>, id: string) => {
    event.dataTransfer.setData('text/plain', id)
    event.dataTransfer.effectAllowed = 'move'
  }

  const handleDragEnd = () => {
    setDragOverProject(null)
  }

  const handleLogoutClick = () => {
    setProfileMenuOpen(false)
  }

  const handleDragOver = (
    event: DragEvent<HTMLDivElement>,
    projectName: string
  ) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    setDragOverProject(projectName)
  }

  const handleDrop = (
    event: DragEvent<HTMLDivElement>,
    projectName: string
  ) => {
    event.preventDefault()
    const documentId = event.dataTransfer.getData('text/plain')
    if (!documentId) {
      setDragOverProject(null)
      return
    }

    setProjectAssignments((prev) => {
      const next = { ...prev }
      const current = new Set(next[projectName] ?? [])
      current.add(documentId)
      next[projectName] = Array.from(current)
      return next
    })
    setDragOverProject(null)
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-50 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 flex flex-col`}
      >
        {/* Logo */}
        <div className="h-16 px-6 flex items-center border-b border-gray-200">
          <span className="text-xl font-bold text-black">ROOM.</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                isActive(item.href)
                  ? 'bg-blue-100 text-black'
                  : 'text-black hover:bg-gray-100'
              }`}
            >
              <item.icon className="h-4 w-4 text-black" />
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}

          {/* PROJETS Section */}
          <div className="mt-6">
            <button
              type="button"
              onClick={() => setProjectsOpen((prev) => !prev)}
              className="w-full px-3 py-2 text-xs font-semibold text-gray-800 uppercase tracking-wider flex items-center space-x-1"
              aria-expanded={projectsOpen}
            >
              {projectsOpen ? (
                <ChevronDown className="h-3 w-3 text-black" />
              ) : (
                <ChevronRight className="h-3 w-3 text-black" />
              )}
              <span>PROJETS</span>
            </button>
            {projectsOpen && (
              <div className="space-y-1 mt-2">
                {projects.map((project) => (
                  <div
                    key={project.name}
                    className={`rounded-lg px-3 py-2 ${
                      dragOverProject === project.name
                        ? 'bg-blue-50 ring-1 ring-blue-200'
                        : 'hover:bg-gray-100'
                    }`}
                    onDragOver={(event) => handleDragOver(event, project.name)}
                    onDragLeave={() => setDragOverProject(null)}
                    onDrop={(event) => handleDrop(event, project.name)}
                  >
                    <button
                      type="button"
                      onClick={() => toggleProject(project.name)}
                      className="flex w-full items-center space-x-2 text-left"
                    >
                      <ChevronRight
                        className={`h-3 w-3 text-gray-600 transition-transform duration-200 ${
                          isProjectExpanded(project.name) ? 'rotate-90' : ''
                        }`}
                      />
                      <div
                        className={`w-6 h-6 ${project.color} rounded flex items-center justify-center text-white text-xs font-semibold`}
                      >
                        {project.icon}
                      </div>
                      <span className="text-black text-sm">{project.name}</span>
                    </button>
                    {isProjectExpanded(project.name) && (
                      <div className="mt-2 space-y-1">
                        {(projectAssignments[project.name] ?? []).length === 0 ? (
                          <div className="text-xs text-gray-500">
                            Déposez un document ici
                          </div>
                        ) : (
                          (projectAssignments[project.name] ?? []).map((docId) => {
                            const doc = recentById.get(docId)
                            if (!doc) {
                              return null
                            }
                            return (
                            <Link
                                key={doc.id}
                                to={`/recent/${doc.id}`}
                              className="flex items-center gap-2 rounded px-2 py-1 text-xs text-gray-800 hover:bg-gray-50"
                              >
                              <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-gray-100 text-gray-700">
                                {(() => {
                                  const category = doc.documentCategory ?? 'valuation'
                                  const Icon = documentIconByCategory[category]
                                  return <Icon className="h-3 w-3" />
                                })()}
                              </span>
                                {doc.title}
                              </Link>
                            )
                          })
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RÉCENT Section */}
          <div className="mt-6">
            <div className="px-3 py-2 text-xs font-semibold text-gray-800 uppercase tracking-wider flex items-center space-x-1">
              <Clock className="h-3 w-3 text-black" />
              <span>RÉCENT</span>
            </div>
            <div className="space-y-1 mt-2">
              {recentDocuments.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-800">
                  Aucun document recent
                </div>
              ) : (
                recentDocuments.map((item) => (
                  <div
                    key={item.id}
                    className="relative flex items-start justify-between gap-2 rounded-lg px-3 py-2 hover:bg-gray-100"
                    draggable
                    onDragStart={(event) => handleDragStart(event, item.id)}
                    onDragEnd={handleDragEnd}
                  >
                    <Link
                      to={`/recent/${item.id}`}
                      className="flex-1"
                    >
                      <div className="text-black text-sm font-medium">
                        {item.title}
                      </div>
                      <div className="text-gray-800 text-xs mt-1">
                        {new Date(item.createdAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </div>
                    </Link>
                    <button
                      type="button"
                      aria-label="Actions"
                      onClick={(event) => {
                        event.preventDefault()
                        event.stopPropagation()
                        setOpenMenuId((prev) => (prev === item.id ? null : item.id))
                      }}
                      className="mt-1 rounded p-1 text-gray-600 hover:bg-gray-200"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                    {openMenuId === item.id && (
                      <div className="absolute right-3 top-10 z-10 w-40 rounded-md border border-gray-200 bg-white shadow-lg">
                        <button
                          type="button"
                          className="w-full px-3 py-2 text-left text-sm text-gray-800 hover:bg-gray-50"
                          onClick={(event) => {
                            event.preventDefault()
                            event.stopPropagation()
                            const nextTitle = window.prompt(
                              'Renommer le document',
                              item.title
                            )
                            if (nextTitle && nextTitle.trim().length > 0) {
                              renameRecentDocument(item.id, nextTitle.trim())
                            }
                            setOpenMenuId(null)
                          }}
                        >
                          Renommer
                        </button>
                        <button
                          type="button"
                          className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                          onClick={(event) => {
                            event.preventDefault()
                            event.stopPropagation()
                            const confirmed = window.confirm(
                              'Supprimer ce document des récents ?'
                            )
                            if (confirmed) {
                              removeRecentDocument(item.id)
                            }
                            setOpenMenuId(null)
                          }}
                        >
                          Supprimer
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </nav>

        {/* User Profile */}
      <div className="px-4 py-4 border-t border-gray-200">
          <div className="relative" ref={profileMenuRef}>
            <button
              type="button"
              onClick={() => setProfileMenuOpen((prev) => !prev)}
              className="w-full flex items-center justify-between rounded-md px-2 py-1 hover:bg-gray-100"
              aria-haspopup="menu"
              aria-expanded={profileMenuOpen}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-gray-700 font-semibold text-sm">G</span>
                </div>
                <div className="text-left">
                  <div className="text-black text-sm font-medium">gaspard</div>
                  <div className="text-gray-800 text-xs">gaspard@getroom.io</div>
                </div>
              </div>
              <ChevronUp
                className={`h-4 w-4 text-gray-600 transition-transform ${
                  profileMenuOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
            {profileMenuOpen && (
              <div
                role="menu"
                className="absolute bottom-12 left-0 z-20 w-full rounded-md border border-gray-200 bg-white shadow-lg"
              >
                <Link
                  to="/settings"
                  role="menuitem"
                  onClick={() => setProfileMenuOpen(false)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-800 hover:bg-gray-50"
                >
                  <Settings className="h-4 w-4" />
                  Paramètres
                </Link>
                <SignOutButton redirectUrl="/login">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleLogoutClick}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Déconnexion
                  </button>
                </SignOutButton>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 lg:pl-64 bg-white">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden -m-2.5 p-2.5 text-gray-700"
          >
            <span className="sr-only">Ouvrir la sidebar</span>
            <Menu className="h-5 w-5 text-black" />
          </button>
        </div>

        {/* Page content */}
        <main className="py-8 bg-white">
          <div className="px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
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
