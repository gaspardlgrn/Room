/**
 * Handler RAG sync léger - évite de charger le serveur Express complet (OOM sur Hobby).
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { runRagSync } from "../server/rag-sync-standalone.js";

export const config = { maxDuration: 10 };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "GET") {
    return res.status(405).json({ error: "Méthode non autorisée. Utilise POST pour synchroniser." });
  }
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée." });
  }
  try {
    const auth = (req.headers.authorization as string) || "";
    const cookie = req.headers.cookie;
    const { status, body } = await runRagSync(auth, cookie);
    return res.status(status).json(body);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[RAG sync]", msg);
    return res.status(500).json({
      error: "Erreur lors de l'indexation des documents.",
      detail: msg,
    });
  }
}
