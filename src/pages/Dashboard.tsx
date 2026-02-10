import { Link } from 'react-router-dom'
import {
  BarChart3,
  Briefcase,
  Calculator,
  FileText,
  Globe,
  Headphones,
  Mic,
  Paperclip,
  Video,
} from 'lucide-react'

export default function Dashboard() {
  const documentTypes = [
    {
      id: 1,
      title: 'Analyse de marché',
      description: 'Générez une analyse de marché buy-side.',
      icon: BarChart3,
      tag: 'Analyse de marché',
      tagIcon: BarChart3,
      href: '/create',
    },
    {
      id: 2,
      title: 'Valorisation',
      description: 'Valorisez par multiples comparables avec recherche web.',
      icon: Calculator,
      tag: 'EV/EBITDA',
      tagIcon: Globe,
      href: '/create',
    },
    {
      id: 3,
      title: 'Analyse de call expert',
      description: 'Générez une analyse structurée à partir d\'un call expert.',
      icon: Headphones,
      tag: 'Transcript Teams',
      tagIcon: Mic,
      href: '/expert-call',
    },
    {
      id: 4,
      title: 'Note d\'investissement',
      description: 'Générez automatiquement une note d\'investissement structurée.',
      icon: FileText,
      tag: 'docx/ppt/xlsx',
      tagIcon: Paperclip,
      href: '/create',
    },
    {
      id: 5,
      title: 'Note de réunion',
      description: 'Générez une note structurée à partir de vos transcripts Teams.',
      icon: Video,
      tag: 'Transcript Teams',
      tagIcon: Mic,
      href: '/meeting-note',
    },
  ]

  const activeDeals = [
    {
      id: 1,
      name: 'Mistral',
      icon: 'M',
      color: 'bg-orange-500',
      status: 'Actif',
      date: '21 janvier 2026',
    },
    {
      id: 2,
      name: 'Somfy',
      icon: 'S',
      color: 'bg-yellow-500',
      status: 'Actif',
      date: '19 janvier 2026',
    },
  ]

  return (
    <div className="space-y-10">
      {/* Page Title */}
      <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-6 py-6 text-white shadow-sm">
        <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl"></div>
        <div className="pointer-events-none absolute -left-20 -bottom-20 h-56 w-56 rounded-full bg-indigo-500/10 blur-3xl"></div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/80">
              Room Intelligence
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-white">
              Accueil
            </h1>
            <p className="mt-2 text-sm text-slate-300">
              Centralisez vos analyses et documents d’investissement.
            </p>
          </div>
          <Link
            to="/create"
            className="inline-flex items-center justify-center rounded-md bg-white/90 px-4 py-2 text-sm font-semibold text-slate-950 shadow-sm transition hover:bg-white"
          >
            Nouveau document
          </Link>
        </div>
      </div>

      {/* GÉNÉRER UN DOCUMENT Section */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          GÉNÉRER UN DOCUMENT
          </h2>
          <span className="text-xs text-slate-400">Automatisation IA</span>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {documentTypes.map((doc) => (
            <Link
              key={doc.id}
              to={doc.href}
              className="group rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
            >
              <div className="flex flex-col h-full">
                <div className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-950 shadow-sm ring-1 ring-slate-900/30">
                  <doc.icon className="h-4 w-4 text-cyan-300" />
                </div>
                <h3 className="text-base font-semibold text-gray-950 mb-2">
                  {doc.title}
                </h3>
                <p className="text-sm text-slate-600 mb-4 flex-1">
                  {doc.description}
                </p>
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700">
                  <doc.tagIcon className="h-3 w-3 text-slate-600" />
                  <span>{doc.tag}</span>
                </div>
              </div>
            </Link>
          ))}
          {/* Empty card slot */}
          <div className="rounded-xl border border-transparent p-4 opacity-0 pointer-events-none"></div>
        </div>
      </div>

      {/* DEALS ACTIFS Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 flex items-center space-x-2">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-slate-900">
              <Briefcase className="h-3 w-3 text-cyan-300" />
            </span>
            <span>DEALS ACTIFS</span>
          </h2>
          <Link
            to="/documents"
            className="text-sm text-slate-600 hover:text-slate-950"
          >
            Voir tous →
          </Link>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          {activeDeals.map((deal) => (
            <div
              key={deal.id}
              className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-slate-50"
            >
              <div className="flex items-center space-x-4">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${deal.color} text-sm font-semibold text-white ring-1 ring-white/40`}
                >
                  {deal.icon}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-slate-950">
                    {deal.name}
                  </span>
                  <span className="text-xs text-slate-500">
                    Dernière mise à jour
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-medium text-cyan-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-500"></span>
                  {deal.status}
                </div>
                <span className="text-sm text-slate-600">{deal.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
