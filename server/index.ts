import "dotenv/config";
import express from "express";
import cors from "cors";
import { ConfidentialClientApplication, type AccountInfo } from "@azure/msal-node";
import { randomUUID } from "crypto";
import { generateDocx } from "./lib/docx-generator.js";
import { generatePptx } from "./lib/pptx-generator.js";
import { generateTranscriptDocx } from "./lib/transcript-docx.js";
import { generateTranscriptPptx } from "./lib/transcript-pptx.js";
import { DocumentType, InvestmentData } from "./types/index.js";
import OpenAI from "openai";
import { createClerkClient, verifyToken } from "@clerk/backend";

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
const COMPOSIO_BASE_URL =
  process.env.COMPOSIO_BASE_URL || "https://backend.composio.dev";
const COMPOSIO_API_KEY = process.env.COMPOSIO_API_KEY || "";
const COMPOSIO_USER_ID = process.env.COMPOSIO_USER_ID || "room-local";
const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY || "";
const ADMIN_INVITE_ROLE =
  process.env.ADMIN_INVITE_ROLE || "org:member";
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || "gaspard@getroom.io")
  .split(/[,;\s]+/)
  .map((email) => email.toLowerCase())
  .filter(Boolean);
const ADMIN_USER_IDS = (process.env.ADMIN_USER_IDS || process.env.ADMIN_USER_ID || "")
  .split(/[,;\s]+/)
  .filter(Boolean);

app.use(cors());
app.use(express.json());

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const microsoftClientId = process.env.MICROSOFT_CLIENT_ID || "";
const microsoftClientSecret = process.env.MICROSOFT_CLIENT_SECRET || "";
const microsoftTenantId = process.env.MICROSOFT_TENANT_ID || "common";
const microsoftRedirectUri =
  process.env.MICROSOFT_REDIRECT_URI ||
  `http://localhost:${PORT}/api/microsoft/oauth/callback`;
const microsoftScopes = (process.env.MICROSOFT_SCOPES ||
  "User.Read OnlineMeetingTranscript.Read.All").split(/\s+/).filter(Boolean);

const msalClient =
  microsoftClientId && microsoftClientSecret
    ? new ConfidentialClientApplication({
        auth: {
          clientId: microsoftClientId,
          clientSecret: microsoftClientSecret,
          authority: `https://login.microsoftonline.com/${microsoftTenantId}`,
        },
      })
    : null;

const oauthStateStore = new Set<string>();
let microsoftAccount: AccountInfo | null = null;

function formatClerkError(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  const anyErr = error as {
    errors?: Array<{ message?: string; longMessage?: string }>;
    message?: string;
  };
  if (anyErr?.errors?.length) {
    return (
      anyErr.errors[0]?.longMessage ||
      anyErr.errors[0]?.message ||
      fallback
    );
  }
  if (anyErr?.message) {
    return anyErr.message;
  }
  return fallback;
}

function getCookieValue(cookieHeader: string | undefined, name: string) {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(";").map((part) => part.trim());
  for (const part of parts) {
    if (part.startsWith(`${name}=`)) {
      return decodeURIComponent(part.slice(name.length + 1));
    }
  }
  return null;
}

async function requireAdmin(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  if (!CLERK_SECRET_KEY) {
    return res.status(500).json({ error: "CLERK_SECRET_KEY manquante." });
  }
  const clerkClient = createClerkClient({ secretKey: CLERK_SECRET_KEY });
  const authHeader = req.headers.authorization || "";
  const bearerToken = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;
  const cookieToken =
    getCookieValue(req.headers.cookie, "__session") ||
    getCookieValue(req.headers.cookie, "__clerk_session");
  const token = bearerToken || cookieToken;
  if (!token) {
    return res.status(401).json({ error: "Token Clerk manquant." });
  }
  try {
    const payload = await verifyToken(token, { secretKey: CLERK_SECRET_KEY });
    const userId = payload.sub;
    if (!userId) {
      return res.status(401).json({ error: "Token Clerk invalide." });
    }
    const user = await clerkClient.users.getUser(userId);
    const emails = user.emailAddresses.map((email: { emailAddress: string }) =>
      email.emailAddress.toLowerCase()
    );
    const isEmailAllowed = emails.some((email) => ADMIN_EMAILS.includes(email));
    const isUserAllowed = ADMIN_USER_IDS.length > 0 && ADMIN_USER_IDS.includes(userId);
    if (!isEmailAllowed && !isUserAllowed) {
      return res.status(403).json({ error: "Accès admin refusé." });
    }
    (req as express.Request & { clerkUserId?: string }).clerkUserId = userId;
    return next();
  } catch (error) {
    console.error("Erreur auth admin Clerk:", error);
    return res.status(401).json({ error: "Token Clerk invalide." });
  }
}

async function enhanceWithAI(investmentData: InvestmentData): Promise<InvestmentData> {
  if (!process.env.OPENAI_API_KEY || !openai) {
    console.warn("OPENAI_API_KEY non configurée, utilisation des données brutes");
    return investmentData;
  }

  try {
    const prompt = `Tu es un expert en investissement et en rédaction de documents professionnels pour le secteur financier. 
    
À partir des informations suivantes sur une opportunité d'investissement, enrichis et structure le contenu pour créer un document professionnel de qualité :

Entreprise: ${investmentData.companyName}
Montant: ${investmentData.investmentAmount}
Secteur: ${investmentData.sector}
Description: ${investmentData.description}
Métriques: ${investmentData.keyMetrics || "Non fourni"}
Analyse marché: ${investmentData.marketAnalysis || "Non fourni"}
Projections: ${investmentData.financialProjections || "Non fourni"}
Infos supplémentaires: ${investmentData.additionalInfo || "Non fourni"}

Retourne un JSON avec les champs enrichis suivants :
- description: description enrichie et professionnelle
- keyMetrics: métriques formatées et détaillées
- marketAnalysis: analyse de marché approfondie
- financialProjections: projections financières structurées
- executiveSummary: un résumé exécutif de 2-3 phrases
- riskAnalysis: analyse des risques principaux
- recommendation: recommandation d'investissement

Retourne uniquement le JSON, sans markdown ni texte supplémentaire.`;

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "Tu es un expert en investissement et rédaction de documents financiers professionnels.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const aiResponse = JSON.parse(completion.choices[0].message.content || "{}");
    
    return {
      ...investmentData,
      description: aiResponse.description || investmentData.description,
      keyMetrics: aiResponse.keyMetrics || investmentData.keyMetrics,
      marketAnalysis: aiResponse.marketAnalysis || investmentData.marketAnalysis,
      financialProjections: aiResponse.financialProjections || investmentData.financialProjections,
      executiveSummary: aiResponse.executiveSummary,
      riskAnalysis: aiResponse.riskAnalysis,
      recommendation: aiResponse.recommendation,
    };
  } catch (error) {
    console.error("Erreur lors de l'enrichissement IA:", error);
    return investmentData;
  }
}

async function composioRequest(
  path: string,
  init?: RequestInit
): Promise<{ ok: boolean; status: number; data?: any; error?: string }> {
  if (!COMPOSIO_API_KEY) {
    return { ok: false, status: 500, error: "COMPOSIO_API_KEY manquante." };
  }
  const response = await fetch(`${COMPOSIO_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": COMPOSIO_API_KEY,
      ...(init?.headers || {}),
    },
  });
  const text = await response.text();
  let data: any = undefined;
  try {
    data = text ? JSON.parse(text) : undefined;
  } catch {
    data = text;
  }
  if (!response.ok) {
    const message =
      data?.error?.message || data?.message || "Erreur Composio.";
    return { ok: false, status: response.status, error: message };
  }
  return { ok: true, status: response.status, data };
}

async function getMicrosoftAccessToken() {
  if (!msalClient || !microsoftAccount) {
    return null;
  }
  try {
    const response = await msalClient.acquireTokenSilent({
      account: microsoftAccount,
      scopes: microsoftScopes,
    });
    return response?.accessToken ?? null;
  } catch (error) {
    console.error("Erreur de rafraîchissement du token Microsoft:", error);
    return null;
  }
}

async function callMicrosoftGraph(path: string) {
  const accessToken = await getMicrosoftAccessToken();
  if (!accessToken) {
    return { ok: false as const, status: 401, error: "Non connecté à Microsoft." };
  }
  const response = await fetch(`https://graph.microsoft.com${path}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!response.ok) {
    const message = await response.text();
    return {
      ok: false as const,
      status: response.status,
      error: message || "Erreur Microsoft Graph",
    };
  }
  const data = await response.json();
  return { ok: true as const, data };
}

async function fetchTranscriptContent(url: string) {
  const accessToken = await getMicrosoftAccessToken();
  if (!accessToken) {
    return { ok: false as const, status: 401, error: "Non connecté à Microsoft." };
  }
  if (!url.startsWith("https://")) {
    return { ok: false as const, status: 400, error: "URL transcript invalide." };
  }
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) {
    const message = await response.text();
    return {
      ok: false as const,
      status: response.status,
      error: message || "Erreur lors du chargement du transcript.",
    };
  }
  const text = await response.text();
  return { ok: true as const, text };
}

app.post("/api/generate-document", async (req, res) => {
  try {
    const { documentType, investmentData }: { documentType: DocumentType; investmentData: InvestmentData } = req.body;

    if (!documentType || !investmentData) {
      return res.status(400).json({
        error: "Type de document et données d'investissement requis",
      });
    }

    // Enrichir les données avec l'IA
    const enhancedData = await enhanceWithAI(investmentData);

    // Générer le document selon le type
    let buffer: Buffer;
    let contentType: string;
    let filename: string;

    if (documentType === "docx") {
      buffer = await generateDocx(enhancedData);
      contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      filename = `document-investissement-${enhancedData.companyName.replace(/\s+/g, "-")}.docx`;
    } else {
      buffer = await generatePptx(enhancedData);
      contentType = "application/vnd.openxmlformats-officedocument.presentationml.presentation";
      filename = `presentation-investissement-${enhancedData.companyName.replace(/\s+/g, "-")}.pptx`;
    }

    if (!buffer || buffer.length === 0) {
      throw new Error("Document généré vide");
    }

    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (error) {
    console.error("Erreur lors de la génération du document:", error);
    const message = error instanceof Error ? error.message : "Erreur lors de la génération du document";
    if (!res.headersSent) {
      res.status(500).json({ error: message });
    }
  }
});

app.get("/api/composio/toolkits", async (req, res) => {
  const params = new URLSearchParams();
  if (req.query.search) {
    params.set("search", String(req.query.search));
  }
  if (req.query.category) {
    params.set("category", String(req.query.category));
  }
  if (req.query.limit) {
    params.set("limit", String(req.query.limit));
  } else {
    params.set("limit", "50");
  }
  const result = await composioRequest(`/api/v3/toolkits?${params.toString()}`);
  if (!result.ok) {
    return res.status(result.status).json({ error: result.error });
  }
  return res.json(result.data);
});

app.get("/api/composio/connected-accounts", async (_req, res) => {
  const params = new URLSearchParams();
  params.set("user_id", COMPOSIO_USER_ID);
  const result = await composioRequest(
    `/api/v3/connected_accounts?${params.toString()}`
  );
  if (!result.ok) {
    return res.status(result.status).json({ error: result.error });
  }
  return res.json(result.data);
});

app.post("/api/composio/connect", async (req, res) => {
  const { toolkitSlug } = req.body as { toolkitSlug?: string };
  if (!toolkitSlug) {
    return res.status(400).json({ error: "toolkitSlug requis." });
  }

  const authConfigs = await composioRequest(
    `/api/v3/auth_configs?toolkit_slug=${encodeURIComponent(
      toolkitSlug
    )}&limit=1&is_composio_managed=true`
  );
  if (!authConfigs.ok) {
    return res.status(authConfigs.status).json({ error: authConfigs.error });
  }

  let authConfigId =
    authConfigs.data?.items?.[0]?.id ||
    authConfigs.data?.items?.[0]?.auth_config?.id;

  if (!authConfigId) {
    const created = await composioRequest("/api/v3/auth_configs", {
      method: "POST",
      body: JSON.stringify({
        toolkit: { slug: toolkitSlug },
        auth_config: {
          name: `${toolkitSlug} (Room)`,
          type: "use_composio_managed_auth",
        },
      }),
    });
    if (!created.ok) {
      return res.status(created.status).json({ error: created.error });
    }
    authConfigId = created.data?.id || created.data?.auth_config?.id;
  }

  if (!authConfigId) {
    return res.status(500).json({ error: "Auth config introuvable." });
  }

  const callbackUrl = `${FRONTEND_URL}/settings?composio=connected&toolkit=${encodeURIComponent(
    toolkitSlug
  )}`;
  const link = await composioRequest("/api/v3/connected_accounts/link", {
    method: "POST",
    body: JSON.stringify({
      auth_config_id: authConfigId,
      user_id: COMPOSIO_USER_ID,
      callback_url: callbackUrl,
    }),
  });
  if (!link.ok) {
    return res.status(link.status).json({ error: link.error });
  }
  return res.json({ redirect_url: link.data?.redirect_url });
});

app.get("/api/microsoft/oauth/start", async (_req, res) => {
  if (!msalClient) {
    return res.status(500).json({
      error:
        "Configuration Microsoft manquante (MICROSOFT_CLIENT_ID/SECRET).",
    });
  }
  const state = randomUUID();
  oauthStateStore.add(state);
  const authCodeUrl = await msalClient.getAuthCodeUrl({
    scopes: microsoftScopes,
    redirectUri: microsoftRedirectUri,
    state,
    prompt: "select_account",
  });
  res.redirect(authCodeUrl);
});

app.get("/api/microsoft/oauth/callback", async (req, res) => {
  if (!msalClient) {
    return res.status(500).send("Configuration Microsoft manquante.");
  }
  const { code, state, error, error_description } = req.query;
  if (error) {
    const message = encodeURIComponent(
      `${error}${error_description ? `: ${error_description}` : ""}`
    );
    return res.redirect(`${FRONTEND_URL}/settings?microsoft=error&message=${message}`);
  }
  if (!code || typeof code !== "string") {
    return res.status(400).send("Code OAuth manquant.");
  }
  if (!state || typeof state !== "string" || !oauthStateStore.has(state)) {
    return res.status(400).send("État OAuth invalide.");
  }
  oauthStateStore.delete(state);
  try {
    const tokenResponse = await msalClient.acquireTokenByCode({
      code,
      scopes: microsoftScopes,
      redirectUri: microsoftRedirectUri,
    });
    microsoftAccount = tokenResponse?.account ?? null;
    return res.redirect(`${FRONTEND_URL}/settings?microsoft=connected`);
  } catch (err) {
    console.error("Erreur OAuth Microsoft:", err);
    return res.redirect(`${FRONTEND_URL}/settings?microsoft=error`);
  }
});

app.get("/api/microsoft/status", async (_req, res) => {
  if (!msalClient) {
    return res.json({ connected: false, error: "Configuration manquante." });
  }
  if (!microsoftAccount) {
    return res.json({ connected: false });
  }
  const profile = await callMicrosoftGraph("/v1.0/me");
  if (!profile.ok) {
    return res.json({ connected: false, error: profile.error });
  }
  return res.json({ connected: true, profile: profile.data });
});

app.post("/api/microsoft/logout", async (_req, res) => {
  microsoftAccount = null;
  return res.json({ connected: false });
});

app.get("/api/microsoft/transcripts", async (_req, res) => {
  const transcripts = await callMicrosoftGraph(
    "/beta/me/onlineMeetings/getAllTranscripts"
  );
  if (!transcripts.ok) {
    return res.status(transcripts.status).json({ error: transcripts.error });
  }
  return res.json(transcripts.data);
});

app.post("/api/generate-transcript-document", async (req, res) => {
  try {
    const {
      documentType,
      documentCategory,
      transcriptContentUrl,
    }: {
      documentType: DocumentType;
      documentCategory: "expert-call" | "meeting-note";
      transcriptContentUrl: string;
    } = req.body;

    if (!documentType || !documentCategory || !transcriptContentUrl) {
      return res.status(400).json({
        error: "Type, catégorie et transcript requis.",
      });
    }

    const transcript = await fetchTranscriptContent(transcriptContentUrl);
    if (!transcript.ok) {
      return res.status(transcript.status).json({ error: transcript.error });
    }

    const title =
      documentCategory === "expert-call"
        ? "Analyse d'un call expert"
        : "Note de réunion";
    const subtitle = "Transcript Microsoft Teams";

    let buffer: Buffer;
    let contentType: string;
    let filename: string;

    if (documentType === "docx") {
      buffer = await generateTranscriptDocx({
        title,
        subtitle,
        transcriptText: transcript.text,
      });
      contentType =
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      filename = `${documentCategory}-transcript.docx`;
    } else {
      buffer = await generateTranscriptPptx({
        title,
        subtitle,
        transcriptText: transcript.text,
      });
      contentType =
        "application/vnd.openxmlformats-officedocument.presentationml.presentation";
      filename = `${documentCategory}-transcript.pptx`;
    }

    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (error) {
    console.error("Erreur génération transcript:", error);
    const message =
      error instanceof Error ? error.message : "Erreur génération transcript";
    if (!res.headersSent) {
      res.status(500).json({ error: message });
    }
  }
});

app.get("/api/admin/organizations", requireAdmin, async (_req, res) => {
  try {
    const clerkClient = createClerkClient({ secretKey: CLERK_SECRET_KEY });
    const orgs = await clerkClient.organizations.getOrganizationList({
      limit: 100,
    });
    return res.json(orgs);
  } catch (error) {
    console.error("Erreur Clerk orgs:", error);
    return res
      .status(500)
      .json({ error: formatClerkError(error, "Erreur Clerk.") });
  }
});

app.post("/api/admin/organizations", requireAdmin, async (req, res) => {
  try {
    const clerkClient = createClerkClient({ secretKey: CLERK_SECRET_KEY });
    const { name, slug } = req.body as { name?: string; slug?: string };
    if (!name) {
      return res.status(400).json({ error: "Nom d'organisation requis." });
    }
    const createdBy = (req as express.Request & { clerkUserId?: string })
      .clerkUserId;
    const org = await clerkClient.organizations.createOrganization({
      name,
      ...(slug ? { slug } : {}),
      ...(createdBy ? { createdBy } : {}),
    });
    return res.json(org);
  } catch (error) {
    console.error("Erreur Clerk create org:", error);
    return res
      .status(500)
      .json({ error: formatClerkError(error, "Erreur Clerk.") });
  }
});

app.get("/api/admin/organizations/:orgId/members", requireAdmin, async (req, res) => {
  try {
    const clerkClient = createClerkClient({ secretKey: CLERK_SECRET_KEY });
    const { orgId } = req.params;
    const members = await clerkClient.organizations.getOrganizationMembershipList(
      { organizationId: orgId, limit: 100 }
    );
    return res.json(members);
  } catch (error) {
    console.error("Erreur Clerk members:", error);
    return res
      .status(500)
      .json({ error: formatClerkError(error, "Erreur Clerk.") });
  }
});

app.delete(
  "/api/admin/organizations/:orgId/members/:userId",
  requireAdmin,
  async (req, res) => {
    try {
      const clerkClient = createClerkClient({ secretKey: CLERK_SECRET_KEY });
      const { orgId, userId } = req.params;
      const membership =
        await clerkClient.organizations.deleteOrganizationMembership({
          organizationId: orgId,
          userId,
        });
      return res.json(membership);
    } catch (error) {
      console.error("Erreur Clerk delete membership:", error);
      return res
        .status(500)
        .json({ error: formatClerkError(error, "Erreur Clerk.") });
    }
  }
);

app.delete("/api/admin/organizations/:orgId", requireAdmin, async (req, res) => {
  try {
    const clerkClient = createClerkClient({ secretKey: CLERK_SECRET_KEY });
    const { orgId } = req.params;
    const org = await clerkClient.organizations.deleteOrganization(orgId);
    return res.json(org);
  } catch (error) {
    console.error("Erreur Clerk delete org:", error);
    return res
      .status(500)
      .json({ error: formatClerkError(error, "Erreur Clerk.") });
  }
});

app.get("/api/admin/organizations/:orgId/invitations", requireAdmin, async (req, res) => {
  try {
    const clerkClient = createClerkClient({ secretKey: CLERK_SECRET_KEY });
    const { orgId } = req.params;
    const invitations = await clerkClient.organizations.getOrganizationInvitationList(
      { organizationId: orgId, limit: 100 }
    );
    return res.json(invitations);
  } catch (error) {
    console.error("Erreur Clerk invitations:", error);
    return res
      .status(500)
      .json({ error: formatClerkError(error, "Erreur Clerk.") });
  }
});

app.post("/api/admin/organizations/:orgId/invitations", requireAdmin, async (req, res) => {
  try {
    const clerkClient = createClerkClient({ secretKey: CLERK_SECRET_KEY });
    const { orgId } = req.params;
    const {
      email,
      role,
      firstName,
      lastName,
    } = req.body as {
      email?: string;
      role?: string;
      firstName?: string;
      lastName?: string;
    };
    if (!email) {
      return res.status(400).json({ error: "Email requis." });
    }
    const inviterUserId = (req as express.Request & { clerkUserId?: string })
      .clerkUserId;
    const inviteRole = role || ADMIN_INVITE_ROLE;
    const publicMetadata = {
      ...(firstName ? { firstName } : {}),
      ...(lastName ? { lastName } : {}),
    };
    const invitation = await clerkClient.organizations.createOrganizationInvitation({
      organizationId: orgId,
      emailAddress: email,
      role: inviteRole,
      ...(Object.keys(publicMetadata).length > 0 ? { publicMetadata } : {}),
      ...(inviterUserId ? { inviterUserId } : {}),
    });
    return res.json(invitation);
  } catch (error) {
    console.error("Erreur Clerk invitation:", error);
    return res
      .status(500)
      .json({ error: formatClerkError(error, "Erreur Clerk.") });
  }
});

app.delete(
  "/api/admin/organizations/:orgId/invitations/:invitationId",
  requireAdmin,
  async (req, res) => {
    try {
      const clerkClient = createClerkClient({ secretKey: CLERK_SECRET_KEY });
      const { orgId, invitationId } = req.params;
      await clerkClient.organizations.revokeOrganizationInvitation({
        organizationId: orgId,
        invitationId,
      });
      return res.json({ ok: true });
    } catch (error) {
      console.error("Erreur Clerk revoke invitation:", error);
      return res
        .status(500)
        .json({ error: formatClerkError(error, "Erreur Clerk.") });
    }
  }
);

app.delete("/api/admin/users/:userId", requireAdmin, async (req, res) => {
  try {
    const clerkClient = createClerkClient({ secretKey: CLERK_SECRET_KEY });
    const { userId } = req.params;
    await clerkClient.users.deleteUser(userId);
    return res.json({ ok: true });
  } catch (error) {
    console.error("Erreur Clerk delete user:", error);
    return res
      .status(500)
      .json({ error: formatClerkError(error, "Erreur Clerk.") });
  }
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Erreur serveur non gérée:", err);
  if (res.headersSent) {
    return;
  }
  const anyErr = err as { type?: string; message?: string };
  if (anyErr?.type === "entity.parse.failed") {
    res.setHeader("Content-Type", "application/json");
    res.status(400).json({ error: "Corps JSON invalide" });
    return;
  }
  const message = anyErr?.message || "Erreur interne du serveur";
  res.setHeader("Content-Type", "application/json");
  res.status(500).json({ error: message });
});

if (process.env.VERCEL !== "1") {
  app.listen(PORT, () => {
    console.log(`🚀 Serveur Express démarré sur le port ${PORT}`);
  });
}

export default app;
