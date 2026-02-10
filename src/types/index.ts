export type DocumentType = "docx" | "pptx";
export type DocumentCategory =
  | "valuation"
  | "market-analysis"
  | "expert-call"
  | "investment-note"
  | "meeting-note";

export interface InvestmentData {
  companyName: string;
  investmentAmount: string;
  sector: string;
  description: string;
  websiteUrl?: string;
  researchTools?: string[];
  keyMetrics?: string;
  marketAnalysis?: string;
  financialProjections?: string;
  additionalInfo?: string;
  // Champs enrichis par l'IA
  executiveSummary?: string;
  riskAnalysis?: string;
  recommendation?: string;
}

export interface RecentDocument {
  id: string;
  title: string;
  createdAt: string;
  documentType: DocumentType;
  documentCategory: DocumentCategory;
  investmentData: InvestmentData;
  sourceUrl?: string;
  scope?: string;
}
