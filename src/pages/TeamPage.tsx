import { teamIntro, teamGroups } from "../data/team";

export function TeamPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">{teamIntro.title}</h1>
        <p className="mt-1 text-slate-600">{teamIntro.subtitle}</p>
        <p className="mt-4 text-slate-700">{teamIntro.body}</p>
      </header>
      <ul className="space-y-4">
        {teamGroups.map((g) => (
          <li
            key={g.title}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-red-900">{g.title}</h2>
            <p className="mt-3 text-sm text-slate-700">{g.body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
