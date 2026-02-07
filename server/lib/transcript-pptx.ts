import PptxGenJS from "pptxgenjs";

type TranscriptPptxInput = {
  title: string;
  subtitle?: string;
  transcriptText: string;
};

const MAX_PPTX_CHARS = 3000;

export async function generateTranscriptPptx(
  input: TranscriptPptxInput
): Promise<Buffer> {
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "Room - Générateur de Documents";
  pptx.company = "Room";
  pptx.title = input.title;

  const titleSlide = pptx.addSlide();
  titleSlide.background = { color: "111827" };
  titleSlide.addText(input.title, {
    x: 0.6,
    y: 2,
    w: 9,
    h: 1,
    fontSize: 40,
    bold: true,
    color: "FFFFFF",
    align: "center",
  });
  if (input.subtitle) {
    titleSlide.addText(input.subtitle, {
      x: 0.6,
      y: 3.2,
      w: 9,
      h: 0.6,
      fontSize: 18,
      color: "E5E7EB",
      align: "center",
    });
  }

  const contentSlide = pptx.addSlide();
  contentSlide.addText("Transcript", {
    x: 0.5,
    y: 0.4,
    w: 9,
    h: 0.5,
    fontSize: 28,
    bold: true,
    color: "111827",
  });

  const transcriptPreview =
    input.transcriptText.length > MAX_PPTX_CHARS
      ? `${input.transcriptText.slice(0, MAX_PPTX_CHARS)}…`
      : input.transcriptText;

  contentSlide.addText(transcriptPreview || "Transcript indisponible.", {
    x: 0.5,
    y: 1.2,
    w: 9,
    h: 4.6,
    fontSize: 16,
    color: "1F2937",
    bullet: false,
  });

  const buffer = await pptx.write({ outputType: "nodebuffer" });
  return buffer as Buffer;
}
