import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import * as api from "../lib/api";
import { AuthContext } from "./auth-context";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  const refresh = useCallback(async () => {
    const ok = await api.me();
    setAuthenticated(ok);
  }, []);

  useEffect(() => {
    void (async () => {
      await refresh();
      setReady(true);
    })();
  }, [refresh]);

  const login = useCallback(
    async (username: string, password: string) => {
      await api.login(username, password);
      setAuthenticated(true);
    },
    [],
  );

  const logout = useCallback(async () => {
    await api.logout();
    setAuthenticated(false);
  }, []);

  const value = useMemo(
    () => ({ ready, authenticated, login, logout, refresh }),
    [ready, authenticated, login, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
