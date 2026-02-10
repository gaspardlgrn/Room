import { Link } from 'react-router-dom'
import {
  Activity,
  BarChart3,
  Briefcase,
  Calculator,
  FileText,
  Globe,
  Headphones,
  Mic,
  Paperclip,
  Sparkles,
  Video,
} from 'lucide-react'

export default function Dashboard() {
  const documentTypes = [
    {
      id: 1,
      title: 'Analyse de marché',
      description: 'Générez une analyse de marché buy-side ultra-structurée.',
      icon: BarChart3,
      tag: 'Analyse de marché',
      tagIcon: BarChart3,
      href: '/create',
      accent: 'from-blue-500/20 to-cyan-500/20',
    },
    {
      id: 2,
      title: 'Valorisation',
      description: 'Valorisez par multiples comparables avec recherche web temps réel.',
      icon: Calculator,
      tag: 'EV/EBITDA',
      tagIcon: Globe,
      href: '/create',
      accent: 'from-fuchsia-500/20 to-indigo-500/20',
    },
    {
      id: 3,
      title: 'Analyse de call expert',
      description: 'Synthèse automatique de vos calls experts et signaux clés.',
      icon: Headphones,
      tag: 'Transcript Teams',
      tagIcon: Mic,
      href: '/expert-call',
      accent: 'from-emerald-500/20 to-teal-500/20',
    },
    {
      id: 4,
      title: "Note d'investissement",
      description: "Note d'investissement prête à partager (docx / pptx / xlsx).",
      icon: FileText,
      tag: 'Pack complet',
      tagIcon: Paperclip,
      href: '/create',
      accent: 'from-amber-500/20 to-orange-500/20',
    },
    {
      id: 5,
      title: 'Note de réunion',
      description: 'Compte-rendu clair et actionnable à partir de vos transcripts Teams.',
      icon: Video,
      tag: 'Transcript Teams',
      tagIcon: Mic,
      href: '/meeting-note',
      accent: 'from-sky-500/20 to-blue-500/20',
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
      progress: 78,
    },
    {
      id: 2,
      name: 'Somfy',
      icon: 'S',
      color: 'bg-yellow-500',
      status: 'Actif',
      date: '19 janvier 2026',
      progress: 42,
    },
  ]

  const metrics = [
    { label: 'Documents générés ce mois-ci', value: '128', trend: '+23%', tone: 'positive' },
    { label: 'Temps moyen gagné / doc', value: '3h45', trend: '-41%', tone: 'positive' },
    { label: 'Satisfaction équipe', value: '4.8/5', trend: 'NPS +12', tone: 'neutral' },
  ]

  return (
    <div className="relative space-y-10 bg-slate-50 px-4 py-6 md:px-6 lg:px-8">
      {/* fond "tech" */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-blue-500/10 via-cyan-400/10 to-fuchsia-500/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-72 w-72 rounded-full bg-gradient-to-tr from-emerald-500/10 via-sky-400/10 to-indigo-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(0,0,0,0.03),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(15,23,42,0.06),_transparent_60%)]" />
      </div>

      {/* header + hero */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-white/60 px-3 py-1 text-xs font-medium text-gray-800 backdrop-blur-sm shadow-sm">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-black text-[10px] font-semibold text-white">
              R
            </span>
            <span className="uppercase tracking-[0.16em]">Workspace</span>
            <span className="h-1 w-1 rounded-full bg-gray-400" />
            <span>Analyste augmenté</span>
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-black">
              Votre salle de marché
              <span className="relative ml-2 inline-flex items-center">
                augmentée
                <Sparkles className="ml-1 h-4 w-4 text-blue-500" />
              </span>
            </h1>
            <p className="mt-3 max-w-xl text-sm md:text-base text-gray-800">
              Centralisez vos deals, vos transcripts et vos modèles.
              ROOM structure, rédige et met en forme vos analyses comme un
              analyste senior – à la vitesse de l’IA.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/create"
              className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white shadow-sm shadow-black/20 transition hover:translate-y-px hover:bg-black/90"
            >
              <Sparkles className="h-4 w-4" />
              Lancer un nouveau document
            </Link>
            <Link
              to="/expert-call"
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-4 py-2 text-sm font-medium text-gray-900 backdrop-blur-sm hover:border-black/30 hover:bg-white"
            >
              <Headphones className="h-4 w-4" />
              Analyser un call expert
            </Link>
            <div className="flex items-center gap-2 text-xs text-gray-700">
              <div className="flex -space-x-1.5">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-white bg-gray-200 text-[10px] font-semibold text-gray-700">
                  FR
                </span>
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-white bg-gray-900 text-[10px] font-semibold text-white">
                  UK
                </span>
              </div>
              <span>Compatible multi-langues & formats buy-side.</span>
            </div>
          </div>
        </div>

        {/* métriques */}
        <div className="mt-2 grid w-full max-w-md grid-cols-1 gap-3 rounded-2xl border border-black/5 bg-white/70 p-3 text-xs shadow-sm backdrop-blur-sm sm:grid-cols-3 lg:mt-0">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="flex flex-col justify-between rounded-xl bg-gradient-to-br from-white/80 to-slate-50/60 p-3 shadow-[0_0_0_1px_rgba(15,23,42,0.02)]"
            >
              <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-gray-500">
                {metric.label}
              </span>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-lg font-semibold text-black">
                  {metric.value}
                </span>
              </div>
              <span
                className={`mt-1 inline-flex items-center text-[11px] font-medium ${
                  metric.tone === 'positive'
                    ? 'text-emerald-600'
                    : 'text-gray-700'
                }`}
              >
                <Activity className="mr-1 h-3 w-3" />
                {metric.trend}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* grille principale */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        {/* colonne génération */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-700">
              GÉNÉRER UN DOCUMENT
            </h2>
            <span className="rounded-full bg-white/80 px-2 py-1 text-[10px] font-medium text-gray-700 shadow-sm backdrop-blur">
              IA structurée · Templates internes
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {documentTypes.map((doc) => (
              <Link
                key={doc.id}
                to={doc.href}
                className="group relative overflow-hidden rounded-2xl border border-black/5 bg-white/80 p-4 text-left shadow-sm backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-black/15 hover:shadow-md"
              >
                <div
                  className={`pointer-events-none absolute inset-px rounded-2xl bg-gradient-to-br ${doc.accent} opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-100`}
                />
                <div className="relative flex h-full flex-col">
                  <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-xl bg-black text-white shadow-sm shadow-black/30">
                    <doc.icon className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-semibold text-black">
                    {doc.title}
                  </h3>
                  <p className="mt-1 flex-1 text-xs text-gray-800">
                    {doc.description}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-[11px] text-gray-700">
                    <div className="inline-flex items-center gap-1 rounded-full bg-gray-900 text-white px-2 py-1">
                      <doc.tagIcon className="h-3 w-3" />
                      <span>{doc.tag}</span>
                    </div>
                    <span className="text-[11px] text-gray-600 group-hover:text-gray-900">
                      Ouvrir le template →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* colonne deals / activité */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.16em] text-gray-700">
              <Briefcase className="h-3 w-3 text-black" />
              DEALS ACTIFS
            </h2>
            <Link
              to="/documents"
              className="text-xs font-medium text-gray-700 hover:text-black"
            >
              Voir tous les documents →
            </Link>
          </div>

          <div className="space-y-3 rounded-2xl border border-black/5 bg-white/80 p-3 shadow-sm backdrop-blur-sm">
            {activeDeals.map((deal) => (
              <div
                key={deal.id}
                className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 hover:bg-gray-50/80"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${deal.color} text-sm font-semibold text-white shadow-sm`}
                  >
                    {deal.icon}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-black">
                      {deal.name}
                    </div>
                    <div className="text-[11px] text-gray-700">
                      Dernière mise à jour · {deal.date}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {deal.status}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-gray-700">
                      {deal.progress}%
                    </span>
                    <div className="h-1.5 w-20 overflow-hidden rounded-full bg-gray-200">
                      <div
                        style={{ width: `${deal.progress}%` }}
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-dashed border-black/10 bg-white/70 p-3 text-xs text-gray-800 backdrop-blur-sm">
            <div className="flex items-start gap-2">
              <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-black text-[11px] font-semibold text-white">
                IA
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-700">
                  SIGNAL EN TEMPS RÉEL
                </div>
                <p className="mt-1 text-xs text-gray-800">
                  ROOM analyse vos documents récents pour suggérer les prochains livrables à générer
                  (notes d&apos;investissement, updates de equity story, Q&amp;A pour management…).
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
