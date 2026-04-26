import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import {
  EXTINGUISHER_TYPES,
  FIRE_CLASSES_UK,
  FIRE_EXTINGUISHER_QUIZ,
  TRAINING_EXTINGUISHER_CHART,
  TRAINING_FIRE_TRIANGLE,
} from "../data/trainingFireExtinguishers";
import {
  TRAINING_CROWD_CONTROL,
  TRAINING_EVACUATION,
  TRAINING_FIRE_ACTION_STEPS,
  TRAINING_KEY_TERMS_FLASHPOINT,
  TRAINING_LEARNING_OUTCOMES,
  TRAINING_PREVENTION_KEK,
} from "../data/trainingModuleJalsa";
import { publicAsset } from "../lib/publicAsset";
import mainModulePdfUrl from "../assets/pdfs/Fire & Safety Module UPDATED.pdf?url";

const LAST_SCORE_KEY = "fire-safety-training-extinguishers-last-score-v2";
const MODULE_DOWNLOAD_NAME = "Jalsa-Fire-Safety-Training-Module.pdf";

export function TrainingModulePage() {
  const { role } = useAuth();
  const isAdmin = role === "admin";
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const allAnswered = FIRE_EXTINGUISHER_QUIZ.every(
    (q) => typeof answers[q.id] === "number",
  );

  const score = useMemo(() => {
    let correct = 0;
    for (const q of FIRE_EXTINGUISHER_QUIZ) {
      if (answers[q.id] === q.correctIndex) correct++;
    }
    return correct;
  }, [answers]);

  useEffect(() => {
    if (!allAnswered) return;
    try {
      localStorage.setItem(
        LAST_SCORE_KEY,
        JSON.stringify({
          at: new Date().toISOString(),
          score,
          total: FIRE_EXTINGUISHER_QUIZ.length,
        }),
      );
    } catch {
      /* ignore */
    }
  }, [allAnswered, score]);

  function onReset() {
    setAnswers({});
  }

  return (
    <div className="space-y-8 sm:space-y-10">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Fire &amp; safety training</h1>
        <p className="mt-1 max-w-3xl text-slate-600">
          Learning outcomes, procedures, extinguishers, and a check - aligned to the Jalsa training
          module. Confirm equipment and on-site process with your H&amp;S lead. Use the{" "}
          <span className="font-medium text-slate-800">Fire Safety Order 2005</span> tab above for
          the legal brief and link to the full summary.
        </p>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Learning outcomes</h2>
        <ul className="mt-4 list-inside list-disc space-y-2 text-sm text-slate-700">
          {TRAINING_LEARNING_OUTCOMES.map((o) => (
            <li key={o}>{o}</li>
          ))}
        </ul>
      </section>

      {isAdmin ? (
        <section className="rounded-xl border border-amber-200 bg-amber-50/50 p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-amber-950">2025 Red Book (internal)</h2>
          <p className="mt-2 text-sm text-amber-950/90">
            Retrospective and action points for leads - not part of the public volunteer quiz.
          </p>
          <p className="mt-4">
            <Link
              to="/training/red-book-2025"
              className="text-base font-semibold text-amber-950 underline decoration-amber-300 underline-offset-2 hover:decoration-amber-950"
            >
              Open: 2025 Red Book points
            </Link>
          </p>
        </section>
      ) : null}

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Classes of fire (UK framing)</h2>
        <ul className="mt-4 space-y-3 text-sm text-slate-700">
          {FIRE_CLASSES_UK.map((c) => (
            <li key={c.code}>
              <span className="font-semibold text-slate-900">{c.code}</span> - {c.title}:{" "}
              {c.examples}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Key term: flash point</h2>
        <p className="mt-2 text-sm text-slate-700">{TRAINING_KEY_TERMS_FLASHPOINT}</p>
      </section>

      <section
        id="fire-triangle"
        className="scroll-mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <h2 className="text-lg font-semibold text-slate-900">The fire triangle</h2>
        <p className="mt-2 text-sm text-slate-700">{TRAINING_FIRE_TRIANGLE.summary}</p>
        <figure className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-b from-amber-50/80 to-white px-4 py-6 shadow-inner">
          <img
            src={publicAsset(TRAINING_FIRE_TRIANGLE.imageSrc)}
            alt={TRAINING_FIRE_TRIANGLE.imageAlt}
            width={400}
            height={360}
            decoding="async"
            className="mx-auto h-auto w-full max-w-md object-contain"
            loading="eager"
          />
          <figcaption className="mt-4 text-center text-sm text-slate-600">
            <span className="font-medium text-slate-800">Figure - fire triangle.</span> Removing fuel,
            heat, or oxygen stops the fire.
          </figcaption>
        </figure>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Prevention and KeK</h2>
        <p className="mt-2 text-sm text-slate-700">{TRAINING_PREVENTION_KEK}</p>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">If there is a fire: fire action</h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-slate-700">
          {TRAINING_FIRE_ACTION_STEPS.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 id="extinguisher-types" className="scroll-mt-6 text-lg font-semibold text-slate-900">
          Extinguisher types
        </h2>
        <p className="mt-2 text-sm text-slate-700">
          Always read the label and pictograms on the actual appliance. Match the class of fire to
          the extinguisher type.
        </p>
        <figure
          id="extinguisher-chart"
          className="scroll-mt-6 mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white p-3 shadow-inner sm:p-4"
        >
          <img
            src={publicAsset(TRAINING_EXTINGUISHER_CHART.imageSrc)}
            alt={TRAINING_EXTINGUISHER_CHART.imageAlt}
            decoding="async"
            className="mx-auto h-auto w-full max-w-4xl object-contain"
            loading="eager"
          />
          <figcaption className="mt-3 text-center text-sm text-slate-600">
            <span className="font-medium text-slate-800">
              {TRAINING_EXTINGUISHER_CHART.title}
            </span>
            . Use with the detail below; on site, follow signage and your H&amp;S brief.
          </figcaption>
        </figure>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {EXTINGUISHER_TYPES.map((ex) => (
            <article
              key={ex.id}
              id={`extinguisher-${ex.id}`}
              className="scroll-mt-6 flex flex-col rounded-xl border border-slate-200 bg-slate-50/60 p-4 shadow-sm ring-1 ring-slate-100 sm:p-5"
            >
              <h3 className="text-base font-semibold text-slate-900">{ex.title}</h3>
              <p className="mt-2 text-sm text-slate-700">
                <span className="font-medium text-emerald-900">Good for:</span> {ex.goodFor}
              </p>
              <p className="mt-2 text-sm text-amber-950">
                <span className="font-medium">Caution:</span> {ex.avoidOrCaution}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Evacuation</h2>
        <p className="mt-2 text-sm text-slate-700">{TRAINING_EVACUATION.intro}</p>
        <div className="mt-4 space-y-4">
          {TRAINING_EVACUATION.types.map((t) => (
            <div key={t.title} className="rounded-lg border border-slate-100 bg-slate-50/50 p-4">
              <h3 className="text-sm font-semibold text-slate-900">{t.title}</h3>
              <p className="mt-2 text-sm text-slate-700">{t.body}</p>
            </div>
          ))}
        </div>
        <h3 className="mt-6 text-sm font-semibold text-slate-900">Protocol (headlines)</h3>
        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-700">
          {TRAINING_EVACUATION.protocol.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-semibold text-slate-900">Site Clear</h3>
            <p className="mt-2 text-sm text-slate-700">
              {TRAINING_EVACUATION.siteClearVsAllClear.siteClear}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-semibold text-slate-900">All Clear</h3>
            <p className="mt-2 text-sm text-slate-700">
              {TRAINING_EVACUATION.siteClearVsAllClear.allClear}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Crowd control</h2>
        <p className="mt-1 text-sm text-slate-600">The three C’s, then field notes from the module.</p>
        <div className="mt-4 space-y-4">
          {TRAINING_CROWD_CONTROL.threeCs.map((c) => (
            <div key={c.label}>
              <h3 className="text-sm font-semibold text-slate-900">{c.label}</h3>
              <ul className="mt-2 list-inside list-disc text-sm text-slate-700">
                {c.items.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <ul className="mt-4 list-inside list-disc space-y-2 text-sm text-slate-700">
          {TRAINING_CROWD_CONTROL.points.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border-2 border-red-900/20 bg-red-50/40 p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-red-950">Check your understanding</h2>
        <p className="mt-1 text-sm text-slate-700">
          {FIRE_EXTINGUISHER_QUIZ.length} questions - tap an option to see whether it&apos;s correct
          and read the rationale.
        </p>
        <div className="mt-6 space-y-8">
          {FIRE_EXTINGUISHER_QUIZ.map((q, qi) => {
            const picked = typeof answers[q.id] === "number";
            const selected = answers[q.id];
            return (
              <fieldset key={q.id} className="rounded-lg border border-slate-200 bg-white p-4">
                <legend className="text-sm font-semibold text-slate-900">
                  {qi + 1}. {q.prompt}
                </legend>
                <div className="mt-3 space-y-2">
                  {q.options.map((opt, oi) => {
                    const id = `${q.id}-${oi}`;
                    const isCorrectChoice = oi === q.correctIndex;
                    const isWrongPick =
                      picked && selected === oi && oi !== q.correctIndex;
                    const showSolution = picked && isCorrectChoice;
                    return (
                      <label
                        key={id}
                        htmlFor={id}
                        className={`flex cursor-pointer items-start gap-2 rounded-md px-2 py-2 transition ${
                          showSolution
                            ? "bg-emerald-50 ring-2 ring-emerald-600/70"
                            : isWrongPick
                              ? "bg-amber-50 ring-2 ring-amber-600/70"
                              : "hover:bg-slate-50"
                        } ${picked && !isCorrectChoice && selected !== oi ? "opacity-60" : ""}`}
                      >
                        <input
                          id={id}
                          type="radio"
                          name={q.id}
                          checked={selected === oi}
                          onChange={() =>
                            setAnswers((prev) => ({ ...prev, [q.id]: oi }))
                          }
                          className="mt-1 size-4 shrink-0"
                        />
                        <span className="text-sm text-slate-800">{opt}</span>
                      </label>
                    );
                  })}
                </div>
                {picked ? (
                  <div
                    className={`mt-4 rounded-lg border px-3 py-3 text-sm ${
                      selected === q.correctIndex
                        ? "border-emerald-200 bg-emerald-50/80 text-emerald-950"
                        : "border-amber-200 bg-amber-50/80 text-amber-950"
                    }`}
                    role="status"
                  >
                    <p className="font-semibold">
                      {selected === q.correctIndex
                        ? "Correct."
                        : "Not quite - here is the reasoning."}
                    </p>
                    <p className="mt-2">
                      <span className="font-medium">Rationale:</span> {q.rationale}
                    </p>
                    {selected !== q.correctIndex ? (
                      <p className="mt-2 text-slate-800">
                        <span className="font-medium">Correct answer:</span>{" "}
                        <span className="font-semibold">{q.options[q.correctIndex]}</span>
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </fieldset>
            );
          })}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onReset}
              className="min-h-11 rounded-lg border border-slate-300 bg-white px-5 py-3 text-base font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
            >
              Try again
            </button>
            {allAnswered ? (
              <p
                className="rounded-lg bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-slate-200"
                role="status"
              >
                Score: {score} / {FIRE_EXTINGUISHER_QUIZ.length}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section
        className="rounded-xl border border-slate-200 bg-slate-50/80 p-5 shadow-sm"
        aria-labelledby="module-dl"
      >
        <h2 id="module-dl" className="text-lg font-semibold text-slate-900">
          Download the full training module (PDF)
        </h2>
        <p className="mt-1 text-sm text-slate-600">Slide-style deck: same source as the content above.</p>
        <a
          href={mainModulePdfUrl}
          download={MODULE_DOWNLOAD_NAME}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex min-h-11 items-center justify-center rounded-lg bg-red-800 px-5 py-3 text-base font-semibold text-white shadow-sm hover:bg-red-900"
        >
          Download Fire &amp; safety training module (PDF)
        </a>
      </section>
    </div>
  );
}
