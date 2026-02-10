import { useMemo, useState } from "react";
import { DocumentCategory, DocumentType, InvestmentData } from "@/types";
import { createRecentDocument, useRecentDocuments } from "@/state/recentDocuments";

const TOOL_OPTIONS = [
  { value: "web-search", label: "Web search" },
  { value: "pappers", label: "Pappers" },
  { value: "crunchbase", label: "Crunchbase" },
  { value: "pitchbook", label: "Pitchbook" },
  { value: "capitaliQ", label: "CapitalIQ" },
];

export default function MarketAnalysisGenerator() {
  const [documentType, setDocumentType] = useState<DocumentType>("docx");
  const documentCategory: DocumentCategory = "market-analysis";
  const [companyName, setCompanyName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [researchTools, setResearchTools] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addRecentDocument } = useRecentDocuments();

  const canGenerate = useMemo(
    () => companyName.trim().length > 0 && websiteUrl.trim().length > 0,
    [companyName, websiteUrl]
  );

  const handleGenerate = async () => {
    if (!canGenerate) {
      return;
    }
    setIsGenerating(true);
    setError(null);

    const investmentData: InvestmentData = {
      companyName: companyName.trim(),
      investmentAmount: "",
      sector: "",
      description: "",
      websiteUrl: websiteUrl.trim(),
      researchTools,
    };

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
      a.download = `analyse-marche.${documentType}`;
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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-950">
          Générer une analyse de marché
        </h2>
      </div>

      <div>
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
            Nom de l'entreprise Cible *
          </label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
            placeholder="Ex: TechStart Inc."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">
            URL du site internet *
          </label>
          <input
            type="url"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
            placeholder="https://www.exemple.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">
            Outils de recherche
          </label>
          <select
            multiple
            value={researchTools}
            onChange={(event) => {
              const next = Array.from(event.target.selectedOptions).map(
                (option) => option.value
              );
              setResearchTools(next);
            }}
            className="w-full min-h-[150px] rounded-xl border border-gray-200 bg-white/80 px-3 py-2 text-sm text-gray-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          >
            {TOOL_OPTIONS.map((tool) => (
              <option key={tool.value} value={tool.value}>
                {tool.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">
            Maintenez Cmd/Ctrl pour sélectionner plusieurs outils.
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <button
        onClick={handleGenerate}
        disabled={isGenerating || !canGenerate}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-md transition-colors"
      >
        {isGenerating ? "Génération en cours..." : "Générer l'analyse"}
      </button>
    </div>
  );
}
