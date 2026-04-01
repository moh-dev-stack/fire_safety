import { createContext } from "react";
import type { SessionRole } from "../model/sessionRole";

export type { SessionRole };

export type AuthContextValue = {
  ready: boolean;
  authenticated: boolean;
  role: SessionRole | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
