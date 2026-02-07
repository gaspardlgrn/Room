import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Documents() {
  const [filter, setFilter] = useState<'all' | 'docx' | 'pptx'>('all')

  const documents = [
    {
      id: 1,
      name: 'TechStart Inc. - Analyse d\'investissement',
      type: 'docx',
      date: '2024-02-06',
      company: 'TechStart Inc.',
      amount: '5M€',
      sector: 'FinTech',
    },
    {
      id: 2,
      name: 'FinTech Solutions - Présentation',
      type: 'pptx',
      date: '2024-02-06',
      company: 'FinTech Solutions',
      amount: '10M€',
      sector: 'SaaS',
    },
    {
      id: 3,
      name: 'BioHealth Corp - Analyse d\'investissement',
      type: 'docx',
      date: '2024-02-05',
      company: 'BioHealth Corp',
      amount: '15M€',
      sector: 'Biotech',
    },
    {
      id: 4,
      name: 'GreenEnergy Ltd - Présentation',
      type: 'pptx',
      date: '2024-02-04',
      company: 'GreenEnergy Ltd',
      amount: '8M€',
      sector: 'CleanTech',
    },
  ]

  const filteredDocuments =
    filter === 'all'
      ? documents
      : documents.filter((doc) => doc.type === filter)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black">Documents</h1>
          <p className="mt-2 text-sm text-gray-800">
            Gérez tous vos documents générés
          </p>
        </div>
        <Link
          to="/create"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <span className="mr-2">➕</span>
          Nouveau document
        </Link>
      </div>

      {/* Filters */}
      <div className="flex space-x-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-800 border border-gray-300'
          }`}
        >
          Tous
        </button>
        <button
          onClick={() => setFilter('docx')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'docx'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-800 border border-gray-300'
          }`}
        >
          Word (.docx)
        </button>
        <button
          onClick={() => setFilter('pptx')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'pptx'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-800 border border-gray-300'
          }`}
        >
          PowerPoint (.pptx)
        </button>
      </div>

      {/* Documents list */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        {filteredDocuments.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-800">Aucun document trouvé</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredDocuments.map((doc) => (
              <div
                key={doc.id}
              className="px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-lg">
                          {doc.type === 'docx' ? '📝' : '📊'}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-black truncate">
                        {doc.name}
                      </p>
                      <div className="mt-1 flex items-center space-x-4 text-sm text-gray-800">
                        <span>{doc.company}</span>
                        <span>•</span>
                        <span>{doc.amount}</span>
                        <span>•</span>
                        <span>{doc.sector}</span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-800">
                      {new Date(doc.date).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                  <div className="ml-4 flex items-center space-x-2">
                    <button className="px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700">
                      Télécharger
                    </button>
                    <button className="px-3 py-1.5 text-sm text-gray-800 hover:text-gray-900">
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
