import TranscriptDocumentGenerator from '@/components/TranscriptDocumentGenerator'

export default function ExpertCallAnalysis() {
  return (
    <TranscriptDocumentGenerator
      documentCategory="expert-call"
      title="Analyse d'un call expert"
      description="Sélectionnez un transcript Teams pour générer une analyse structurée."
    />
  )
}
