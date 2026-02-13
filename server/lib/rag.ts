/**
 * Module RAG (Retrieval-Augmented Generation) avec base vectorielle LanceDB.
 * Indexe les documents Drive/OneDrive et permet une recherche sémantique.
 */
import * as lancedb from "@lancedb/lancedb";
import { OpenAIEmbeddingFunction } from "@lancedb/lancedb/embedding/openai";
import { join } from "path";
import { mkdir } from "fs/promises";
import OpenAI from "openai";

const CHUNK_SIZE = 800;
const CHUNK_OVERLAP = 150;
const RAG_TOP_K = 6;
const RAG_TABLE = "drive_docs";
const DB_PATH = process.env.RAG_DB_PATH || join(process.cwd(), "data", "lancedb");
const EMBEDDING_MODEL = "text-embedding-3-small";

export type DocumentChunk = {
  filename: string;
  source: string;
  content: string;
};

/** Découpe un texte en chunks avec overlap. */
function chunkText(text: string, chunkSize = CHUNK_SIZE, overlap = CHUNK_OVERLAP): string[] {
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

/** Crée ou récupère la table LanceDB. overwrite=true recrée la table vide. */
async function getRagTable(
  embeddingApiKey: string,
  overwrite = false
): Promise<{ db: lancedb.Connection; table: lancedb.Table } | null> {
  try {
    await mkdir(join(DB_PATH, ".."), { recursive: true });
    const db = await lancedb.connect(DB_PATH);
    const tables = await db.tableNames();
    let table: lancedb.Table;
    const embeddingFunction = new OpenAIEmbeddingFunction({
      apiKey: embeddingApiKey,
      model: EMBEDDING_MODEL,
    });
    const embeddingConfig = {
      sourceColumn: "text",
      vectorColumn: "vector",
      function: embeddingFunction,
    };
    if (overwrite && tables.includes(RAG_TABLE)) {
      await db.dropTable(RAG_TABLE);
    }
    if (!tables.includes(RAG_TABLE) || overwrite) {
      table = await db.createTable(
        RAG_TABLE,
        [{ text: "init", filename: "", source: "" }],
        { mode: "overwrite", embeddingFunction: embeddingConfig }
      );
      await table.delete('text = "init"');
    } else {
      table = await db.openTable(RAG_TABLE);
    }
    return { db, table };
  } catch (err) {
    console.error("[RAG] Erreur init LanceDB:", err);
    return null;
  }
}

/** Indexe des documents dans la base vectorielle. overwrite=true remplace tout le contenu. */
export async function indexDocuments(
  documents: DocumentChunk[],
  openaiApiKey: string,
  overwrite = true
): Promise<{ indexed: number; chunks: number }> {
  if (!openaiApiKey || documents.length === 0) return { indexed: 0, chunks: 0 };
  const rag = await getRagTable(openaiApiKey, overwrite);
  if (!rag) return { indexed: 0, chunks: 0 };
  const { table } = rag;
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
    const texts = rows.map((r) => r.text);
    const vectors = await getEmbeddings(texts, openaiApiKey);
    const data = rows.map((r, i) => ({
      ...r,
      vector: vectors[i] ?? new Array(1536).fill(0),
    }));
    await table.add(data, { mode: "append" });
    return { indexed: documents.length, chunks: rows.length };
  } catch (err) {
    console.error("[RAG] Erreur indexation:", err);
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
  try {
    const db = await lancedb.connect(DB_PATH);
    const tables = await db.tableNames();
    if (!tables.includes(RAG_TABLE)) return [];
    const table = await db.openTable(RAG_TABLE);
    const [queryVector] = await getEmbeddings([query.trim()], openaiApiKey);
    if (!queryVector) return [];
    const results = await table
      .vectorSearch(queryVector)
      .limit(topK)
      .toArray();
    return (results as any[]).map((r) => ({
      text: r.text ?? "",
      filename: r.filename ?? "",
      source: r.source ?? "",
    }));
  } catch (err) {
    console.error("[RAG] Erreur recherche:", err);
    return [];
  }
}

/** Vérifie si la base RAG contient des documents. */
export async function hasIndexedDocuments(): Promise<boolean> {
  try {
    const db = await lancedb.connect(DB_PATH);
    const tables = await db.tableNames();
    if (!tables.includes(RAG_TABLE)) return false;
    const table = await db.openTable(RAG_TABLE);
    const count = await table.countRows();
    return count > 0;
  } catch {
    return false;
  }
}
