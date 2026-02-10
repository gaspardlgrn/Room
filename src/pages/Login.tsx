import { useLocation } from "react-router-dom";
import { SignIn } from "@clerk/clerk-react";

export default function Login() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const unauthorized = params.get("unauthorized") === "1";

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -bottom-20 right-0 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.06),_transparent_55%)]" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-5xl items-center px-6 py-12">
        <div className="grid w-full grid-cols-1 gap-8 rounded-3xl border border-gray-200 bg-white/80 p-8 shadow-2xl backdrop-blur md:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wider text-gray-600">
                Accès sécurisé
              </div>
              <h1 className="mt-4 text-3xl font-semibold text-black sm:text-4xl">
                Room.
                <span className="block text-gray-500">
                  Console d’analyses d’investissement
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
                Accès refusé : cet email n'est pas autorisé.
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
