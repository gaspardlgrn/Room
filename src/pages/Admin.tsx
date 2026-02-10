import { useEffect, useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { useAuth, useUser } from "@clerk/clerk-react";

type Org = {
  id: string;
  name: string;
  slug: string | null;
  members_count?: number;
};

type Membership = {
  id: string;
  role: string;
  email?: string;
  public_user_data?: {
    identifier?: string;
    first_name?: string | null;
    last_name?: string | null;
    image_url?: string | null;
    user_id?: string;
  };
};

type Invitation = {
  id: string;
  emailAddress: string;
  status: string;
  role: string;
  publicMetadata?: {
    firstName?: string;
    lastName?: string;
  };
};

export default function Admin() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string>("");
  const [members, setMembers] = useState<Membership[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("org:member");
  const [inviteFirstName, setInviteFirstName] = useState("");
  const [inviteLastName, setInviteLastName] = useState("");
  const [inviteOrgId, setInviteOrgId] = useState("");
  const [orgName, setOrgName] = useState("");
  const [orgSlug, setOrgSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    kind: "member" | "invitation" | "organization";
    id: string;
    label: string;
  } | null>(null);
  const selectedOrg = orgs.find((org) => org.id === selectedOrgId) || null;
  const pendingInvitations = invitations.filter(
    (invite) => invite.status === "pending"
  );
  const adminUserId = user?.id || "";
  const adminEmail =
    user?.primaryEmailAddress?.emailAddress?.toLowerCase() || "";
  const visibleMembers = members.filter((member) => {
    const memberId = member.public_user_data?.user_id;
    const memberEmail = member.email?.toLowerCase();
    if (adminUserId && memberId === adminUserId) {
      return false;
    }
    if (adminEmail && memberEmail === adminEmail) {
      return false;
    }
    return true;
  });
  const mergedMembers = [
    ...visibleMembers.map((member) => ({
      type: "member" as const,
      id: member.id,
      name:
        member.public_user_data?.first_name || member.public_user_data?.last_name
          ? `${member.public_user_data?.first_name ?? ""} ${member.public_user_data?.last_name ?? ""}`.trim()
          : "—",
      email: member.email || member.public_user_data?.identifier || "—",
      status: "Actif",
      role: member.role,
      userId: member.public_user_data?.user_id,
    })),
    ...pendingInvitations.map((invite) => ({
      type: "invitation" as const,
      id: invite.id,
      name:
        invite.publicMetadata?.firstName || invite.publicMetadata?.lastName
          ? `${invite.publicMetadata?.firstName ?? ""} ${invite.publicMetadata?.lastName ?? ""}`.trim()
          : "Invité",
      email: invite.emailAddress,
      status: "En attente",
      role: invite.role,
    })),
  ];

  const isAdmin = useMemo(() => {
    const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase() ?? "";
    return email === "gaspard@getroom.io";
  }, [user]);

  const fetchWithAuth = async (path: string, init?: RequestInit) => {
    const token = await getToken();
    const response = await fetch(path, {
      ...init,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(init?.headers || {}),
      },
    });
    if (!response.ok) {
      const text = await response.text();
      try {
        const json = text ? JSON.parse(text) : null;
        const message = json?.error || json?.message;
        throw new Error(message || "Erreur serveur.");
      } catch {
        throw new Error(text || "Erreur serveur.");
      }
    }
    const text = await response.text();
    if (!text) return null;
    return JSON.parse(text);
  };

  const loadOrganizations = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWithAuth("/api/admin/organizations");
      const items = Array.isArray(data?.data) ? data.data : data;
      setOrgs(items || []);
      if (!selectedOrgId && items?.length > 0) {
        setSelectedOrgId(items[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur chargement.");
    } finally {
      setLoading(false);
    }
  };

  const loadMembers = async (orgId: string) => {
    if (!orgId) return;
    try {
      const data = await fetchWithAuth(`/api/admin/organizations/${orgId}/members`);
      const items = Array.isArray(data?.data) ? data.data : data;
      setMembers(items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur chargement membres.");
    }
  };

  const loadInvitations = async (orgId: string) => {
    if (!orgId) return;
    try {
      const data = await fetchWithAuth(
        `/api/admin/organizations/${orgId}/invitations`
      );
      const items = Array.isArray(data?.data) ? data.data : data;
      setInvitations(items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur chargement invitations.");
    }
  };

  useEffect(() => {
    if (isAdmin) {
      void loadOrganizations();
    }
  }, [isAdmin]);

  useEffect(() => {
    if (selectedOrgId) {
      void loadMembers(selectedOrgId);
      void loadInvitations(selectedOrgId);
      return;
    }
    setMembers([]);
    setInvitations([]);
  }, [selectedOrgId]);

  useEffect(() => {
    if (selectedOrgId) {
      setInviteOrgId(selectedOrgId);
    }
  }, [selectedOrgId]);

  const handleInvite = async () => {
    if (!inviteOrgId) {
      setError("Sélectionnez une organisation pour l'invitation.");
      return;
    }
    if (!inviteEmail) return;
    setLoading(true);
    setError(null);
    try {
      await fetchWithAuth(`/api/admin/organizations/${inviteOrgId}/invitations`, {
        method: "POST",
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole,
          firstName: inviteFirstName || undefined,
          lastName: inviteLastName || undefined,
        }),
      });
      setInviteEmail("");
      setInviteFirstName("");
      setInviteLastName("");
      await loadInvitations(selectedOrgId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur invitation.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrganization = async () => {
    if (!orgName.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const payload: { name: string; slug?: string } = { name: orgName.trim() };
      if (orgSlug.trim()) {
        payload.slug = orgSlug.trim();
      }
      const created = await fetchWithAuth("/api/admin/organizations", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setOrgName("");
      setOrgSlug("");
      await loadOrganizations();
      if (created?.id) {
        setSelectedOrgId(created.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur création.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrganization = async (orgId?: string) => {
    if (!orgId) return;
    setConfirmAction({
      kind: "organization",
      id: orgId,
      label: "Supprimer cette organisation ?",
    });
  };

  const confirmDeleteOrganization = async (orgId: string) => {
    setLoading(true);
    setError(null);
    try {
      await fetchWithAuth(`/api/admin/organizations/${orgId}`, { method: "DELETE" });
      await loadOrganizations();
      setSelectedOrgId("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur suppression.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (userId?: string) => {
    if (!userId) return;
    setConfirmAction({
      kind: "member",
      id: userId,
      label: "Retirer ce membre de l'organisation ?",
    });
  };

  const confirmRemoveMember = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      await fetchWithAuth(
        `/api/admin/organizations/${selectedOrgId}/members/${userId}`,
        { method: "DELETE" }
      );
      await loadMembers(selectedOrgId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur suppression.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInvitation = async (invitationId?: string) => {
    if (!invitationId || !selectedOrgId) return;
    setConfirmAction({
      kind: "invitation",
      id: invitationId,
      label: "Supprimer cette invitation ?",
    });
  };

  const confirmDeleteInvitation = async (invitationId: string) => {
    setLoading(true);
    setError(null);
    try {
      await fetchWithAuth(
        `/api/admin/organizations/${selectedOrgId}/invitations/${invitationId}`,
        { method: "DELETE" }
      );
      await loadInvitations(selectedOrgId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur suppression invitation.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!confirmAction) return;
    const action = confirmAction;
    setConfirmAction(null);
    if (action.kind === "organization") {
      await confirmDeleteOrganization(action.id);
      return;
    }
    if (action.kind === "member") {
      await confirmRemoveMember(action.id);
      return;
    }
    await confirmDeleteInvitation(action.id);
  };

  if (!isAdmin) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-black">Accès refusé</h1>
        <p className="mt-2 text-sm text-gray-600">
          Cette page est réservée à l’administrateur.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-black">Administration</h1>
            <p className="mt-2 text-sm text-gray-600">
              Gérez les organisations, membres et invitations.
            </p>
          </div>
          <div className="text-xs text-gray-500">
            Connecté : {user?.primaryEmailAddress?.emailAddress || "—"}
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Nouvelle organisation
            </div>
            <div className="mt-3 space-y-2">
              <input
                type="text"
                value={orgName}
                onChange={(event) => setOrgName(event.target.value)}
                placeholder="Nom de l'organisation"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
              <input
                type="text"
                value={orgSlug}
                onChange={(event) => setOrgSlug(event.target.value)}
                placeholder="Slug (optionnel)"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={handleCreateOrganization}
                className="w-full rounded-md bg-black px-4 py-2 text-sm font-medium text-white"
                disabled={loading || !orgName.trim()}
              >
                Créer l'organisation
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Organisations
            </div>
            <div className="mt-4 space-y-2">
              {orgs.map((org) => (
                <div
                  key={org.id}
                  className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${
                    selectedOrgId === org.id
                      ? "border-blue-200 bg-blue-50 text-blue-700"
                      : "border-gray-100 text-gray-800 hover:bg-gray-50"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedOrgId(org.id)}
                    className="flex-1 text-left"
                  >
                    <div className="font-medium">{org.name}</div>
                    {org.members_count !== undefined && (
                      <div className="text-xs text-gray-500">
                        {org.members_count} membre(s)
                      </div>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteOrganization(org.id)}
                    className="ml-3 rounded-md p-2 text-red-600 hover:bg-red-50"
                    aria-label="Supprimer l'organisation"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {!orgs.length && !loading && (
                <div className="text-sm text-gray-500">Aucune organisation.</div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-sm font-semibold text-gray-800">
                  Invitations en attente
                </div>
                <div className="text-xs text-gray-500">
                  Ajoutez des membres et envoyez une invitation OAuth.
                </div>
              </div>
              {selectedOrg && (
                <div className="text-xs text-gray-500">
                  Organisation :{" "}
                  <span className="text-gray-800">{selectedOrg.name}</span>
                </div>
              )}
            </div>
            <div className="mt-4 grid gap-2 md:grid-cols-2 lg:grid-cols-5">
              <select
                value={inviteOrgId}
                onChange={(event) => setInviteOrgId(event.target.value)}
                className="w-full rounded-md border border-gray-300 px-2 py-2 text-sm md:col-span-2 lg:col-span-1"
              >
                <option value="">Organisation</option>
                {orgs.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={inviteFirstName}
                onChange={(event) => setInviteFirstName(event.target.value)}
                placeholder="Prénom"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
              <input
                type="text"
                value={inviteLastName}
                onChange={(event) => setInviteLastName(event.target.value)}
                placeholder="Nom"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
              <input
                type="email"
                value={inviteEmail}
                onChange={(event) => setInviteEmail(event.target.value)}
                placeholder="email@domaine.com"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
              <select
                value={inviteRole}
                onChange={(event) => setInviteRole(event.target.value)}
                className="rounded-md border border-gray-300 px-2 py-2 text-sm"
              >
                <option value="org:member">Membre</option>
                <option value="org:admin">Admin</option>
              </select>
              <button
                type="button"
                onClick={handleInvite}
                className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white"
                disabled={loading || !inviteEmail || !inviteOrgId}
              >
                Inviter
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-gray-800">Membres</div>
              {selectedOrg && (
                <div className="text-xs text-gray-500">
                  Organisation :{" "}
                  <span className="text-gray-800">{selectedOrg.name}</span>
                </div>
              )}
            </div>
            {!selectedOrgId ? (
              <div className="mt-4 rounded-lg border border-dashed border-gray-200 px-4 py-6 text-sm text-gray-500">
                Sélectionnez une organisation pour afficher ses membres.
              </div>
            ) : (
              <div className="mt-4 divide-y divide-gray-100 rounded-lg border border-gray-100">
                <div className="grid grid-cols-[1fr_1fr_1fr_120px_80px] gap-2 px-3 py-2 text-xs font-semibold uppercase text-gray-500">
                  <span>Membre</span>
                  <span>Email</span>
                  <span>Organisation</span>
                  <span>Statut</span>
                  <span className="text-right">Actions</span>
                </div>
                {mergedMembers.map((member) => (
                  <div
                    key={member.id}
                    className="grid grid-cols-[1fr_1fr_1fr_120px_80px] items-center gap-2 px-3 py-2 text-sm"
                  >
                    <span className="text-gray-900">{member.name}</span>
                    <span className="text-gray-700">{member.email}</span>
                    <span className="text-gray-700">{selectedOrg?.name || "—"}</span>
                    <span className="text-xs text-gray-500">{member.status}</span>
                    <button
                      type="button"
                      onClick={() =>
                        member.type === "member"
                          ? handleRemoveMember(member.userId)
                          : handleDeleteInvitation(member.id)
                      }
                      className="justify-self-end text-xs text-red-600 hover:text-red-700"
                    >
                      {member.type === "member" ? "Retirer" : "Supprimer"}
                    </button>
                  </div>
                ))}
                {!mergedMembers.length && (
                  <div className="px-3 py-3 text-sm text-gray-500">
                    Aucun membre ou invitation pour cette organisation.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-lg">
            <div className="text-base font-semibold text-gray-900">
              Confirmation
            </div>
            <div className="mt-2 text-sm text-gray-600">
              {confirmAction.label}
            </div>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                className="rounded-md border border-gray-300 px-4 py-2 text-sm"
                onClick={() => setConfirmAction(null)}
                disabled={loading}
              >
                Annuler
              </button>
              <button
                type="button"
                className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white"
                onClick={handleConfirm}
                disabled={loading}
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
