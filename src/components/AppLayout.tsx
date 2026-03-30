import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

const nav = [
  { to: "/", label: "Team" },
  { to: "/rota", label: "Rota" },
  { to: "/incidents", label: "Report" },
  { to: "/incidents/log", label: "Log" },
  { to: "/map", label: "Map" },
  { to: "/help", label: "Help" },
  { to: "/roles", label: "Roles" },
];

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `block min-h-11 min-w-11 content-center rounded-lg px-4 py-3 text-center text-base font-medium transition-colors sm:inline-block sm:py-2 ${
    isActive
      ? "bg-red-800 text-white"
      : "text-slate-800 hover:bg-slate-200"
  }`;

export function AppLayout() {
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 pb-24 sm:pb-8">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-2 px-4 py-3">
          <Link to="/" className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-slate-900">
              Jalsa 2026 · Fire &amp; Safety
            </span>
            <span className="block truncate text-xs text-slate-500">
              24–26 July · Islamabad, UK
            </span>
          </Link>
          <button
            type="button"
            className="min-h-11 min-w-11 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-800 sm:hidden"
            aria-expanded={open}
            aria-label="Menu"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? "Close" : "Menu"}
          </button>
          <button
            type="button"
            className="hidden min-h-11 rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 sm:inline-block sm:px-4"
            onClick={() => void logout()}
          >
            Log out
          </button>
        </div>
        <nav
          className={`border-t border-slate-100 bg-slate-100/80 sm:block ${open ? "block" : "hidden"}`}
        >
          <div className="mx-auto flex max-w-3xl flex-col gap-1 px-2 py-2 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-2">
            {nav.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={linkClass}
                onClick={() => setOpen(false)}
              >
                {label}
              </NavLink>
            ))}
            <button
              type="button"
              className="min-h-11 rounded-lg px-4 py-3 text-center text-base font-medium text-slate-800 hover:bg-slate-200 sm:hidden"
              onClick={() => void logout()}
            >
              Log out
            </button>
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        <Outlet />
      </main>

      <nav
        className="fixed bottom-0 left-0 right-0 z-40 flex justify-around border-t border-slate-200 bg-white/95 px-1 py-2 backdrop-blur sm:hidden"
        aria-label="Primary"
      >
        {nav.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex min-h-11 flex-1 flex-col items-center justify-center rounded-lg px-1 text-xs font-medium ${
                isActive ? "text-red-800" : "text-slate-600"
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
