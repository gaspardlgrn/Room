import { useEffect, useMemo, useState } from "react";
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
  email_address: string;
  status: string;
  role: string;
};

export default function Admin() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string>("");
  const [members, setMembers] = useState<Membership[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    kind: "user" | "invitation";
    id: string;
    label: string;
  } | null>(null);

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
      throw new Error(text || "Erreur serveur.");
    }
    return response.json();
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
    }
  }, [selectedOrgId]);

  const handleInvite = async () => {
    if (!inviteEmail || !selectedOrgId) return;
    setLoading(true);
    setError(null);
    try {
      await fetchWithAuth(`/api/admin/organizations/${selectedOrgId}/invitations`, {
        method: "POST",
        body: JSON.stringify({ email: inviteEmail }),
      });
      setInviteEmail("");
      await loadInvitations(selectedOrgId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur invitation.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId?: string) => {
    if (!userId) return;
    setConfirmAction({ kind: "user", id: userId, label: "Supprimer cet utilisateur ?" });
  };

  const confirmDeleteUser = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      await fetchWithAuth(`/api/admin/users/${userId}`, { method: "DELETE" });
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
    if (action.kind === "user") {
      await confirmDeleteUser(action.id);
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
        <h1 className="text-2xl font-semibold text-black">Administration</h1>
        <p className="mt-2 text-sm text-gray-600">
          Gérez les utilisateurs et les droits d’accès via Clerk.
        </p>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-[260px_1fr]">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-600">
            Organisations
          </div>
          <div className="mt-3 space-y-2">
            {orgs.map((org) => (
              <button
                key={org.id}
                type="button"
                onClick={() => setSelectedOrgId(org.id)}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                  selectedOrgId === org.id
                    ? "bg-blue-50 text-blue-700"
                    : "hover:bg-gray-50 text-gray-800"
                }`}
              >
                {org.name}
              </button>
            ))}
            {!orgs.length && !loading && (
              <div className="text-sm text-gray-500">Aucune organisation.</div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-sm font-semibold text-gray-800">
                  Invitations
                </div>
                <div className="text-xs text-gray-500">
                  Envoyez une invitation par email.
                </div>
              </div>
              <div className="flex flex-1 gap-2 md:max-w-md">
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(event) => setInviteEmail(event.target.value)}
                  placeholder="email@domaine.com"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={handleInvite}
                  className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white"
                  disabled={loading || !inviteEmail}
                >
                  Inviter
                </button>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {invitations.map((invite) => (
                <div
                  key={invite.id}
                  className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2 text-sm"
                >
                  <span>{invite.email_address}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs uppercase text-gray-500">
                      {invite.status}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteInvitation(invite.id)}
                      className="text-xs text-red-600 hover:text-red-700"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
              {!invitations.length && (
                <div className="text-sm text-gray-500">Aucune invitation.</div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="text-sm font-semibold text-gray-800">Membres</div>
            <div className="mt-3 space-y-2">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex flex-col gap-2 rounded-lg border border-gray-100 px-3 py-2 text-sm md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <div className="text-gray-900">
                      {member.public_user_data?.identifier ||
                        member.public_user_data?.user_id}
                    </div>
                    <div className="text-xs text-gray-500">{member.role}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteUser(member.public_user_data?.user_id)}
                    className="text-xs text-red-600 hover:text-red-700"
                  >
                    Supprimer
                  </button>
                </div>
              ))}
              {!members.length && (
                <div className="text-sm text-gray-500">Aucun membre.</div>
              )}
            </div>
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
