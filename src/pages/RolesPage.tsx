import { dutyRoles, dutyRolesIntro } from "../data/dutyRoles";

export function RolesPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">{dutyRolesIntro.title}</h1>
        <p className="mt-1 text-slate-600">{dutyRolesIntro.subtitle}</p>
        <p className="mt-4 text-slate-700">{dutyRolesIntro.body}</p>
      </header>

      <ul className="space-y-4">
        {dutyRoles.map((role) => (
          <li
            key={role.title}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-red-900">{role.title}</h2>
            <p className="mt-2 text-sm text-slate-700">{role.summary}</p>
            {role.tips && role.tips.length > 0 ? (
              <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-slate-600">
                {role.tips.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
