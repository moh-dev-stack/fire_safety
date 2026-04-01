import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import * as api from "../lib/api";
import type { SessionRole } from "../model/sessionRole";
import { AuthContext } from "./auth-context";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [role, setRole] = useState<SessionRole | null>(null);

  const refresh = useCallback(async () => {
    const r = await api.me();
    if (r.ok) {
      setAuthenticated(true);
      setRole(r.role);
    } else {
      setAuthenticated(false);
      setRole(null);
    }
  }, []);

  useEffect(() => {
    void (async () => {
      await refresh();
      setReady(true);
    })();
  }, [refresh]);

  const login = useCallback(async (username: string, password: string) => {
    await api.login(username, password);
    const r = await api.me();
    if (!r.ok) {
      setAuthenticated(false);
      setRole(null);
      throw new Error("Session could not be established");
    }
    setAuthenticated(true);
    setRole(r.role);
  }, []);

  const logout = useCallback(async () => {
    await api.logout();
    setAuthenticated(false);
    setRole(null);
  }, []);

  const value = useMemo(
    () => ({ ready, authenticated, role, login, logout, refresh }),
    [ready, authenticated, role, login, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
