/**
 * Module RAG (Retrieval-Augmented Generation) avec Pinecone.
 * Compatible Vercel serverless (pas de binaires natifs).
 */
import { Pinecone } from "@pinecone-database/pinecone";
import OpenAI from "openai";

const RAG_TOP_K = 6;
const EMBEDDING_MODEL = "text-embedding-3-small";
const NAMESPACE = "room-drive-docs";

export type DocumentChunk = {
  filename: string;
  source: string;
  content: string;
};

/** Découpe un texte en chunks avec overlap. */
function chunkText(
  text: string,
  chunkSize = 600,
  overlap = 100
): string[] {
  const chunks: string[] = [];
  let start = 0;
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return [];
  while (start < clean.length) {
    let end = Math.min(start + chunkSize, clean.length);
    let chunk = clean.slice(start, end);
    if (end < clean.length) {
      const lastSpace = chunk.lastIndexOf(" ");
      if (lastSpace > chunkSize / 2) {
        end = start + lastSpace + 1;
        chunk = clean.slice(start, end);
      }
    }
    if (chunk.trim()) chunks.push(chunk.trim());
    start = end - overlap;
    if (start >= clean.length) break;
  }
  return chunks;
}

/** Génère les embeddings via OpenAI. */
async function getEmbeddings(
  texts: string[],
  apiKey: string
): Promise<number[][]> {
  const openai = new OpenAI({ apiKey });
  const batchSize = 100;
  const all: number[][] = [];
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const res = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: batch,
    });
    for (const d of res.data) {
      all.push(d.embedding);
    }
  }
  return all;
}

function getPineconeIndex() {
  const apiKey = process.env.PINECONE_API_KEY;
  const indexName = process.env.PINECONE_INDEX || "room-rag";
  if (!apiKey) return null;
  const pc = new Pinecone({ apiKey });
  return pc.index({ name: indexName });
}

/** Indexe des documents dans Pinecone. overwrite=true vide le namespace avant. */
export async function indexDocuments(
  documents: DocumentChunk[],
  openaiApiKey: string,
  overwrite = true
): Promise<{ indexed: number; chunks: number }> {
  if (!openaiApiKey || documents.length === 0) return { indexed: 0, chunks: 0 };
  const index = getPineconeIndex();
  if (!index) return { indexed: 0, chunks: 0 };

  const rows: { text: string; filename: string; source: string }[] = [];
  for (const doc of documents) {
    const chunks = chunkText(doc.content);
    for (const chunk of chunks) {
      rows.push({
        text: chunk,
        filename: doc.filename,
        source: doc.source,
      });
    }
  }
  if (rows.length === 0) return { indexed: documents.length, chunks: 0 };

  try {
    const ns = index.namespace(NAMESPACE);
    if (overwrite) {
      await ns.deleteAll();
    }
    const texts = rows.map((r) => r.text);
    const vectors = await getEmbeddings(texts, openaiApiKey);
    const batchSize = 100;
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      const vecBatch = vectors.slice(i, i + batchSize);
      const records = batch.map((r, j) => ({
        id: `chunk-${Date.now()}-${i + j}`,
        values: vecBatch[j] ?? [],
        metadata: {
          text: r.text.slice(0, 36000),
          filename: r.filename.slice(0, 500),
          source: r.source.slice(0, 100),
        },
      }));
      await ns.upsert({ records });
    }
    return { indexed: documents.length, chunks: rows.length };
  } catch (err) {
    console.error("[RAG] Erreur indexation Pinecone:", err);
    return { indexed: 0, chunks: 0 };
  }
}

/** Recherche sémantique dans les documents indexés. */
export async function searchDocuments(
  query: string,
  openaiApiKey: string,
  topK = RAG_TOP_K
): Promise<{ text: string; filename: string; source: string }[]> {
  if (!openaiApiKey || !query.trim()) return [];
  const index = getPineconeIndex();
  if (!index) return [];

  try {
    const [queryVector] = await getEmbeddings([query.trim()], openaiApiKey);
    if (!queryVector) return [];
    const ns = index.namespace(NAMESPACE);
    const res = await ns.query({
      vector: queryVector,
      topK,
      includeMetadata: true,
    });
    return (res.matches ?? [])
      .filter((m) => m.metadata?.text)
      .map((m) => ({
        text: String(m.metadata?.text ?? ""),
        filename: String(m.metadata?.filename ?? ""),
        source: String(m.metadata?.source ?? ""),
      }));
  } catch (err) {
    console.error("[RAG] Erreur recherche Pinecone:", err);
    return [];
  }
}
