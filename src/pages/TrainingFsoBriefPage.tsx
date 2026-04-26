import { Link } from "react-router-dom";
import { TRAINING_FSO_INTRO } from "../data/trainingModuleJalsa";

export function TrainingFsoBriefPage() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Fire Safety Order 2005 (brief)</h1>
        <p className="mt-1 max-w-3xl text-slate-600">
          The Regulatory Reform (Fire Safety) Order 2005 applies to how events are run in the UK.
          Read the summary below, then use the full page for detail.
        </p>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-slate-700">{TRAINING_FSO_INTRO}</p>
        <p className="mt-6">
          <Link
            to="/training/fso-2005-jalsa-uk"
            className="text-base font-semibold text-red-800 underline decoration-red-200 underline-offset-2 hover:decoration-red-800"
          >
            Open: Fire Safety Order 2005 and Jalsa (UK) - full summary
          </Link>
        </p>
      </section>
    </div>
  );
}
