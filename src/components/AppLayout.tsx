import { useMemo, useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import {
  ENABLE_TRAINING_MODULE,
  ENABLE_VENUE_CHECKLIST,
} from "../config/features";
import { formatEventHeaderSubtitle, getActiveEvent } from "../data/events";

const navHome = { to: "/", label: "Home" } as const;
const navBaseBeforeReport = [
  { to: "/team", label: "Team" },
  { to: "/rota", label: "Rota" },
] as const;
const navTraining = { to: "/training", label: "Training" } as const;
const navRedBook = { to: "/training/red-book-2025", label: "Red Book" } as const;
const navVenue = { to: "/venue-checklist", label: "Venue" } as const;
const navRest = [
  { to: "/incidents", label: "Report" },
  { to: "/incidents/log", label: "Log" },
  { to: "/map", label: "Map" },
  { to: "/help", label: "Help" },
  { to: "/roles", label: "Roles" },
] as const;

const adminNav = [
  navHome,
  ...navBaseBeforeReport,
  ...(ENABLE_TRAINING_MODULE ? [navTraining, navRedBook] : []),
  ...(ENABLE_VENUE_CHECKLIST ? [navVenue] : []),
  ...navRest,
] as const;

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `block min-h-11 min-w-11 content-center rounded-lg px-4 py-3 text-center text-base font-medium transition-colors sm:inline-block sm:py-2 ${
    isActive
      ? "bg-red-800 text-white"
      : "text-slate-800 hover:bg-slate-200"
  }`;

export function AppLayout() {
  const { logout, role } = useAuth();
  const [open, setOpen] = useState(false);
  const activeEvent = getActiveEvent();

  const nav = useMemo(() => {
    if (role === "user") {
      const items: { readonly to: string; readonly label: string }[] = [
        navHome,
        { to: "/incidents", label: "Report" },
      ];
      if (ENABLE_TRAINING_MODULE) items.push(navTraining);
      items.push({ to: "/help", label: "Help" });
      return items;
    }
    return adminNav;
  }, [role]);

  const homeLink = "/";

  return (
    <div className="min-h-screen bg-slate-50 pb-[calc(5.25rem+env(safe-area-inset-bottom,0px))] sm:pb-8">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            <Link to={homeLink} className="min-w-0 flex-1 text-left">
              <span className="block truncate text-sm font-semibold text-slate-900">
                {activeEvent.shortLabel}
              </span>
              <span className="block truncate text-xs text-slate-500">
                {formatEventHeaderSubtitle(activeEvent)}
              </span>
            </Link>
          </div>
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
          <div className="mx-auto flex max-w-3xl flex-col gap-1 px-2 py-2 sm:flex-row sm:flex-wrap sm:justify-start sm:gap-2">
            {nav.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
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

      <main className="mx-auto max-w-3xl px-3 py-5 sm:px-4 sm:py-6">
        <Outlet />
      </main>

      <nav
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur sm:hidden"
        aria-label="Primary"
      >
        <div className="flex justify-start gap-0.5 overflow-x-auto overflow-y-hidden overscroll-x-contain px-2 py-1.5 pb-[max(0.35rem,env(safe-area-inset-bottom))] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {nav.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex min-h-12 min-w-[3.65rem] shrink-0 flex-col items-center justify-center rounded-xl px-1.5 text-center text-[11px] font-semibold leading-tight tracking-tight transition-colors ${
                  isActive
                    ? "bg-red-800 text-white shadow-sm"
                    : "text-slate-600 active:bg-slate-100"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
