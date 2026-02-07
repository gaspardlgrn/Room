import DocumentGenerator from '../components/DocumentGenerator'

export default function CreateDocument() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-black">
          Créer un document
        </h1>
        <p className="mt-2 text-sm text-gray-800">
          Remplissez le formulaire pour générer un document Word ou PowerPoint
        </p>
      </div>

      {/* Form */}
      <DocumentGenerator />
    </div>
  )
}
