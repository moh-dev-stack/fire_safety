import { dutyRoles, dutyRolesIntro } from "../data/dutyRoles";

export function RolesPage() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <header className="text-pretty">
        <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          {dutyRolesIntro.title}
        </h1>
        <p className="mt-2 text-base leading-snug text-slate-600 sm:leading-normal">
          {dutyRolesIntro.subtitle}
        </p>
        <p className="mt-4 text-base leading-relaxed text-slate-700">
          {dutyRolesIntro.body}
        </p>
      </header>

      <ul className="space-y-3 sm:space-y-4">
        {dutyRoles.map((role) => (
          <li
            key={role.title}
            className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm sm:p-5"
          >
            <h2 className="text-base font-semibold leading-snug text-red-900 sm:text-lg">
              {role.title}
            </h2>
            <p className="mt-2 text-base leading-relaxed text-slate-700">
              {role.summary}
            </p>
            {role.tips && role.tips.length > 0 ? (
              <ul className="mt-3 list-disc space-y-2 pl-5 text-base leading-relaxed text-slate-600 marker:text-red-800">
                {role.tips.map((t) => (
                  <li key={t} className="pl-0.5">
                    {t}
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
