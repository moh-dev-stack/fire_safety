import { Link } from "react-router-dom";
import { helpIntro, helpSections } from "../data/help";

export function HelpPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">{helpIntro.title}</h1>
        <p className="mt-1 text-slate-600">{helpIntro.subtitle}</p>
        <p className="mt-4 text-slate-700">{helpIntro.lead}</p>
      </header>

      <ul className="space-y-4">
        {helpSections.map((section) => (
          <li
            key={section.title}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-red-900">{section.title}</h2>
            <div className="mt-3 space-y-2 text-sm text-slate-700">
              {section.paragraphs.map((p, i) => (
                <p key={`${section.title}-${i}`}>{p}</p>
              ))}
            </div>
          </li>
        ))}
      </ul>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-red-900">Log a non-urgent incident</h2>
        <p className="mt-2 text-sm text-slate-700">
          When appropriate, record details using the duty report so the fire &amp; safety log stays
          complete.
        </p>
        <Link
          to="/incidents"
          className="mt-4 inline-flex min-h-11 items-center justify-center rounded-lg bg-red-800 px-4 py-3 text-base font-semibold text-white hover:bg-red-900"
        >
          Go to Report
        </Link>
      </section>
    </div>
  );
}
