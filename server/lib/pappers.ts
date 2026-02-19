/**
 * API Pappers - Données entreprises françaises (RCS, BODACC, INPI)
 * https://www.pappers.fr/api
 */

const PAPPERS_BASE = "https://api.pappers.fr/v1";

export type PappersEntreprise = {
  siren?: string;
  siret?: string;
  nom_entreprise?: string;
  siege?: {
    adresse?: string;
    code_postal?: string;
    ville?: string;
  };
  forme_juridique?: string;
  date_creation?: string;
  date_radiation?: string;
  categorie_entreprise?: string;
  tranche_effectif_salarie?: string;
  annee_effectif_salarie?: number;
  capital?: number;
  chiffre_affaires?: number;
  resultat?: number;
  annee_chiffre_affaires?: number;
  annee_resultat?: number;
  dirigeants?: Array<{
    nom?: string;
    prenoms?: string;
    date_naissance?: string;
    fonction?: string;
  }>;
  beneficiaires_effectifs?: Array<{
    nom?: string;
    prenoms?: string;
    date_naissance?: string;
  }>;
  [key: string]: unknown;
};

export type PappersSearchResult = {
  resultats?: PappersEntreprise[];
  total?: number;
  page?: number;
  par_page?: number;
};

/**
 * Recherche d'entreprises par nom ou SIREN.
 * Retourne les données les plus à jour (Pappers agrège RCS, BODACC, INPI).
 */
export async function pappersSearch(
  query: string,
  apiToken: string,
  limit = 5
): Promise<PappersEntreprise[]> {
  if (!apiToken?.trim() || !query?.trim()) return [];

  const q = query.trim().slice(0, 200);
  const params = new URLSearchParams({
    api_token: apiToken,
    q,
    par_page: String(Math.min(limit, 20)),
    page: "1",
  });

  try {
    const res = await fetch(`${PAPPERS_BASE}/recherche?${params.toString()}`, {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("[Pappers] Erreur API:", res.status, text.slice(0, 300));
      return [];
    }

    const data = (await res.json()) as PappersSearchResult & {
      resultats?: unknown[];
      entreprises?: unknown[];
    };
    const resultats =
      data?.resultats ?? data?.entreprises ?? [];
    return Array.isArray(resultats) ? (resultats as PappersEntreprise[]).slice(0, limit) : [];
  } catch (err) {
    console.error("[Pappers] Erreur:", err);
    return [];
  }
}

/**
 * Récupère une entreprise par SIREN (données détaillées).
 */
export async function pappersEntreprise(
  siren: string,
  apiToken: string
): Promise<PappersEntreprise | null> {
  if (!apiToken?.trim() || !siren?.trim()) return null;

  const params = new URLSearchParams({
    api_token: apiToken,
    siren: siren.replace(/\s/g, ""),
  });

  try {
    const res = await fetch(`${PAPPERS_BASE}/entreprise?${params.toString()}`, {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    if (!res.ok) return null;

    const data = (await res.json()) as PappersEntreprise;
    return data?.siren ? data : null;
  } catch {
    return null;
  }
}

/**
 * Formate les données Pappers pour le contexte IA.
 * Inclut les dates pour que l'IA puisse choisir la donnée la plus à jour.
 */
export function formatPappersContext(entreprises: PappersEntreprise[]): string {
  if (entreprises.length === 0) return "";

  const blocks = entreprises.map((e, i) => {
    const siege = e.siege;
    const adresse = siege
      ? [siege.adresse, siege.code_postal, siege.ville].filter(Boolean).join(", ")
      : "";
    const dirigeants = e.dirigeants
      ?.map((d) => `${d.prenoms || ""} ${d.nom || ""} (${d.fonction || ""})`.trim())
      .filter(Boolean)
      .join(", ");
    const ca = e.chiffre_affaires != null ? `${e.chiffre_affaires.toLocaleString("fr-FR")} €` : "";
    const caYear = e.annee_chiffre_affaires ?? e.annee_resultat;
    const resultat = e.resultat != null ? `${e.resultat.toLocaleString("fr-FR")} €` : "";
    const effectif = e.tranche_effectif_salarie ?? "";
    const effectifYear = e.annee_effectif_salarie;

    return `[${i + 1}] ${e.nom_entreprise ?? "N/A"} (SIREN: ${e.siren ?? "N/A"})
- Création: ${e.date_creation ?? "N/A"}${e.date_radiation ? ` | Radiation: ${e.date_radiation}` : ""}
- Forme juridique: ${e.forme_juridique ?? "N/A"}
- Siège: ${adresse || "N/A"}
- Chiffre d'affaires: ${ca || "N/A"}${caYear ? ` (exercice ${caYear})` : ""}
- Résultat: ${resultat || "N/A"}
- Effectifs: ${effectif || "N/A"}${effectifYear ? ` (${effectifYear})` : ""}
- Dirigeants: ${dirigeants || "N/A"}
- Capital: ${e.capital != null ? `${e.capital.toLocaleString("fr-FR")} €` : "N/A"}`;
  });

  return (
    "Données Pappers (RCS, BODACC, INPI - sources officielles françaises, mises à jour régulièrement):\n\n" +
    blocks.join("\n\n---\n\n")
  );
}
