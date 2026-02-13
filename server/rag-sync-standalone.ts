/**
 * Handler RAG sync standalone - imports minimaux pour éviter OOM sur Vercel Hobby.
 * Ne pas importer server/index (évite msal, docx, pptx, etc.).
 */
import "dotenv/config";
import { verifyToken } from "@clerk/backend";
import { indexDocuments } from "./lib/rag.js";

const COMPOSIO_BASE = process.env.COMPOSIO_BASE_URL || "https://backend.composio.dev";
const COMPOSIO_KEY = process.env.COMPOSIO_API_KEY || "";
const COMPOSIO_USER_ID = process.env.COMPOSIO_USER_ID || "room-local";
const CLERK_KEY = process.env.CLERK_SECRET_KEY || "";

function getCookieValue(cookie: string | undefined, name: string): string | null {
  if (!cookie) return null;
  const m = cookie.match(new RegExp(`${name}=([^;]+)`));
  return m ? decodeURIComponent(m[1].trim()) : null;
}

async function getUserId(authHeader: string, cookie: string | undefined): Promise<string> {
  if (!CLERK_KEY) return COMPOSIO_USER_ID;
  const token =
    (authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null) ||
    getCookieValue(cookie, "__session") ||
    getCookieValue(cookie, "__clerk_session");
  if (!token) return COMPOSIO_USER_ID;
  try {
    const payload = await verifyToken(token, { secretKey: CLERK_KEY });
    return payload.sub || COMPOSIO_USER_ID;
  } catch {
    return COMPOSIO_USER_ID;
  }
}

async function composioFetch(path: string, body?: object): Promise<{ ok: boolean; data?: any }> {
  if (!COMPOSIO_KEY) return { ok: false };
  const res = await fetch(`${COMPOSIO_BASE}${path}`, {
    method: body ? "POST" : "GET",
    headers: { "Content-Type": "application/json", "x-api-key": COMPOSIO_KEY },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data: any;
  try {
    data = text ? JSON.parse(text) : undefined;
  } catch {
    data = text;
  }
  return { ok: res.ok, data };
}

async function composioExecute(tool: string, body: object): Promise<any> {
  const res = await composioFetch(`/api/v3/tools/execute/${tool}`, body);
  if (!res.ok) return undefined;
  const raw = res.data;
  return raw?.data ?? raw?.output ?? raw?.result ?? raw;
}

async function getAccounts(userId: string): Promise<[{ id: string; slug: string }[], string]> {
  const res = await composioFetch(`/api/v3/connected_accounts?user_ids=${encodeURIComponent(userId)}`);
  let items = (res.data?.items ?? []) as any[];
  let effectiveUserId = userId;
  if (items.length === 0) {
    const r2 = await composioFetch("/api/v3/connected_accounts?limit=50");
    items = (r2.data?.items ?? []) as any[];
    if (items.length > 0) effectiveUserId = COMPOSIO_USER_ID;
  }
  const accounts = items
    .map((i: any) => {
      const id = i?.id ?? i?.connected_account_id;
      const slug = (i?.toolkit?.slug ?? i?.toolkit_slug ?? i?.slug ?? "").toLowerCase();
      return id && slug ? { id, slug } : null;
    })
    .filter(Boolean) as { id: string; slug: string }[];
  return [accounts, effectiveUserId];
}

async function extractContent(res: any): Promise<string | null> {
  if (!res || typeof res !== "object") return null;
  const keys = ["text", "content", "output", "body", "data"];
  for (const k of keys) {
    const v = res[k] ?? res?.data?.[k];
    if (typeof v === "string" && v.trim()) return v.trim().slice(0, 15000);
  }
  const url = res?.downloaded_file_content?.s3url ?? res?.url ?? res?.file_url;
  if (typeof url === "string" && url.startsWith("http") && url.length < 2000) {
    try {
      const r = await Promise.race([
        fetch(url),
        new Promise<never>((_, rej) => setTimeout(() => rej(new Error("timeout")), 5000)),
      ]);
      const reader = r.body?.getReader();
      if (!reader) return null;
      const dec = new TextDecoder();
      let out = "";
      let n = 0;
      while (n < 40000) {
        const { done, value } = await reader.read();
        if (done) break;
        out += dec.decode(value, { stream: true });
        n += value.length;
      }
      return out.trim() ? out.trim().slice(0, 15000) : null;
    } catch {
      return null;
    }
  }
  return null;
}

export async function runRagSync(
  authHeader: string,
  cookie: string | undefined
): Promise<{ status: number; body: object }> {
  const apiKey = process.env.OPENAI_API_KEY;
  const pineconeKey = process.env.PINECONE_API_KEY;
  if (!apiKey) return { status: 500, body: { error: "OPENAI_API_KEY manquante." } };
  if (!pineconeKey) return { status: 500, body: { error: "PINECONE_API_KEY manquante." } };

  const userId = await getUserId(authHeader, cookie);
  const [accounts, effectiveUserId] = await getAccounts(userId);
  const driveAccounts = accounts.filter((a) => a.slug === "googledrive" || a.slug === "google_drive");

  if (driveAccounts.length === 0) {
    return {
      status: 200,
      body: {
        ok: true,
        indexed: 0,
        chunks: 0,
        message: "Aucun document à indexer. Connecte Google Drive dans Paramètres > Composio.",
        debug: { driveAccounts: 0, filesListed: 0, docsExtracted: 0 },
      },
    };
  }

  const acc = driveAccounts[0];
  const toolUser = { user_id: effectiveUserId };
  const out = await composioExecute("GOOGLEDRIVE_LIST_FILES", {
    ...toolUser,
    connected_account_id: acc.id,
    arguments: { page_size: 3 },
  }) as any;
  const files = out?.files ?? out?.items ?? out?.data ?? [];
  const list = Array.isArray(files) ? files : [];
  const docs: { filename: string; source: string; content: string }[] = [];

  for (let i = 0; i < Math.min(list.length, 1); i++) {
    const f = list[i];
    const fileId = f?.id ?? f?.fileId ?? f?.file_id;
    const name = f?.name ?? f?.title ?? "(sans nom)";
    const mime = f?.mimeType ?? f?.mime_type ?? "";
    if (!fileId) continue;
    const exportMime = /spreadsheet/i.test(mime) ? "text/csv" : /document|presentation/i.test(mime) ? "text/plain" : null;
    const args: any = { file_id: fileId };
    if (exportMime) args.mime_type = exportMime;
    let text: string | null = null;
    const dlRes = await composioExecute("GOOGLEDRIVE_DOWNLOAD_FILE", { ...toolUser, connected_account_id: acc.id, arguments: args });
    text = await extractContent(dlRes);
    if (text) {
      docs.push({ filename: String(name).slice(0, 200), source: "Google Drive", content: text.slice(0, 8000) });
    }
  }

  if (docs.length === 0) {
    return {
      status: 200,
      body: {
        ok: true,
        indexed: 0,
        chunks: 0,
        message: "Aucun document à indexer. Comptes connectés mais aucun document récupéré.",
        debug: { driveAccounts: 1, filesListed: list.length, docsExtracted: 0 },
      },
    };
  }

  const { indexed, chunks } = await indexDocuments(docs, apiKey);
  return {
    status: 200,
    body: {
      ok: true,
      indexed,
      chunks,
      message: `${indexed} document(s) indexé(s), ${chunks} chunk(s) dans Pinecone.`,
    },
  };
}
