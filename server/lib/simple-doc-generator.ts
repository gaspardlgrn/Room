/**
 * Générateurs simples docx/pptx/xlsx à partir de texte (prompt utilisateur).
 */
import {
  Document,
  Packer,
  Paragraph,
  HeadingLevel,
  AlignmentType,
} from "docx";
import PptxGenJS from "pptxgenjs";
import ExcelJS from "exceljs";

export type SimpleDocInput = {
  title: string;
  content: string;
};

export async function generateSimpleDocx(input: SimpleDocInput): Promise<Buffer> {
  const children: Paragraph[] = [];

  children.push(
    new Paragraph({
      text: input.title,
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  const lines = input.content.split(/\r?\n/).filter(Boolean);
  for (const line of lines) {
    const isHeading = line.startsWith("## ");
    const text = isHeading ? line.replace(/^##\s+/, "") : line;
    children.push(
      new Paragraph({
        text,
        heading: isHeading ? HeadingLevel.HEADING_1 : undefined,
        spacing: { after: isHeading ? 200 : 120 },
      })
    );
  }

  const doc = new Document({
    sections: [{ children }],
  });
  return Packer.toBuffer(doc);
}

export async function generateSimplePptx(input: SimpleDocInput): Promise<Buffer> {
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "Room";
  pptx.company = "Room";
  pptx.title = input.title;

  const titleSlide = pptx.addSlide();
  titleSlide.background = { color: "111827" };
  titleSlide.addText(input.title, {
    x: 0.6,
    y: 2.5,
    w: 9,
    h: 1,
    fontSize: 36,
    bold: true,
    color: "FFFFFF",
    align: "center",
  });

  const maxChars = 2500;
  const content = input.content.slice(0, maxChars) + (input.content.length > maxChars ? "…" : "");
  const contentSlide = pptx.addSlide();
  contentSlide.addText("Contenu", {
    x: 0.5,
    y: 0.4,
    w: 9,
    h: 0.5,
    fontSize: 28,
    bold: true,
    color: "111827",
  });
  contentSlide.addText(content || "Aucun contenu.", {
    x: 0.5,
    y: 1.2,
    w: 9,
    h: 4.6,
    fontSize: 14,
    color: "1F2937",
    bullet: false,
  });

  const buffer = await pptx.write({ outputType: "nodebuffer" });
  return buffer as Buffer;
}

export async function generateSimpleXlsx(input: SimpleDocInput): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Room";
  const sheet = workbook.addWorksheet("Document", { headerFooter: { firstHeader: input.title } });

  const lines = input.content.split(/\r?\n/).filter(Boolean);
  sheet.addRow([input.title]);
  sheet.getRow(1).font = { bold: true, size: 14 };
  sheet.addRow([]);

  for (const line of lines) {
    const cells = line.split("\t").map((c) => c.trim());
    sheet.addRow(cells.length > 1 ? cells : [line]);
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
