import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";
import { InvestmentData } from "../types/index.js";

export async function generateDocx(data: InvestmentData): Promise<Buffer> {
  const children: Paragraph[] = [];

  // Titre
  children.push(
    new Paragraph({
      text: `Analyse d'Investissement - ${data.companyName}`,
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  // Résumé exécutif
  if (data.executiveSummary) {
    children.push(
      new Paragraph({
        text: "Résumé Exécutif",
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      }),
      new Paragraph({
        text: data.executiveSummary,
        spacing: { after: 300 },
      })
    );
  }

  // Informations générales
  children.push(
    new Paragraph({
      text: "Informations Générales",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "Entreprise: ", bold: true }),
        new TextRun(data.companyName),
      ],
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "Montant de l'investissement: ", bold: true }),
        new TextRun(data.investmentAmount),
      ],
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "Secteur: ", bold: true }),
        new TextRun(data.sector),
      ],
      spacing: { after: 300 },
    })
  );

  // Description de l'opportunité
  children.push(
    new Paragraph({
      text: "Description de l'Opportunité",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
    }),
    new Paragraph({
      text: data.description,
      spacing: { after: 300 },
    })
  );

  // Métriques clés
  if (data.keyMetrics) {
    children.push(
      new Paragraph({
        text: "Métriques Clés",
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      }),
      new Paragraph({
        text: data.keyMetrics,
        spacing: { after: 300 },
      })
    );
  }

  // Analyse de marché
  if (data.marketAnalysis) {
    children.push(
      new Paragraph({
        text: "Analyse de Marché",
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      }),
      new Paragraph({
        text: data.marketAnalysis,
        spacing: { after: 300 },
      })
    );
  }

  // Projections financières
  if (data.financialProjections) {
    children.push(
      new Paragraph({
        text: "Projections Financières",
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      }),
      new Paragraph({
        text: data.financialProjections,
        spacing: { after: 300 },
      })
    );
  }

  // Analyse des risques
  if (data.riskAnalysis) {
    children.push(
      new Paragraph({
        text: "Analyse des Risques",
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      }),
      new Paragraph({
        text: data.riskAnalysis,
        spacing: { after: 300 },
      })
    );
  }

  // Recommandation
  if (data.recommendation) {
    children.push(
      new Paragraph({
        text: "Recommandation",
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      }),
      new Paragraph({
        text: data.recommendation,
        spacing: { after: 300 },
      })
    );
  }

  // Informations supplémentaires
  if (data.additionalInfo) {
    children.push(
      new Paragraph({
        text: "Informations Supplémentaires",
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      }),
      new Paragraph({
        text: data.additionalInfo,
        spacing: { after: 300 },
      })
    );
  }

  const doc = new Document({
    sections: [{ children }],
  });

  const buffer = await Packer.toBuffer(doc);
  return buffer;
}
