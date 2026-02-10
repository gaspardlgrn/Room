import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { User } from "@instantdb/react";
import { instantDb } from "@/integrations/instantdb/client";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  allowed: boolean;
  authError: string | null;
  signInWithProvider: (provider: "google" | "microsoft") => void;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const ALLOWED_EMAIL = "gaspard@getroom.io";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user: instantUser, isLoading, error } = instantDb.useAuth();
  const [allowed, setAllowed] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) {
      setAllowed(false);
      setAuthError(null);
      return;
    }

    if (!instantUser?.email) {
      setAllowed(false);
      setAuthError(error?.message ?? null);
      return;
    }

    const normalizedEmail = instantUser.email.toLowerCase();
    if (normalizedEmail !== ALLOWED_EMAIL) {
      setAllowed(false);
      setAuthError("Accès refusé : cet email n'est pas autorisé.");
      void instantDb.auth.signOut();
      return;
    }

    setAllowed(true);
    setAuthError(null);
  }, [instantUser, isLoading, error]);

  const signInWithProvider = useCallback((provider: "google" | "microsoft") => {
    setAuthError(null);
    const url = instantDb.auth.createAuthorizationURL({
      clientName: provider,
      redirectURL: `${window.location.origin}/login`,
    });
    window.location.assign(url);
  }, []);

  const signOut = useCallback(async () => {
    await instantDb.auth.signOut();
  }, []);

  const value = useMemo(
    () => ({
      user: instantUser ?? null,
      loading: isLoading,
      allowed,
      authError,
      signInWithProvider,
      signOut,
    }),
    [instantUser, isLoading, allowed, authError, signInWithProvider, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth doit être utilisé dans AuthProvider.");
  }
  return ctx;
}
