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
    <div className="space-y-8">
      {/* Page Title */}
      <h1 className="text-3xl font-bold text-black">Accueil</h1>

      {/* GÉNÉRER UN DOCUMENT Section */}
      <div>
        <h2 className="text-xs font-semibold text-gray-800 uppercase tracking-wider mb-4">
          GÉNÉRER UN DOCUMENT
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {documentTypes.map((doc) => (
            <Link
              key={doc.id}
              to={doc.href}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex flex-col h-full">
                <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-black">
                  <doc.icon className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-base font-bold text-black mb-2">{doc.title}</h3>
                <p className="text-sm text-gray-800 mb-3 flex-1">{doc.description}</p>
                <div className="flex items-center space-x-2 text-xs text-gray-600">
                  <div className="inline-flex h-4 w-4 items-center justify-center rounded bg-black">
                    <doc.tagIcon className="h-2.5 w-2.5 text-white" />
                  </div>
                  <span className="text-gray-800">{doc.tag}</span>
                </div>
              </div>
            </Link>
          ))}
          {/* Empty card slot */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 opacity-0 pointer-events-none"></div>
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
            className="text-sm text-gray-800 hover:text-black"
          >
            Voir tous →
          </Link>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-200">
          {activeDeals.map((deal) => (
            <div
              key={deal.id}
              className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className={`w-8 h-8 ${deal.color} rounded flex items-center justify-center text-white font-semibold`}>
                  {deal.icon}
                </div>
                <div className="flex flex-col">
                  <span className="text-black font-medium">{deal.name}</span>
                  <span className="text-gray-800 text-sm">{deal.name}</span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-600 font-medium">{deal.status}</span>
                </div>
                <span className="text-sm text-gray-800">{deal.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
