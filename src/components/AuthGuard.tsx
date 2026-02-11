import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useClerk, useOrganizationList, useUser } from "@clerk/clerk-react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoaded: isUserLoaded, isSignedIn } = useUser();
  const { userMemberships, isLoaded: isOrgListLoaded } = useOrganizationList({
    userMemberships: { infinite: true },
  });
  const { signOut } = useClerk();
  const location = useLocation();

  const isLoaded = isUserLoaded && isOrgListLoaded;
  const isMemberOfOrg =
    (userMemberships?.data?.length ?? 0) > 0;

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    if (!isMemberOfOrg) {
      signOut?.();
    }
  }, [isLoaded, isSignedIn, isMemberOfOrg, signOut]);

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

  if (!isMemberOfOrg) {
    return <Navigate to="/login?unauthorized=1" replace />;
  }

  return <>{children}</>;
}
