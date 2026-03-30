import { createContext } from "react";

export type AuthContextValue = {
  ready: boolean;
  authenticated: boolean;
  login: (password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
