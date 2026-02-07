import { useCallback, useEffect, useMemo, useState } from 'react'
import type { DocumentCategory, DocumentType } from '@/types'

type TranscriptItem = {
  id?: string
  meetingId?: string
  createdDateTime?: string
  transcriptContentUrl?: string
}

type Props = {
  documentCategory: Extract<DocumentCategory, 'expert-call' | 'meeting-note'>
  title: string
  description: string
}

export default function TranscriptDocumentGenerator({
  documentCategory,
  title,
  description,
}: Props) {
  const [documentType, setDocumentType] = useState<DocumentType>('docx')
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([])
  const [selectedId, setSelectedId] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [connected, setConnected] = useState<boolean>(false)

  const selectedTranscript = useMemo(
    () => transcripts.find((item) => item.id === selectedId),
    [selectedId, transcripts]
  )

  const loadTranscripts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const statusResponse = await fetch('/api/microsoft/status')
      const statusData = await statusResponse.json()
      setConnected(Boolean(statusData.connected))
      if (!statusData.connected) {
        setTranscripts([])
        return
      }

      const response = await fetch('/api/microsoft/transcripts')
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.error || 'Impossible de récupérer les transcripts.')
      }
      const list = Array.isArray(data?.value) ? data.value : []
      setTranscripts(list)
      if (list.length > 0 && !selectedId) {
        setSelectedId(list[0].id || '')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement.')
    } finally {
      setLoading(false)
    }
  }, [selectedId])

  useEffect(() => {
    void loadTranscripts()
  }, [loadTranscripts])

  const handleGenerate = async () => {
    if (!selectedTranscript?.transcriptContentUrl) {
      setError('Sélectionnez un transcript valide.')
      return
    }
    setIsGenerating(true)
    setError(null)
    try {
      const response = await fetch('/api/generate-transcript-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentType,
          documentCategory,
          transcriptContentUrl: selectedTranscript.transcriptContentUrl,
        }),
      })
      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || `Erreur lors de la génération (${response.status})`)
      }
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${documentCategory}.${documentType}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-black">{title}</h1>
        <p className="mt-2 text-sm text-gray-800">{description}</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-2">
            Type de document
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="docx"
                checked={documentType === 'docx'}
                onChange={(event) =>
                  setDocumentType(event.target.value as DocumentType)
                }
                className="mr-2"
              />
              <span className="text-gray-800">Word (.docx)</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="pptx"
                checked={documentType === 'pptx'}
                onChange={(event) =>
                  setDocumentType(event.target.value as DocumentType)
                }
                className="mr-2"
              />
              <span className="text-gray-800">PowerPoint (.pptx)</span>
            </label>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-800">
              Transcript de réunion
            </label>
            <button
              type="button"
              onClick={loadTranscripts}
              className="text-xs text-gray-700 hover:text-black"
            >
              Rafraîchir
            </button>
          </div>
          <select
            value={selectedId}
            onChange={(event) => setSelectedId(event.target.value)}
            disabled={!connected || loading || transcripts.length === 0}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {transcripts.length === 0 && (
              <option value="">
                {connected ? 'Aucun transcript disponible' : 'Non connecté'}
              </option>
            )}
            {transcripts.map((item) => (
              <option key={item.id} value={item.id}>
                {item.meetingId || item.id} ·{' '}
                {item.createdDateTime
                  ? new Date(item.createdDateTime).toLocaleString('fr-FR')
                  : 'date inconnue'}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleGenerate}
          disabled={!connected || isGenerating || !selectedTranscript}
          className="w-full rounded-md bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isGenerating ? 'Génération en cours...' : 'Générer le document'}
        </button>
      </div>
    </div>
  )
}
