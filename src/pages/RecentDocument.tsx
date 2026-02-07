import { Link, useParams } from "react-router-dom";
import { Download, Pencil, Send } from "lucide-react";
import { buildExecutiveSummary, useRecentDocuments } from "@/state/recentDocuments";
import type { InvestmentData, RecentDocument } from "@/types";

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const buildMetaLine = (document: RecentDocument) => {
  const items = [
    document.sourceUrl,
    document.investmentData.sector,
    document.scope || "Global",
    formatDate(document.createdAt),
  ].filter(Boolean);

  return items.join(" · ");
};

const buildSections = (investmentData: InvestmentData) => {
  const sections = [
    {
      title: "1. Synthèse exécutive",
      content: buildExecutiveSummary(investmentData),
      highlighted: true,
    },
    {
      title: "2. Description de l'opportunité",
      content: investmentData.description,
    },
    {
      title: "3. Métriques clés",
      content: investmentData.keyMetrics,
    },
    {
      title: "4. Analyse de marché",
      content: investmentData.marketAnalysis,
    },
    {
      title: "5. Projections financières",
      content: investmentData.financialProjections,
    },
  ];

  return sections.filter((section) => section.content);
};

export default function RecentDocument() {
  const { id } = useParams();
  const { getDocumentById } = useRecentDocuments();
  const recentDocument = id ? getDocumentById(id) : undefined;

  if (!recentDocument) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-black">Document introuvable</h1>
        <p className="text-sm text-gray-800">
          Ce document n'existe pas ou a été supprimé.
        </p>
        <Link className="text-sm text-blue-600 hover:text-blue-700" to="/dashboard">
          Retour à l'accueil
        </Link>
      </div>
    );
  }

  const sections = buildSections(recentDocument.investmentData);

  const handleDownload = async () => {
    try {
      const response = await fetch("/api/generate-document", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documentType: recentDocument.documentType,
          investmentData: recentDocument.investmentData,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors du telechargement du document");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const anchor = window.document.createElement("a");
      anchor.href = url;
      anchor.download = `document-investissement.${recentDocument.documentType}`;
      window.document.body.appendChild(anchor);
      anchor.click();
      window.URL.revokeObjectURL(url);
      window.document.body.removeChild(anchor);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
        <h1 className="text-2xl font-semibold text-black">{recentDocument.title}</h1>
          <button className="mt-2 inline-flex items-center gap-2 text-sm text-gray-700 hover:text-black">
            <Pencil className="h-4 w-4" />
            Modifier
          </button>
        </div>
        <button
          onClick={handleDownload}
          className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          <Download className="h-4 w-4" />
          Télécharger
        </button>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex-1 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-semibold text-black">Mémo de Valorisation</h2>
            <p className="mt-2 text-sm italic text-gray-700">
              {recentDocument.investmentData.companyName}
            </p>
            <p className="mt-4 text-xs text-gray-600">
              {buildMetaLine(recentDocument)}
            </p>
          </div>

          <div className="mt-8 border-t border-gray-200 pt-6">
            {sections.map((section) => (
              <div key={section.title} className="mb-6 last:mb-0">
                <h3 className="text-base font-semibold text-black">{section.title}</h3>
                <div
                  className={
                    section.highlighted
                      ? "mt-3 rounded-md border border-gray-200 bg-gray-50 p-4 text-sm text-gray-800"
                      : "mt-3 text-sm text-gray-800"
                  }
                >
                  {section.content}
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="w-full lg:w-80">
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
              <span className="text-sm font-semibold text-black">Sources</span>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                22
              </span>
            </div>
            <div className="px-4 py-6 text-sm text-gray-500">
              Aucune source détaillée pour le moment.
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-4 py-3">
              <span className="text-sm font-semibold text-black">Chat</span>
            </div>
            <div className="flex h-40 items-center justify-center text-sm text-gray-400">
              Posez une question sur le mémo.
            </div>
            <div className="flex items-center gap-2 border-t border-gray-200 px-3 py-2">
              <input
                type="text"
                placeholder="Écrivez votre demande..."
                className="flex-1 border-none bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
              />
              <button className="rounded-md bg-slate-900 p-2 text-white hover:bg-slate-800">
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
