import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Download, FileText, FileSpreadsheet, Presentation } from 'lucide-react'

export default function DocumentResult() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state as { downloadUrl?: string; filename?: string; format?: string } | null

  useEffect(() => {
    return () => {
      if (state?.downloadUrl) URL.revokeObjectURL(state.downloadUrl)
    }
  }, [state?.downloadUrl])

  if (!state?.downloadUrl || !state?.filename) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center px-4">
        <p className="text-gray-600">Aucun fichier à télécharger.</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-4 rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          Retour à l'accueil
        </button>
      </div>
    )
  }

  const Icon = state.format === 'xlsx' ? FileSpreadsheet : state.format === 'pptx' ? Presentation : FileText

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4">
      <div className="flex max-w-md flex-col items-center rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <Icon className="h-8 w-8" />
        </div>
        <h1 className="text-center text-xl font-semibold text-gray-900">
          Document créé
        </h1>
        <p className="mt-2 text-center text-sm text-gray-500">
          Votre fichier est prêt à être téléchargé.
        </p>
        <a
          href={state.downloadUrl}
          download={state.filename}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-medium text-white hover:bg-emerald-700"
        >
          <Download className="h-4 w-4" />
          Télécharger {state.filename}
        </a>
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-4 text-sm text-gray-500 hover:text-gray-700"
        >
          Créer un autre document
        </button>
      </div>
    </div>
  )
}
