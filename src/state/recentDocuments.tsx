import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type {
  DocumentCategory,
  DocumentType,
  InvestmentData,
  RecentDocument,
} from "@/types";

const STORAGE_KEY = "room_recent_documents";
const MAX_RECENTS = 10;

interface RecentDocumentsContextValue {
  recentDocuments: RecentDocument[];
  addRecentDocument: (document: RecentDocument) => void;
  getDocumentById: (id: string) => RecentDocument | undefined;
  renameRecentDocument: (id: string, title: string) => void;
  removeRecentDocument: (id: string) => void;
}

const RecentDocumentsContext = createContext<RecentDocumentsContextValue | null>(
  null
);

const DEFAULT_RECENTS: RecentDocument[] = [
  {
    id: "seed-irr-2026-01-22",
    title: "Valorisation - Irrifrance",
    createdAt: "2026-01-22T09:00:00.000Z",
    documentType: "docx",
    documentCategory: "valuation",
    sourceUrl: "https://www.irriprance.com/",
    scope: "Global",
    investmentData: {
      companyName: "Irrifrance",
      investmentAmount: "15,8 M€",
      sector: "Manufacturing",
      description:
        "Irrifrance est un acteur historique des équipements d'irrigation avec une présence internationale et une base installée solide.",
      keyMetrics: "EBITDA 2025 : 1,73 M€",
      marketAnalysis:
        "Marché mature et fragmenté, avec une consolidation progressive des acteurs européens.",
      financialProjections:
        "Croissance organique de 6 % par an et stabilisation des marges.",
      executiveSummary:
        "Sur la base d'un benchmark sectoriel issu d'Industrials M&A Update (PitchBook Data) et de la médiane des multiples EV/EBITDA observés sur des transactions privées equity reportées (T1 2025), nous estimons la valeur d'entreprise d'Irrifrance dans une fourchette de 13,4 à 18,1 M€, avec un point central à 15,8 M€. Cette valorisation correspond à un multiple EV/EBITDA de 7,75x à 10,49x (médiane 9,12x), appliqué à un EBITDA de 1,73 M€ pour un chiffre d'affaires de 24,49 M€.",
    },
  },
  {
    id: "seed-irr-2026-01-21",
    title: "Valorisation - Irrifrance",
    createdAt: "2026-01-21T09:00:00.000Z",
    documentType: "docx",
    documentCategory: "valuation",
    sourceUrl: "https://www.irriprance.com/",
    scope: "Global",
    investmentData: {
      companyName: "Irrifrance",
      investmentAmount: "14,9 M€",
      sector: "Manufacturing",
      description: "Mise a jour du memo de valorisation pour Irrifrance.",
      executiveSummary:
        "Mise a jour des comparables et actualisation des multiples sur la base des transactions recentes.",
    },
  },
  {
    id: "seed-revolut-2026-01-21",
    title: "Valorisation - Revolut",
    createdAt: "2026-01-21T08:00:00.000Z",
    documentType: "pptx",
    documentCategory: "valuation",
    sourceUrl: "https://www.revolut.com/",
    scope: "Europe",
    investmentData: {
      companyName: "Revolut",
      investmentAmount: "120 M€",
      sector: "FinTech",
      description:
        "Analyse de la dynamique de croissance et de la rentabilite dans le secteur bancaire digital.",
      executiveSummary:
        "Presentation des multiples et de la traction commerciale pour une serie de financement.",
    },
  },
  {
    id: "seed-market-2026-01-14",
    title: "Analyse de marche...",
    createdAt: "2026-01-14T08:00:00.000Z",
    documentType: "docx",
    documentCategory: "valuation",
    scope: "France",
    investmentData: {
      companyName: "Marche IoT",
      investmentAmount: "N/A",
      sector: "Technologie",
      description:
        "Synthese des tendances cle dans l'IoT industriel, avec une attention particuliere sur les cas d'usage a forte valeur.",
      executiveSummary:
        "Le marche reste tire par la digitalisation des chaines de production et la baisse des couts des capteurs.",
    },
  },
];

const buildSourceUrl = (companyName: string) => {
  const slug = companyName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .trim();
  if (!slug) {
    return undefined;
  }
  return `https://www.${slug}.com/`;
};

export const buildExecutiveSummary = (investmentData: InvestmentData) => {
  if (investmentData.executiveSummary) {
    return investmentData.executiveSummary;
  }

  const amount = investmentData.investmentAmount
    ? `pour un montant de ${investmentData.investmentAmount}`
    : "pour un montant a confirmer";
  const sector = investmentData.sector
    ? `dans le secteur ${investmentData.sector}`
    : "dans son secteur d'activite";

  return `Sur la base des informations fournies, ${investmentData.companyName} evolue ${sector} ${amount}. ${investmentData.description}`;
};

const createId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `doc-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const createRecentDocument = ({
  documentType,
  documentCategory = "valuation",
  investmentData,
}: {
  documentType: DocumentType;
  documentCategory?: DocumentCategory;
  investmentData: InvestmentData;
}): RecentDocument => {
  const enrichedData: InvestmentData = {
    ...investmentData,
    executiveSummary: buildExecutiveSummary(investmentData),
  };

  return {
    id: createId(),
    title: `Valorisation - ${investmentData.companyName || "Nouveau document"}`,
    createdAt: new Date().toISOString(),
    documentType,
    documentCategory,
    investmentData: enrichedData,
    sourceUrl: buildSourceUrl(investmentData.companyName),
    scope: "Global",
  };
};

const loadRecents = () => {
  if (typeof window === "undefined") {
    return DEFAULT_RECENTS;
  }
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return DEFAULT_RECENTS;
  }
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return (parsed as RecentDocument[]).map((document) => ({
        ...document,
        documentCategory: document.documentCategory || "valuation",
      }));
    }
  } catch {
    return DEFAULT_RECENTS;
  }
  return DEFAULT_RECENTS;
};

export function RecentDocumentsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [recentDocuments, setRecentDocuments] =
    useState<RecentDocument[]>(loadRecents);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(recentDocuments));
  }, [recentDocuments]);

  const addRecentDocument = (document: RecentDocument) => {
    setRecentDocuments((prev) => {
      const next = [document, ...prev.filter((item) => item.id !== document.id)];
      return next.slice(0, MAX_RECENTS);
    });
  };

  const getDocumentById = (id: string) =>
    recentDocuments.find((document) => document.id === id);

  const renameRecentDocument = (id: string, title: string) => {
    setRecentDocuments((prev) =>
      prev.map((document) =>
        document.id === id ? { ...document, title } : document
      )
    );
  };

  const removeRecentDocument = (id: string) => {
    setRecentDocuments((prev) => prev.filter((document) => document.id !== id));
  };

  const value = useMemo(
    () => ({
      recentDocuments,
      addRecentDocument,
      getDocumentById,
      renameRecentDocument,
      removeRecentDocument,
    }),
    [recentDocuments]
  );

  return (
    <RecentDocumentsContext.Provider value={value}>
      {children}
    </RecentDocumentsContext.Provider>
  );
}

export const useRecentDocuments = () => {
  const context = useContext(RecentDocumentsContext);
  if (!context) {
    throw new Error(
      "useRecentDocuments doit etre utilise dans RecentDocumentsProvider"
    );
  }
  return context;
};
