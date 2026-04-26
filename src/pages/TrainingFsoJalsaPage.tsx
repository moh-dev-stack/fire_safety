import { Link } from "react-router-dom";
import {
  FSO_CHECKLIST_ITEMS,
  FSO_DUTIES,
  FSO_JALSA_SUMMARY,
  FSO_NON_COMPLIANCE,
} from "../data/trainingFsoJalsaUk";
import fsoPdfUrl from "../assets/pdfs/Fire Safety Order 2005 and Jalsa UK Updated.pdf?url";

const DOWNLOAD_NAME = "Fire-Safety-Order-2005-Jalsa-UK.pdf";

export function TrainingFsoJalsaPage() {
  return (
    <div className="space-y-8 sm:space-y-10">
      <header className="space-y-3">
        <p>
          <Link
            to="/training/fso-2005-brief"
            className="text-sm font-medium text-red-800 underline decoration-red-200 underline-offset-2 hover:decoration-red-800"
          >
            Back to FSO tab
          </Link>
        </p>
        <h1 className="text-2xl font-bold text-slate-900">Fire Safety Order 2005 and Jalsa (UK)</h1>
        <p className="max-w-3xl text-slate-600">
          Short plain-language notes for volunteers. The downloadable PDF is the full reference. If
          anything here conflicts with your on-site H&amp;S or legal brief, follow the brief.
        </p>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">The Order in one sentence</h2>
        <p className="mt-2 text-sm text-slate-700">
          The Regulatory Reform (Fire Safety) Order 2005 expects whoever controls premises (here, the
          event) to take reasonable steps to cut fire risk, plan for emergencies, and work with
          others on site.
        </p>
      </section>

      <div className="space-y-6">
        {FSO_DUTIES.map((duty) => (
          <section
            key={duty.id}
            className="scroll-mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <h2 className="text-base font-semibold text-slate-900">
              {duty.id}. {duty.title}
            </h2>
            <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-slate-700">
              {duty.bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <section className="rounded-xl border border-amber-200 bg-amber-50/50 p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-amber-950">If requirements are not met</h2>
        <ul className="mt-3 list-inside list-disc text-sm text-amber-950/90">
          {FSO_NON_COMPLIANCE.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Jalsa: summary of themes</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[280px] border-collapse text-left text-sm text-slate-700">
            <thead>
              <tr className="border-b border-slate-200 text-slate-900">
                <th className="py-2 pr-3 font-semibold">Area</th>
                <th className="py-2 font-semibold">Required action (headline)</th>
              </tr>
            </thead>
            <tbody>
              {FSO_JALSA_SUMMARY.map((row) => (
                <tr key={row.area} className="border-b border-slate-100">
                  <td className="py-2.5 pr-3 align-top font-medium text-slate-800">{row.area}</td>
                  <td className="py-2.5 align-top">{row.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Compliance checklist (headlines)</h2>
        <p className="mt-1 text-sm text-slate-600">Tick-box table in the PDF; key lines below.</p>
        <ul className="mt-4 space-y-2 text-sm text-slate-700">
          {FSO_CHECKLIST_ITEMS.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="text-slate-400" aria-hidden>
                ·
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section
        className="rounded-xl border border-slate-200 bg-slate-50/80 p-5 shadow-sm"
        aria-labelledby="fso-dl"
      >
        <h2 id="fso-dl" className="text-lg font-semibold text-slate-900">
          Download the full document
        </h2>
        <p className="mt-1 text-sm text-slate-600">Same content as the official PDF; keep offline.</p>
        <a
          href={fsoPdfUrl}
          download={DOWNLOAD_NAME}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex min-h-11 items-center justify-center rounded-lg bg-red-800 px-5 py-3 text-base font-semibold text-white shadow-sm hover:bg-red-900"
        >
          Download Fire Safety Order 2005 and Jalsa (UK) (PDF)
        </a>
      </section>
    </div>
  );
}
