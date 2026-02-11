import { useState } from 'react'
import {
  BarChart3,
  Building2,
  FileText,
  Plus,
  TrendingUp,
  Users,
} from 'lucide-react'

export default function Dashboard() {
  const [tab, setTab] = useState<'recent' | 'templates'>('recent')

  const templates = [
    {
      id: 1,
      title: 'Create new blank table',
      description: 'Start from scratch',
      icon: Plus,
    },
    {
      id: 2,
      title: 'Earnings Call Grid',
      description: 'Guidance, headwinds, drivers',
      icon: BarChart3,
    },
    {
      id: 3,
      title: 'Private Company Strip Profiles',
      description: 'Company, logo, key competitors',
      icon: Building2,
    },
    {
      id: 4,
      title: 'LATAM Energy & Manufacturing',
      description: 'Company, revenue, EBITDA',
      icon: TrendingUp,
    },
    {
      id: 5,
      title: 'LSIT - New Adds',
      description: 'Category, fund, EBITDA',
      icon: Users,
    },
  ]

  const recentTables = [
    {
      id: 1,
      name: 'Earnings Call Grid',
      status: 'Active',
      rows: 48,
      columns: 6,
      updated: '12 Feb',
    },
    {
      id: 2,
      name: 'Private Company Strip Profiles',
      status: 'Draft',
      rows: 16,
      columns: 6,
      updated: '10 Feb',
    },
    {
      id: 3,
      name: 'LATAM Energy & Manufacturing',
      status: 'Active',
      rows: 25,
      columns: 8,
      updated: '08 Feb',
    },
  ]

  return (
    <div className="space-y-8">
      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-800">
            Start with a template
          </h2>
          <button className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-600">
            All Templates
          </button>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <div
              key={template.id}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                  <template.icon className="h-5 w-5 text-gray-700" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">
                    {template.title}
                  </div>
                  <div className="text-xs text-gray-500">
                    {template.description}
                  </div>
                </div>
              </div>
              <div className="mt-4 h-16 rounded-lg border border-dashed border-gray-200 bg-gray-50/60" />
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-4 border-b border-gray-100 pb-3">
          <button
            type="button"
            onClick={() => setTab('recent')}
            className={`text-sm font-semibold ${
              tab === 'recent' ? 'text-gray-900' : 'text-gray-400'
            }`}
          >
            Recent Tables
          </button>
          <button
            type="button"
            onClick={() => setTab('templates')}
            className={`text-sm font-semibold ${
              tab === 'templates' ? 'text-gray-900' : 'text-gray-400'
            }`}
          >
            Templates
          </button>
        </div>
        {tab === 'recent' ? (
          <div className="mt-4">
            <div className="grid grid-cols-5 gap-2 text-xs text-gray-400">
              <div>Table</div>
              <div>Status</div>
              <div>Rows</div>
              <div>Columns</div>
              <div>Updated</div>
            </div>
            <div className="mt-3 divide-y divide-gray-100 text-sm">
              {recentTables.map((table) => (
                <div
                  key={table.id}
                  className="grid grid-cols-5 gap-2 py-3 text-gray-700"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-400" />
                    {table.name}
                  </div>
                  <div>{table.status}</div>
                  <div>{table.rows}</div>
                  <div>{table.columns}</div>
                  <div>{table.updated}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {templates.map((template) => (
              <div
                key={template.id}
                className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50/60 p-3 text-sm text-gray-700"
              >
                <template.icon className="h-4 w-4 text-gray-500" />
                {template.title}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
