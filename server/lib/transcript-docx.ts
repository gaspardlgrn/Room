import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
} from "docx";

type TranscriptDocInput = {
  title: string;
  subtitle?: string;
  transcriptText: string;
};

export async function generateTranscriptDocx(
  input: TranscriptDocInput
): Promise<Buffer> {
  const children: Paragraph[] = [];

  children.push(
    new Paragraph({
      text: input.title,
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  if (input.subtitle) {
    children.push(
      new Paragraph({
        text: input.subtitle,
        spacing: { after: 300 },
      })
    );
  }

  children.push(
    new Paragraph({
      text: "Transcript",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
    })
  );

  const lines = input.transcriptText.split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "Transcript indisponible.",
            italics: true,
          }),
        ],
      })
    );
  } else {
    lines.forEach((line) => {
      children.push(
        new Paragraph({
          text: line,
          spacing: { after: 120 },
        })
      );
    });
  }

  const doc = new Document({
    sections: [{ children }],
  });

  const buffer = await Packer.toBuffer(doc);
  return buffer;
}
