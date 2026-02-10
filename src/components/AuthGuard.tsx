import { Navigate, useLocation } from "react-router-dom";
import { useClerk, useUser } from "@clerk/clerk-react";

const ALLOWED_EMAIL = "gaspard@getroom.io";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();
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
  if (email !== ALLOWED_EMAIL) {
    void signOut();
    return <Navigate to="/login?unauthorized=1" replace />;
  }

  return <>{children}</>;
}
