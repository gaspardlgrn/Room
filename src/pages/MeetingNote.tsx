import TranscriptDocumentGenerator from '@/components/TranscriptDocumentGenerator'

export default function MeetingNote() {
  return (
    <TranscriptDocumentGenerator
      documentCategory="meeting-note"
      title="Note de réunion"
      description="Sélectionnez un transcript Teams pour générer une note de réunion."
    />
  )
}
