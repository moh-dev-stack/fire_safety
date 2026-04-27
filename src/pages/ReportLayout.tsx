import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

const baseTab =
  "min-h-10 shrink-0 rounded-t-lg border border-b-0 border-slate-200 px-3 py-2 text-left text-sm font-semibold sm:px-4 sm:text-base";
const activeTab = "bg-white text-slate-900 ring-1 ring-slate-200";
const idleTab = "bg-slate-100/80 text-slate-600 hover:bg-slate-100";

/** Report + Log in one place; Log tab only for admins. */
export function ReportLayout() {
  const { role } = useAuth();
  const showLogTab = role === "admin";

  return (
    <div>
      {showLogTab ? (
        <div
          className="flex flex-wrap gap-1 border-b border-slate-200 pb-px"
          role="tablist"
          aria-label="Report and log"
        >
          <NavLink
            to="/incidents"
            end
            role="tab"
            className={({ isActive }) => `${baseTab} ${isActive ? activeTab : idleTab}`}
          >
            Report
          </NavLink>
          <NavLink
            to="/incidents/log"
            role="tab"
            className={({ isActive }) => `${baseTab} ${isActive ? activeTab : idleTab}`}
          >
            Log
          </NavLink>
        </div>
      ) : null}
      <div className={showLogTab ? "pt-5 sm:pt-6" : undefined}>
        <Outlet />
      </div>
    </div>
  );
}
