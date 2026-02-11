import { useLocation } from "react-router-dom";
import { SignIn } from "@clerk/clerk-react";

export default function Login() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const unauthorized = params.get("unauthorized") === "1";

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto flex min-h-screen max-w-5xl items-center px-6 py-12">
        <div className="grid w-full grid-cols-1 gap-8 rounded-3xl border border-gray-200 bg-white p-8 shadow-2xl md:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wider text-gray-600">
                Accès sécurisé
              </div>
              <h1 className="mt-4 text-3xl font-semibold text-black sm:text-4xl">
                Room.
                <span className="block text-gray-500">
                  Your AI-powered analyst
                </span>
              </h1>
              <p className="mt-4 text-sm text-gray-600">
                Connectez-vous avec Google ou Microsoft pour accéder à vos documents,
                analyses et projets en toute sécurité.
              </p>
            </div>

            <div className="mt-8 space-y-3 text-sm text-gray-600">
              <div className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                Authentification SSO sécurisée.
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                Accès réservé aux utilisateurs autorisés.
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                Données chiffrées et hébergées sur Vercel.
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center">
            {unauthorized && (
              <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                Accès refusé : vous devez être membre d'une organisation pour accéder à Room.
              </div>
            )}

            <div className="flex justify-center">
              <SignIn
                routing="path"
                path="/login"
                forceRedirectUrl="/dashboard"
                fallbackRedirectUrl="/dashboard"
                signUpUrl="/login"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
