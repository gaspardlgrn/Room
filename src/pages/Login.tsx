import { useSignIn } from "@clerk/clerk-react";
import { useLocation } from "react-router-dom";

export default function Login() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const unauthorized = params.get("unauthorized") === "1";
  const { isLoaded, signIn } = useSignIn();

  const handleOAuth = (strategy: "oauth_google" | "oauth_microsoft") => {
    if (!isLoaded || !signIn) return;
    void signIn.authenticateWithRedirect({
      strategy,
      redirectUrl: "/login/sso-callback",
      redirectUrlComplete: "/dashboard",
    });
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-center text-2xl font-semibold text-black">
          Connexion requise
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          Connectez-vous pour accéder à l’application.
        </p>

        {unauthorized && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Accès refusé : cet email n'est pas autorisé.
          </div>
        )}

        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={() => handleOAuth("oauth_google")}
            className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
            disabled={!isLoaded}
          >
            Se connecter avec Google
          </button>
          <button
            type="button"
            onClick={() => handleOAuth("oauth_microsoft")}
            className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
            disabled={!isLoaded}
          >
            Se connecter avec Microsoft
          </button>
          {!isLoaded && (
            <p className="text-center text-xs text-gray-500">
              Chargement de l’authentification...
            </p>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-gray-500">
          Seul l’email gaspard@getroom.io est autorisé.
        </p>
      </div>
    </div>
  );
}
