import { useState } from "react";
import { DocumentCategory, DocumentType, InvestmentData } from "@/types";
import { createRecentDocument, useRecentDocuments } from "@/state/recentDocuments";

export default function DocumentGenerator() {
  const [documentType, setDocumentType] = useState<DocumentType>("docx");
  const documentCategory: DocumentCategory = "valuation";
  const [investmentData, setInvestmentData] = useState<InvestmentData>({
    companyName: "",
    investmentAmount: "",
    sector: "",
    description: "",
    keyMetrics: "",
    marketAnalysis: "",
    financialProjections: "",
    additionalInfo: "",
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addRecentDocument } = useRecentDocuments();

  const handleInputChange = (
    field: keyof InvestmentData,
    value: string
  ) => {
    setInvestmentData((prev) => ({ ...prev, [field]: value }));
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/generate-document", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documentType,
          investmentData,
        }),
      });

      if (!response.ok) {
        let errorMessage = `Erreur lors de la génération (HTTP ${response.status})`;
        const contentType = response.headers.get("content-type") || "";
        const text = await response.text();

        if (text) {
          if (contentType.includes("application/json")) {
            try {
              const errorData = JSON.parse(text);
              errorMessage = errorData.error || errorMessage;
            } catch {
              errorMessage = text;
            }
          } else {
            errorMessage = text;
          }
        } else if (response.statusText) {
          errorMessage = `${errorMessage} - ${response.statusText}`;
        }

        throw new Error(errorMessage);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `document-investissement.${documentType}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      const recentDocument = createRecentDocument({
        documentType,
        documentCategory,
        investmentData,
      });
      addRecentDocument(recentDocument);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl p-6">
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-800 mb-2">
          Type de document
        </label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="docx"
              checked={documentType === "docx"}
              onChange={(e) => setDocumentType(e.target.value as DocumentType)}
              className="mr-2"
            />
            <span className="text-gray-800">Word (.docx)</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="pptx"
              checked={documentType === "pptx"}
              onChange={(e) => setDocumentType(e.target.value as DocumentType)}
              className="mr-2"
            />
            <span className="text-gray-800">PowerPoint (.pptx)</span>
          </label>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">
            Nom de l'entreprise *
          </label>
          <input
            type="text"
            value={investmentData.companyName}
            onChange={(e) => handleInputChange("companyName", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
            placeholder="Ex: TechStart Inc."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">
            Montant de l'investissement *
          </label>
          <input
            type="text"
            value={investmentData.investmentAmount}
            onChange={(e) => handleInputChange("investmentAmount", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
            placeholder="Ex: 5M€"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">
            Secteur *
          </label>
          <input
            type="text"
            value={investmentData.sector}
            onChange={(e) => handleInputChange("sector", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
            placeholder="Ex: FinTech, SaaS, Biotech..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">
            Description de l'opportunité *
          </label>
          <textarea
            value={investmentData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
            placeholder="Décrivez l'opportunité d'investissement..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">
            Métriques clés
          </label>
          <textarea
            value={investmentData.keyMetrics}
            onChange={(e) => handleInputChange("keyMetrics", e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
            placeholder="Ex: CA 2024: 2M€, Croissance: +150%..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">
            Analyse de marché
          </label>
          <textarea
            value={investmentData.marketAnalysis}
            onChange={(e) => handleInputChange("marketAnalysis", e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
            placeholder="Informations sur le marché, la concurrence..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">
            Projections financières
          </label>
          <textarea
            value={investmentData.financialProjections}
            onChange={(e) => handleInputChange("financialProjections", e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
            placeholder="Projections sur 3-5 ans..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">
            Informations supplémentaires
          </label>
          <textarea
            value={investmentData.additionalInfo}
            onChange={(e) => handleInputChange("additionalInfo", e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
            placeholder="Toute autre information pertinente..."
          />
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <button
        onClick={handleGenerate}
        disabled={isGenerating || !investmentData.companyName || !investmentData.investmentAmount || !investmentData.sector || !investmentData.description}
        className="mt-6 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-md transition-colors"
      >
        {isGenerating ? "Génération en cours..." : "Générer le document"}
      </button>
    </div>
  );
}
