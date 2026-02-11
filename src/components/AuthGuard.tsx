import { Navigate, useLocation } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";

const allowedEmails = (import.meta.env.VITE_ALLOWED_EMAILS || "")
  .split(/[,;\s]+/)
  .map((email: string) => email.toLowerCase())
  .filter(Boolean);

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn, user } = useUser();
  const location = useLocation();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-sm text-gray-700">
        Chargement...
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase() ?? "";
  if (allowedEmails.length > 0 && !allowedEmails.includes(email)) {
    return <Navigate to="/login?unauthorized=1" replace />;
  }

  return <>{children}</>;
}
