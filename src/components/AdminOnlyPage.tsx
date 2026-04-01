import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

/** For routes that must not be shown to the `user` login tier (POC shell). */
export function AdminOnlyPage({ children }: { children: ReactNode }) {
  const { role } = useAuth();
  if (role === "user") return <Navigate to="/incidents" replace />;
  return <>{children}</>;
}
