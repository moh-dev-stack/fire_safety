import { Link } from "react-router-dom";
import { helpIntro, helpSections } from "../data/help";

export function HelpPage() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <header className="text-pretty">
        <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          {helpIntro.title}
        </h1>
        <p className="mt-2 text-base leading-snug text-slate-600 sm:leading-normal">
          {helpIntro.subtitle}
        </p>
        <p className="mt-4 text-base leading-relaxed text-slate-700">
          {helpIntro.lead}
        </p>
      </header>

      <ul className="space-y-3 sm:space-y-4">
        {helpSections.map((section) => (
          <li
            key={section.title}
            className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm sm:p-5"
          >
            <h2 className="text-base font-semibold leading-snug text-red-900 sm:text-lg">
              {section.title}
            </h2>
            <div className="mt-3 space-y-3 text-base leading-relaxed text-slate-700">
              {section.paragraphs.map((p, i) => (
                <p key={`${section.title}-${i}`}>{p}</p>
              ))}
            </div>
          </li>
        ))}
      </ul>

      <section className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="text-base font-semibold leading-snug text-red-900 sm:text-lg">
          Log a non-urgent incident
        </h2>
        <p className="mt-2 text-base leading-relaxed text-slate-700">
          When appropriate, record details using the duty report so the fire &amp; safety log stays
          complete.
        </p>
        <Link
          to="/incidents"
          className="mt-4 flex min-h-12 w-full items-center justify-center rounded-xl bg-red-800 px-4 py-3.5 text-base font-semibold text-white active:bg-red-900 sm:inline-flex sm:w-auto sm:min-h-11 sm:rounded-lg sm:py-3 sm:hover:bg-red-900"
        >
          Go to Report
        </Link>
      </section>
    </div>
  );
}
