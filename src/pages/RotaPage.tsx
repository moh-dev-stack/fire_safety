import type { RotaEntry } from "../data/rota";
import { rotaDays } from "../data/rota";

function formatDate(iso: string) {
  return new Date(iso + "T12:00:00").toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function ShiftRows({ entries }: { entries: readonly RotaEntry[] }) {
  return (
    <div className="divide-y divide-slate-100">
      {entries.map((e, i) => (
        <div
          key={i}
          className="grid gap-2 px-4 py-4 sm:grid-cols-[1fr_2fr]"
        >
          <div className="font-medium text-red-900">{e.time}</div>
          <div>
            <p className="font-medium text-slate-900">{e.people}</p>
            {e.notes ? (
              <p className="mt-1 text-sm text-slate-600">{e.notes}</p>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}

export function RotaPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Duty rota</h1>
        <p className="mt-1 text-slate-600">
          Two <strong>day</strong> shifts and two <strong>night</strong> shifts per day (placeholder
          names and times - replace with your final rota).
        </p>
      </header>
      <div className="space-y-6">
        {rotaDays.map((day) => (
          <section
            key={day.dateIso}
            className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
          >
            <h2 className="border-b border-slate-100 bg-slate-50 px-4 py-3 text-lg font-semibold text-slate-900">
              {day.label} · {formatDate(day.dateIso)}
            </h2>

            <div className="border-b border-slate-200 bg-amber-50/60 px-4 py-2">
              <h3 className="text-sm font-bold uppercase tracking-wide text-amber-950">
                Day shifts (2)
              </h3>
            </div>
            <ShiftRows entries={day.dayShifts} />

            <div className="border-b border-t border-slate-200 bg-slate-800 px-4 py-2 text-white">
              <h3 className="text-sm font-bold uppercase tracking-wide text-slate-100">
                Night shifts (2)
              </h3>
            </div>
            <ShiftRows entries={day.nightShifts} />
          </section>
        ))}
      </div>
    </div>
  );
}
