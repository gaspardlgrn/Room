import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import CreateDocument from './CreateDocument'
import ExpertCallAnalysis from './ExpertCallAnalysis'
import MeetingNote from './MeetingNote'
import MarketAnalysisGenerator from '@/components/MarketAnalysisGenerator'
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

type DashboardDoc = {
  id: number
  title: string
  description: string
  icon: typeof BarChart3
  tag: string
  tagIcon: typeof BarChart3
  href: string
}

export default function Dashboard() {
  const documentTypes: DashboardDoc[] = [
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
  const [selectedDoc, setSelectedDoc] = useState<DashboardDoc | null>(null)

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

  useEffect(() => {
    if (!selectedDoc) {
      document.body.style.overflow = ''
      return
    }
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [selectedDoc])

  const isMarketAnalysis = selectedDoc?.title === 'Analyse de marché'

  const renderModalContent = (doc: DashboardDoc) => {
    switch (doc.href) {
      case '/create':
        if (doc.title === 'Analyse de marché') {
          return <MarketAnalysisGenerator />
        }
        return <CreateDocument />
      case '/expert-call':
        return <ExpertCallAnalysis />
      case '/meeting-note':
        return <MeetingNote />
      default:
        return (
          <div className="text-sm text-gray-600">
            Contenu indisponible pour ce module.
          </div>
        )
    }
  }

  return (
    <div className="space-y-10">
      {/* Page Title */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-950">Accueil</h1>
          <p className="text-sm text-gray-600">
            Centralisez vos analyses et documents d’investissement.
          </p>
        </div>
        <Link
          to="/create"
          className="inline-flex items-center justify-center rounded-md bg-gray-950 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-gray-900"
        >
          Nouveau document
        </Link>
      </div>

      {/* GÉNÉRER UN DOCUMENT Section */}
      <div>
        <h2 className="text-xs font-semibold text-gray-800 uppercase tracking-wider mb-4">
          GÉNÉRER UN DOCUMENT
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {documentTypes.map((doc) => (
            <button
              key={doc.id}
              type="button"
              onClick={() => setSelectedDoc(doc)}
              className="group rounded-xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md"
            >
              <div className="flex flex-col h-full">
                <div className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-gray-900 to-gray-700 shadow-sm">
                  <doc.icon className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-base font-semibold text-gray-950 mb-2">
                  {doc.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4 flex-1">
                  {doc.description}
                </p>
                <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs text-gray-700">
                  <doc.tagIcon className="h-3 w-3 text-gray-600" />
                  <span>{doc.tag}</span>
                </div>
              </div>
            </button>
          ))}
          {/* Empty card slot */}
          <div className="rounded-xl border border-transparent p-4 opacity-0 pointer-events-none"></div>
        </div>
      </div>

      {/* DEALS ACTIFS Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold text-gray-800 uppercase tracking-wider flex items-center space-x-1">
            <Briefcase className="h-3 w-3 text-black" />
            <span>DEALS ACTIFS</span>
          </h2>
          <Link
            to="/documents"
            className="text-sm text-gray-700 hover:text-gray-950"
          >
            Voir tous →
          </Link>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          {activeDeals.map((deal) => (
            <div
              key={deal.id}
              className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-gray-50"
            >
              <div className="flex items-center space-x-4">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${deal.color} text-sm font-semibold text-white`}
                >
                  {deal.icon}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-950">
                    {deal.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    Dernière mise à jour
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  {deal.status}
                </div>
                <span className="text-sm text-gray-600">{deal.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      {selectedDoc ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setSelectedDoc(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-4xl rounded-2xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                {isMarketAnalysis ? (
                  <h3 className="text-xl font-semibold text-gray-950">
                    Générer une analyse de marché
                  </h3>
                ) : (
                  <>
                    <p className="text-xs uppercase tracking-wider text-gray-500">
                      Module
                    </p>
                    <h3 className="mt-1 text-xl font-semibold text-gray-950">
                      {selectedDoc.title}
                    </h3>
                  </>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelectedDoc(null)}
                className="rounded-md p-2 text-gray-500 hover:bg-gray-100"
                aria-label="Fermer"
              >
                ×
              </button>
            </div>
            {!isMarketAnalysis ? (
              <p className="mt-3 text-sm text-gray-600">
                {selectedDoc.description}
              </p>
            ) : null}
            <div className="mt-6 max-h-[70vh] overflow-y-auto pr-2">
              {renderModalContent(selectedDoc)}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
