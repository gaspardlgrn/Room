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
  Search,
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
      segment: 'Equity',
    },
    {
      id: 2,
      name: 'Somfy',
      icon: 'S',
      color: 'bg-yellow-500',
      status: 'Actif',
      date: '19 janvier 2026',
      progress: 42,
      segment: 'Listed',
    },
  ]

  const metrics = [
    { label: 'Documents générés ce mois-ci', value: '128', trend: '+23%', tone: 'positive' },
    { label: 'Temps moyen gagné / doc', value: '3h45', trend: '-41%', tone: 'positive' },
    { label: 'Satisfaction équipe', value: '4.8/5', trend: 'NPS +12', tone: 'neutral' },
  ]

  const recentActivity = [
    {
      id: 1,
      title: "Note d'investissement Mistral",
      type: 'Pack complet',
      deal: 'Mistral',
      time: 'Il y a 2 h',
      status: 'Terminé',
    },
    {
      id: 2,
      title: 'Transcript call expert Somfy',
      type: 'Transcript Teams',
      deal: 'Somfy',
      time: 'Il y a 6 h',
      status: 'Analysé',
    },
    {
      id: 3,
      title: 'Valorisation comparables SaaS Europe',
      type: 'Valorisation',
      deal: 'Screening sectoriel',
      time: 'Hier',
      status: 'En cours',
    },
  ]

  const aiSuggestions = [
    {
      id: 1,
      title: "Mettre à jour la note d'investissement Mistral",
      description:
        'Nouveau call expert importé il y a 3 jours. Proposez une version rafraîchie pour le comité.',
      actionLabel: 'Lancer la mise à jour',
      href: '/create',
    },
    {
      id: 2,
      title: 'Générer un mémo de réunion Somfy',
      description:
        'Transcript Teams disponible. Créez une note de réunion actionnable pour le portfolio manager.',
      actionLabel: 'Créer la note',
      href: '/meeting-note',
    },
  ]

  return (
    <div className="relative min-h-screen space-y-8 bg-slate-50 px-4 py-6 md:px-6 lg:px-8">
      {/* Fond tech discret */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-blue-500/8 via-cyan-400/8 to-fuchsia-500/8 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-tr from-emerald-500/8 via-sky-400/8 to-indigo-500/8 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.04),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(15,23,42,0.06),_transparent_60%)]" />
      </div>

      {/* Barre d'application */}
      <header className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black text-xs font-semibold text-white shadow-sm shadow-black/30">
            R
          </div>
          <div>
            <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-gray-500">
              ROOM
            </div>
            <div className="text-sm font-medium text-gray-900">Workspace buy-side</div>
          </div>
          <span className="hidden rounded-full border border-black/5 bg-white/70 px-2.5 py-1 text-[10px] font-medium text-gray-700 shadow-sm md:inline-flex">
            Analyste augmenté
          </span>
        </div>

        <div className="flex flex-1 items-center justify-center gap-4 max-w-xl">
          <div className="hidden md:flex flex-1 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-gray-700 shadow-sm">
            <Search className="h-3.5 w-3.5 text-gray-400" />
            <input
              placeholder="Rechercher un deal, un document, un transcript..."
              className="h-6 w-full bg-transparent text-xs outline-none placeholder:text-gray-400"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <nav className="hidden md:flex items-center gap-2 text-xs font-medium text-gray-600">
            <span className="rounded-full bg-black px-3 py-1 text-white">Dashboard</span>
            <Link
              to="/documents"
              className="rounded-full px-3 py-1 hover:bg-white/70 hover:text-black"
            >
              Documents
            </Link>
            <Link
              to="/templates"
              className="rounded-full px-3 py-1 hover:bg-white/70 hover:text-black"
            >
              Templates
            </Link>
          </nav>
          <div className="flex -space-x-1.5">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white bg-gray-200 text-[10px] font-semibold text-gray-700">
              FR
            </span>
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white bg-gray-900 text-[10px] font-semibold text-white">
              UK
            </span>
          </div>
          <div className="hidden h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-xs font-semibold text-white md:flex">
            GL
          </div>
        </div>
      </header>

      {/* Hero + métriques */}
      <section className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-black">
              Votre salle de marché
              <span className="relative ml-2 inline-flex items-center">
                augmentée
                <Sparkles className="ml-1 h-4 w-4 text-blue-500" />
              </span>
            </h1>
            <p className="mt-3 max-w-xl text-sm md:text-base text-gray-800">
              Centralisez vos deals, vos transcripts et vos modèles. ROOM structure, rédige et met en
              forme vos analyses comme un analyste senior – à la vitesse de l’IA.
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
          </div>
        </div>

        {/* métriques */}
        <div className="mt-2 grid w-full max-w-md grid-cols-1 gap-3 rounded-2xl border border-black/5 bg-white/80 p-3 text-xs shadow-sm backdrop-blur-sm sm:grid-cols-3 lg:mt-0">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="flex flex-col justify-between rounded-xl bg-gradient-to-br from-white/80 to-slate-50/60 p-3 shadow-[0_0_0_1px_rgba(15,23,42,0.02)]"
            >
              <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-gray-500">
                {metric.label}
              </span>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-lg font-semibold text-black">{metric.value}</span>
              </div>
              <span
                className={`mt-1 inline-flex items-center text-[11px] font-medium ${
                  metric.tone === 'positive' ? 'text-emerald-600' : 'text-gray-700'
                }`}
              >
                <Activity className="mr-1 h-3 w-3" />
                {metric.trend}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Corps principal en 3 colonnes */}
      <main className="grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1.2fr)_minmax(0,1fr)]">
        {/* Colonne 1 : Générer un livrable */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-700">
              GÉNÉRER UN LIVRABLE
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
                  <h3 className="text-sm font-semibold text-black">{doc.title}</h3>
                  <p className="mt-1 flex-1 text-xs text-gray-800">{doc.description}</p>
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
        </section>

        {/* Colonne 2 : Activité récente + Suggestions IA */}
        <section className="space-y-4">
          <div className="space-y-3 rounded-2xl border border-black/5 bg-white/80 p-3 shadow-sm backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-700">
                ACTIVITÉ RÉCENTE
              </h2>
              <span className="text-[11px] text-gray-600">24 h glissantes</span>
            </div>
            <div className="space-y-2">
              {recentActivity.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-xl px-2.5 py-2 hover:bg-slate-50"
                >
                  <div>
                    <div className="text-sm font-medium text-black">{item.title}</div>
                    <div className="text-[11px] text-gray-600">
                      {item.type} · {item.deal}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[11px] text-gray-500">{item.time}</span>
                    <span className="rounded-full bg-slate-900/90 px-2 py-0.5 text-[10px] font-medium text-white">
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-dashed border-black/10 bg-white/80 p-3 text-xs text-gray-800 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-black text-[11px] font-semibold text-white">
                  IA
                </div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-700">
                  SIGNAL EN TEMPS RÉEL
                </div>
              </div>
              <span className="text-[10px] text-gray-500">Basé sur vos derniers docs</span>
            </div>
            <div className="space-y-2">
              {aiSuggestions.map((sugg) => (
                <div
                  key={sugg.id}
                  className="flex items-start justify-between gap-3 rounded-xl border border-black/5 bg-slate-50/70 px-3 py-2"
                >
                  <div>
                    <div className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-[0.16em] text-gray-600">
                      <Sparkles className="h-3 w-3 text-blue-500" />
                      RECOMMANDATION
                    </div>
                    <div className="mt-1 text-sm font-medium text-gray-900">{sugg.title}</div>
                    <p className="mt-1 text-[11px] text-gray-700">{sugg.description}</p>
                  </div>
                  <Link
                    to={sugg.href}
                    className="mt-1 inline-flex items-center rounded-full bg-black px-3 py-1.5 text-[11px] font-medium text-white shadow-sm hover:bg-black/90"
                  >
                    {sugg.actionLabel}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Colonne 3 : Deals & pipeline */}
        <aside className="space-y-4">
          <div className="space-y-3 rounded-2xl border border-black/5 bg-white/80 p-3 shadow-sm backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.16em] text-gray-700">
                <Briefcase className="h-3 w-3 text-black" />
                DEALS ACTIFS
              </h2>
              <Link
                to="/documents"
                className="text-[11px] font-medium text-gray-700 hover:text-black"
              >
                Voir tous les documents →
              </Link>
            </div>

            <div className="space-y-3">
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
                      <div className="text-sm font-medium text-black">{deal.name}</div>
                      <div className="flex items-center gap-2 text-[11px] text-gray-700">
                        <span className="rounded-full bg-slate-900/90 px-1.5 py-0.5 text-[10px] font-medium text-white">
                          {deal.segment}
                        </span>
                        <span>Dernière mise à jour · {deal.date}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      {deal.status}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-gray-700">{deal.progress}%</span>
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
          </div>

          <div className="rounded-2xl border border-dashed border-black/10 bg-white/80 p-3 text-xs text-gray-800 backdrop-blur-sm">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-700">
              PIPELINE & BACKLOG
            </div>
            <ul className="mt-2 space-y-1.5 text-[11px]">
              <li className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-medium text-gray-900">Mistral</span>
                  <span className="ml-1 text-gray-700">– Refresh note avant comité du 31/01.</span>
                </div>
                <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-medium text-rose-700">
                  Haute
                </span>
              </li>
              <li className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-medium text-gray-900">Somfy</span>
                  <span className="ml-1 text-gray-700">
                    – Mettre à jour valorisation après résultats T1.
                  </span>
                </div>
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                  Moyenne
                </span>
              </li>
            </ul>
          </div>
        </aside>
      </main>
    </div>
  )
}
