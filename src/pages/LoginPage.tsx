import { useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

export function LoginPage() {
  const { authenticated, login } = useAuth();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } } | null)
    ?.from?.pathname;

  const [password, setPassword] = useState("1234");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (authenticated) {
    return <Navigate to={from && from !== "/login" ? from : "/"} replace />;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await login(password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col justify-center bg-slate-100 px-4 py-10">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">
          Fire &amp; Safety — Jalsa 2026
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Sign in with the team password (24–26 July 2026). Password is{" "}
          <strong>1234</strong>.
        </p>
        <form onSubmit={(e) => void onSubmit(e)} className="mt-8 space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-base text-slate-900"
              required
            />
          </div>
          {error ? (
            <p className="text-sm text-red-700" role="alert">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={busy}
            className="min-h-11 w-full rounded-lg bg-red-800 px-4 py-3 text-base font-semibold text-white hover:bg-red-900 disabled:opacity-60"
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
