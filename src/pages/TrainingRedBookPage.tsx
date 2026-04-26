import { Link } from "react-router-dom";
import { RED_BOOK_2025_DEPARTMENTS, RED_BOOK_2025_INTRO } from "../data/trainingRedBook2025";
import redBookPdfUrl from "../assets/pdfs/2025 Red Book Points.pdf?url";

const DOWNLOAD_NAME = "2025-Red-Book-Points.pdf";

export function TrainingRedBookPage() {
  return (
    <div className="space-y-8 sm:space-y-10">
      <header className="space-y-3">
        <p>
          <Link
            to="/training"
            className="text-sm font-medium text-red-800 underline decoration-red-200 underline-offset-2 hover:decoration-red-800"
          >
            Back to training
          </Link>
        </p>
        <h1 className="text-2xl font-bold text-slate-900">2025 Red Book points</h1>
        {RED_BOOK_2025_INTRO.map((p) => (
          <p key={p} className="max-w-3xl text-slate-600">
            {p}
          </p>
        ))}
      </header>

      <div className="space-y-6">
        {RED_BOOK_2025_DEPARTMENTS.map((dept) => (
          <section
            key={dept.name}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-slate-900">{dept.name}</h2>
            <div className="mt-4 space-y-5">
              {dept.themes.map((t) => (
                <div key={t.title} className="border-l-2 border-red-200 pl-4">
                  <h3 className="text-base font-medium text-slate-900">{t.title}</h3>
                  <p className="mt-2 text-sm text-slate-700">{t.summary}</p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <section
        className="rounded-xl border border-slate-200 bg-slate-50/80 p-5 shadow-sm"
        aria-labelledby="redbook-dl"
      >
        <h2 id="redbook-dl" className="text-lg font-semibold text-slate-900">
          Download the full Red Book (PDF)
        </h2>
        <p className="mt-1 text-sm text-slate-600">Full table and notes as circulated.</p>
        <a
          href={redBookPdfUrl}
          download={DOWNLOAD_NAME}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex min-h-11 items-center justify-center rounded-lg bg-red-800 px-5 py-3 text-base font-semibold text-white shadow-sm hover:bg-red-900"
        >
          Download 2025 Red Book Points (PDF)
        </a>
      </section>
    </div>
  );
}
