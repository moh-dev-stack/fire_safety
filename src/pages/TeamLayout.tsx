import { NavLink, Outlet } from "react-router-dom";

const baseTab =
  "min-h-11 shrink-0 rounded-t-lg border border-b-0 border-slate-200 px-4 py-2.5 text-left text-sm font-semibold sm:px-5 sm:text-base";
const activeTab = "bg-white text-slate-900 ring-1 ring-slate-200";
const idleTab = "bg-slate-100/80 text-slate-600 hover:bg-slate-100";

export function TeamLayout() {
  return (
    <div>
      <div
        className="flex flex-wrap gap-1 border-b border-slate-200 pb-px"
        role="tablist"
        aria-label="Team sections"
      >
        <NavLink
          to="/team"
          end
          role="tab"
          className={({ isActive }) => `${baseTab} ${isActive ? activeTab : idleTab}`}
        >
          Overview
        </NavLink>
        <NavLink
          to="/team/roles"
          role="tab"
          className={({ isActive }) => `${baseTab} ${isActive ? activeTab : idleTab}`}
        >
          Roles
        </NavLink>
        <NavLink
          to="/team/rota"
          role="tab"
          className={({ isActive }) => `${baseTab} ${isActive ? activeTab : idleTab}`}
        >
          Rota
        </NavLink>
      </div>
      <div className="pt-6 sm:pt-8">
        <Outlet />
      </div>
    </div>
  );
}
