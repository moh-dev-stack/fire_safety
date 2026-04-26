import { Link } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { getActiveEvent } from "../data/events";
import { getAdminHomeTabs, getUserHomeTabs } from "../data/homeIntro";

export function HomePage() {
  const { role } = useAuth();
  const isAdmin = role === "admin";
  const event = getActiveEvent();
  const tabs = isAdmin ? getAdminHomeTabs() : getUserHomeTabs();

  return (
    <div className="w-full text-left">
      <h1 className="text-2xl font-bold text-slate-900">Welcome</h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        {event.shortLabel}: use the <span className="font-medium text-slate-800">tabs above</span> (or
        the bar at the bottom on a phone) to move around. Everything below is a quick guide to what
        each one does, in order <span className="whitespace-nowrap">left to right</span>
        {isAdmin ? " on larger screens" : ""}.
      </p>

      <ol className="mt-8 space-y-6 border-l-2 border-red-200 pl-5 sm:pl-6">
        {tabs.map((t, i) => (
          <li key={t.path} className="text-left">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {i + 1}. {t.label}
            </p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900">
              <Link
                to={t.path}
                className="text-red-800 underline decoration-red-200 underline-offset-2 hover:decoration-red-800"
              >
                {t.label}
              </Link>
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">{t.description}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
