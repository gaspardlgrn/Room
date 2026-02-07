export type DocumentType = "docx" | "pptx";

export interface InvestmentData {
  companyName: string;
  investmentAmount: string;
  sector: string;
  description: string;
  keyMetrics?: string;
  marketAnalysis?: string;
  financialProjections?: string;
  additionalInfo?: string;
  // Champs enrichis par l'IA
  executiveSummary?: string;
  riskAnalysis?: string;
  recommendation?: string;
}
