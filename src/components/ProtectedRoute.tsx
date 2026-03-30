import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { ready, authenticated } = useAuth();
  const location = useLocation();

  if (!ready) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-slate-600">
        Loading…
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}
