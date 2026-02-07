import PptxGenJS from "pptxgenjs";
import { InvestmentData } from "../types/index.js";

export async function generatePptx(data: InvestmentData): Promise<Buffer> {
  const pptx = new PptxGenJS();

  // Configuration de la présentation
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "Room - Générateur de Documents";
  pptx.company = "Room";
  pptx.title = `Analyse d'Investissement - ${data.companyName}`;

  // Slide 1: Titre
  const slide1 = pptx.addSlide();
  slide1.background = { color: "1E3A8A" };
  slide1.addText(`Analyse d'Investissement`, {
    x: 0.5,
    y: 2,
    w: 9,
    h: 1,
    fontSize: 44,
    bold: true,
    color: "FFFFFF",
    align: "center",
  });
  slide1.addText(data.companyName, {
    x: 0.5,
    y: 3.5,
    w: 9,
    h: 1,
    fontSize: 36,
    color: "FFFFFF",
    align: "center",
  });

  // Slide 2: Résumé exécutif
  if (data.executiveSummary) {
    const slide2 = pptx.addSlide();
    slide2.addText("Résumé Exécutif", {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 0.5,
      fontSize: 32,
      bold: true,
      color: "1E3A8A",
    });
    slide2.addText(data.executiveSummary, {
      x: 0.5,
      y: 1.2,
      w: 9,
      h: 4,
      fontSize: 18,
      bullet: false,
    });
  }

  // Slide 3: Informations générales
  const slide3 = pptx.addSlide();
  slide3.addText("Informations Générales", {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.5,
    fontSize: 32,
    bold: true,
    color: "1E3A8A",
  });

  const infoY = 1.2;
  slide3.addText(`Entreprise: ${data.companyName}`, {
    x: 0.5,
    y: infoY,
    w: 9,
    h: 0.4,
    fontSize: 18,
  });
  slide3.addText(`Montant: ${data.investmentAmount}`, {
    x: 0.5,
    y: infoY + 0.6,
    w: 9,
    h: 0.4,
    fontSize: 18,
  });
  slide3.addText(`Secteur: ${data.sector}`, {
    x: 0.5,
    y: infoY + 1.2,
    w: 9,
    h: 0.4,
    fontSize: 18,
  });

  // Slide 4: Description de l'opportunité
  const slide4 = pptx.addSlide();
  slide4.addText("Description de l'Opportunité", {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.5,
    fontSize: 32,
    bold: true,
    color: "1E3A8A",
  });
  slide4.addText(data.description, {
    x: 0.5,
    y: 1.2,
    w: 9,
    h: 4,
    fontSize: 16,
    bullet: false,
  });

  // Slide 5: Métriques clés
  if (data.keyMetrics) {
    const slide5 = pptx.addSlide();
    slide5.addText("Métriques Clés", {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 0.5,
      fontSize: 32,
      bold: true,
      color: "1E3A8A",
    });
    slide5.addText(data.keyMetrics, {
      x: 0.5,
      y: 1.2,
      w: 9,
      h: 4,
      fontSize: 16,
      bullet: true,
    });
  }

  // Slide 6: Analyse de marché
  if (data.marketAnalysis) {
    const slide6 = pptx.addSlide();
    slide6.addText("Analyse de Marché", {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 0.5,
      fontSize: 32,
      bold: true,
      color: "1E3A8A",
    });
    slide6.addText(data.marketAnalysis, {
      x: 0.5,
      y: 1.2,
      w: 9,
      h: 4,
      fontSize: 16,
      bullet: false,
    });
  }

  // Slide 7: Projections financières
  if (data.financialProjections) {
    const slide7 = pptx.addSlide();
    slide7.addText("Projections Financières", {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 0.5,
      fontSize: 32,
      bold: true,
      color: "1E3A8A",
    });
    slide7.addText(data.financialProjections, {
      x: 0.5,
      y: 1.2,
      w: 9,
      h: 4,
      fontSize: 16,
      bullet: true,
    });
  }

  // Slide 8: Analyse des risques
  if (data.riskAnalysis) {
    const slide8 = pptx.addSlide();
    slide8.addText("Analyse des Risques", {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 0.5,
      fontSize: 32,
      bold: true,
      color: "1E3A8A",
    });
    slide8.addText(data.riskAnalysis, {
      x: 0.5,
      y: 1.2,
      w: 9,
      h: 4,
      fontSize: 16,
      bullet: true,
    });
  }

  // Slide 9: Recommandation
  if (data.recommendation) {
    const slide9 = pptx.addSlide();
    slide9.background = { color: "059669" };
    slide9.addText("Recommandation", {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 0.5,
      fontSize: 32,
      bold: true,
      color: "FFFFFF",
    });
    slide9.addText(data.recommendation, {
      x: 0.5,
      y: 1.5,
      w: 9,
      h: 3.5,
      fontSize: 20,
      color: "FFFFFF",
      bullet: false,
    });
  }

  const buffer = await pptx.write({ outputType: "nodebuffer" });
  return buffer as Buffer;
}
