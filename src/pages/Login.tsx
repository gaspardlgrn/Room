import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { instantDb } from "@/integrations/instantdb/client";

export default function Login() {
  const { user, allowed, loading, authError, signInWithProvider } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [callbackError, setCallbackError] = useState<string | null>(null);
  const [isExchanging, setIsExchanging] = useState(false);

  const redirectPath = useMemo(() => {
    const state = location.state as { from?: string } | null;
    return state?.from ?? "/dashboard";
  }, [location.state]);

  useEffect(() => {
    if (!loading && user && allowed) {
      navigate(redirectPath, { replace: true });
    }
  }, [loading, user, allowed, navigate, redirectPath]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const error = params.get("error");
    const errorDescription = params.get("error_description");
    if (error || errorDescription) {
      setCallbackError(errorDescription || error);
      return;
    }
    if (!code || isExchanging) return;

    setIsExchanging(true);
    instantDb.auth
      .exchangeOAuthCode({ code })
      .catch((err) => {
        setCallbackError(err?.body?.message || err?.message || "Connexion impossible.");
      })
      .finally(() => {
        setIsExchanging(false);
        const cleanUrl = `${window.location.origin}/login`;
        window.history.replaceState({}, "", cleanUrl);
      });
  }, [isExchanging]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-center text-2xl font-semibold text-black">
          Connexion requise
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          Connectez-vous pour accéder à l’application.
        </p>

        {(authError || callbackError) && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {callbackError || authError}
          </div>
        )}

        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={() => signInWithProvider("google")}
            className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
            disabled={isExchanging}
          >
            Se connecter avec Google
          </button>
          <button
            type="button"
            onClick={() => signInWithProvider("microsoft")}
            className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
            disabled={isExchanging}
          >
            Se connecter avec Microsoft
          </button>
        </div>

        {isExchanging && (
          <p className="mt-4 text-center text-xs text-gray-500">
            Connexion en cours...
          </p>
        )}

        <p className="mt-6 text-center text-xs text-gray-500">
          Seul l’email gaspard@getroom.io est autorisé.
        </p>
      </div>
    </div>
  );
}
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { RoomLogo } from "@/components/RoomLogo";
import { instantDb } from "@/integrations/instantdb/client";

export default function Login() {
  const { user, allowed, loading, authError, signInWithProvider } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [callbackError, setCallbackError] = useState<string | null>(null);
  const [isExchanging, setIsExchanging] = useState(false);

  const redirectPath = useMemo(() => {
    const state = location.state as { from?: string } | null;
    return state?.from ?? "/";
  }, [location.state]);

  useEffect(() => {
    if (!loading && user && allowed) {
      navigate(redirectPath, { replace: true });
    }
  }, [loading, user, allowed, navigate, redirectPath]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const error = params.get("error");
    const errorDescription = params.get("error_description");
    if (error || errorDescription) {
      setCallbackError(errorDescription || error);
      return;
    }
    if (!code || isExchanging) return;

    setIsExchanging(true);
    instantDb.auth
      .exchangeOAuthCode({ code })
      .catch((err) => {
        setCallbackError(err?.body?.message || err?.message || "Connexion impossible.");
      })
      .finally(() => {
        setIsExchanging(false);
        const cleanUrl = `${window.location.origin}/login`;
        window.history.replaceState({}, "", cleanUrl);
      });
  }, [isExchanging]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="flex items-center justify-center">
          <RoomLogo className="h-10 w-auto" />
        </div>
        <h1 className="mt-6 text-center text-2xl font-semibold text-black">
          Connexion requise
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          Accédez à l’application Room avec Google ou Microsoft.
        </p>

        {(authError || callbackError) && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {callbackError || authError}
          </div>
        )}

        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={() => signInWithProvider("google")}
            className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
            disabled={isExchanging}
          >
            Se connecter avec Google
          </button>
          <button
            type="button"
            onClick={() => signInWithProvider("microsoft")}
            className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
            disabled={isExchanging}
          >
            Se connecter avec Microsoft
          </button>
        </div>

        {isExchanging && (
          <p className="mt-4 text-center text-xs text-gray-500">
            Connexion en cours...
          </p>
        )}

        <p className="mt-6 text-center text-xs text-gray-500">
          Seul l’email {`gaspard@getroom.io`} est autorisé.
        </p>
      </div>
    </div>
  );
}
