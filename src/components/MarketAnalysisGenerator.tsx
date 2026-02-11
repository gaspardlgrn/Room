import { useMemo, useState } from "react";
import { DocumentCategory, DocumentType, InvestmentData } from "@/types";
import { createRecentDocument, useRecentDocuments } from "@/state/recentDocuments";

const TOOL_OPTIONS = [
  {
    value: "web-search",
    label: "Web search",
    logoText: "WS",
    logoClass: "bg-slate-900 text-white",
  },
  {
    value: "pappers",
    label: "Pappers",
    logoText: "P",
    logoClass: "bg-emerald-500 text-white",
  },
  {
    value: "crunchbase",
    label: "Crunchbase",
    logoText: "CB",
    logoClass: "bg-orange-500 text-white",
  },
  {
    value: "pitchbook",
    label: "Pitchbook",
    logoText: "PB",
    logoClass: "bg-blue-600 text-white",
  },
  {
    value: "capitaliQ",
    label: "CapitalIQ",
    logoText: "CIQ",
    logoClass: "bg-indigo-600 text-white",
  },
];

export default function MarketAnalysisGenerator() {
  const [documentType, setDocumentType] = useState<DocumentType>("docx");
  const documentCategory: DocumentCategory = "market-analysis";
  const [companyName, setCompanyName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [researchTools, setResearchTools] = useState<string[]>(
    TOOL_OPTIONS.map((tool) => tool.value)
  );
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
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { value: "docx", label: "Word", hint: ".docx" },
            { value: "pptx", label: "PowerPoint", hint: ".pptx" },
          ].map((option) => {
            const active = documentType === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setDocumentType(option.value as DocumentType)}
                className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
                  active
                    ? "border-blue-200 bg-blue-50 text-blue-900"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                }`}
                aria-pressed={active}
              >
                <div>
                  <div className="text-sm font-semibold">{option.label}</div>
                  <div className="text-xs text-gray-500">{option.hint}</div>
                </div>
                <span
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                    active ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-500"
                  }`}
                  aria-hidden="true"
                >
                  {active ? "✓" : option.hint.replace(".", "")}
                </span>
              </button>
            );
          })}
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
          <div className="grid gap-2 rounded-xl border border-gray-200 bg-white/80 p-3 shadow-sm sm:grid-cols-2">
            {TOOL_OPTIONS.map((tool) => {
              const checked = researchTools.includes(tool.value);
              return (
                <button
                  key={tool.value}
                  type="button"
                  onClick={() => {
                    setResearchTools((prev) =>
                      prev.includes(tool.value)
                        ? prev.filter((item) => item !== tool.value)
                        : [...prev, tool.value]
                    );
                  }}
                  aria-pressed={checked}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                    checked
                      ? "border-blue-200 bg-blue-50 text-blue-900"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-md text-[11px] font-semibold ${
                      checked ? "bg-emerald-500 text-white" : tool.logoClass
                    }`}
                    aria-hidden="true"
                  >
                    {checked ? "✓" : tool.logoText}
                  </span>
                  <span>{tool.label}</span>
                </button>
              );
            })}
          </div>
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
