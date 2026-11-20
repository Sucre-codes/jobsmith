import { useEffect, useMemo, useState } from "react";
import {
  emptyProfile,
  prefillFromAnalysis,
  type FieldKey,
  type ProfileDraft,
  type GenerateResponse
} from "@jobsmith/shared";
import type { Analysis } from "../api";
import { validateBasics, validateFields } from "../validate";
import TextField from "./TextField";
import FieldRenderer from "./FieldRenderer";
import { saveSession } from "../storage";
import SavedProfilePicker from "./SavedProfilePicker";
import { saveProfile, touchProfile, type SavedProfile } from "../saved";
import { buildRequest, describeGenerateError, generate } from "../generate";
import Results from "./Results";
import { saveApplication } from "../application";

type Props = {
  analysis: Analysis;
  initialDraft?: ProfileDraft;
  initialStep?: number;
  initialResult?: GenerateResponse | null;
  onRestart: () => void;
  onFinish: () => void;
};

type Step = { id: string; title: string; keys: FieldKey[] };

const PAGES: { title: string; keys: FieldKey[] }[] = [
  { title: "Your background", keys: ["experience", "education", "projects"] },
  { title: "Skills and tools", keys: ["skills", "tools", "certifications", "spokenLanguages"] },
  { title: "Your links", keys: ["github", "portfolio", "linkedin", "behance"] },
];

export default function Wizard({ analysis, initialDraft, initialStep,   initialResult, onRestart,onFinish }: Props) {
  const steps = useMemo<Step[]>(() => {
    const present = new Set<FieldKey>(analysis.fields.map((f) => f.key));
    const pages = PAGES.map((p) => ({
      id: p.title,
      title: p.title,
      keys: p.keys.filter((k) => present.has(k)),
    })).filter((p) => p.keys.length > 0);
    return [
      { id: "basics", title: "About you", keys: [] },
      ...pages,
      { id: "review", title: "Review", keys: [] },
    ];
  }, [analysis]);

  const [draft, setDraft] = useState<ProfileDraft>(
    () => initialDraft ?? prefillFromAnalysis(emptyProfile(), analysis.fields)
  );
  const [stepIndex, setStepIndex] = useState(() =>
    Math.min(Math.max(initialStep ?? 0, 0), steps.length - 1)
  );
  const [error, setError] = useState<string | null>(null);
  const [usedName, setUsedName] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [result, setResult] = useState<GenerateResponse | null>(initialResult ?? null);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

    useEffect(() => {
    saveSession({ analysis, draft, step: stepIndex, result });
  }, [analysis, draft, stepIndex, result]);

  const step = steps[stepIndex];
  const total = steps.length + 1;
  const current = stepIndex + 2;
  const pageFields = analysis.fields.filter((f) => step.keys.includes(f.key));

  function setField<K extends keyof ProfileDraft>(key: K, value: ProfileDraft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function setBasics(patch: Partial<ProfileDraft["basics"]>) {
    setField("basics", { ...draft.basics, ...patch });
  }

    function applySaved(p: SavedProfile) {
    touchProfile(p.id);
    setDraft(prefillFromAnalysis(p.draft, analysis.fields));
    setUsedName(p.draft.basics.name || p.draft.basics.email);
    setError(null);
  }

  function clearForm() {
    setDraft(prefillFromAnalysis(emptyProfile(), analysis.fields));
    setUsedName(null);
  }

  function saveDetails() {
    saveProfile(draft);
    setSaved(true);
  }

    async function generateNow() {
    setGenError(null);
    const built = buildRequest(analysis, draft);
    if (!built.ok) {
      setGenError(built.message);
      return;
    }
    setGenerating(true);
    const outcome = await generate(built.request);
    setGenerating(false);

    if (outcome.ok) {
      saveApplication({ analysis, draft, result: outcome.result });
      setResult(outcome.result);
      window.scrollTo({ top: 0 });
      return;
    }
    setGenError(describeGenerateError(outcome.error, outcome.retryAfter));
  }

  function go(to: number) {
    setError(null);
    setStepIndex(to);
    window.scrollTo({ top: 0 });
  }

  function next() {
    const problem =
      step.id === "basics" ? validateBasics(draft) : validateFields(pageFields, draft);
    if (problem) {
      setError(problem);
      return;
    }
    go(stepIndex + 1);
  }

    if (result) {
    return (
      <Results
        result={result}
        busy={generating}
        error={genError}
        onEdit={() => {
          setResult(null);
          setGenError(null);
        }}
        onRegenerate={generateNow}
        onRestart={onFinish}
      />
    );
  }

  return (
    <div className="w-full max-w-xl rounded-2xl bg-slate-800 p-6 shadow-lg">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Applying for</p>
          <p className="font-semibold text-white">
            {analysis.title}
            {analysis.company ? ` at ${analysis.company}` : ""}
          </p>
        </div>
        <button onClick={onRestart} className="shrink-0 text-sm text-indigo-300 underline">
          Change job
        </button>
      </div>

      <p className="text-sm text-slate-400">
        Step {current} of {total}: {step.title}
      </p>
      <div className="mb-5 mt-2 h-1.5 w-full rounded-full bg-slate-700">
        <div
          className="h-1.5 rounded-full bg-indigo-500 transition-all"
          style={{ width: `${(current / total) * 100}%` }}
        />
      </div>

      <div className="flex flex-col gap-5">
        {step.id === "basics" && (
          <>
                      {usedName ? (
              <div className="rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-200">
                <p>
                  Filled from the saved details for {usedName}. Check every page before you
                  generate.
                </p>
                <button type="button" onClick={clearForm} className="mt-1 underline">
                  Not you? Clear form
                </button>
              </div>
            ) : draft.basics.name === "" && draft.basics.email === "" ? (
              <SavedProfilePicker onUse={applySaved} />
            ) : null}
            <TextField
              label="Full name"
              required
              value={draft.basics.name}
              maxLength={100}
              onChange={(v) => setBasics({ name: v })}
            />
            <TextField
              label="Email"
              required
              type="email"
              value={draft.basics.email}
              maxLength={200}
              onChange={(v) => setBasics({ email: v })}
            />
            <TextField
              label="Phone (optional)"
              type="tel"
              value={draft.basics.phone}
              onChange={(v) => setBasics({ phone: v })}
            />
            <TextField
              label="City and country (optional)"
              value={draft.basics.location}
              placeholder="e.g. Uyo, Nigeria"
              onChange={(v) => setBasics({ location: v })}
            />
          </>
        )}

        {pageFields.map((f) => (
          <FieldRenderer
            key={f.key}
            field={f}
            draft={draft}
            yearsRequired={analysis.yearsRequired}
            onSet={setField}
          />
        ))}

                      {step.id === "review" && (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-slate-300">
              Everything is filled in. Jobsmith will now write your resume and cover letter for
              this job.
            </p>
            <button
              type="button"
              onClick={saveDetails}
              className="rounded-lg bg-slate-700 px-4 py-2.5 text-sm text-slate-100"
            >
              Save my details on this device
            </button>
            {saved && (
              <p className="text-sm text-emerald-300">
                Saved on this device only. You can delete them any time with the link at the
                bottom of the page.
              </p>
            )}
            <button
              type="button"
              onClick={generateNow}
              disabled={generating}
              className="rounded-lg bg-indigo-500 py-3 font-semibold text-white disabled:opacity-60"
            >
              {generating
                ? "Writing your resume... this can take up to a minute"
                : "Generate resume and cover letter"}
            </button>
            {genError && <p className="text-sm text-amber-300">{genError}</p>}
          </div>
        )}
      </div>

      {error && <p className="mt-4 text-sm text-amber-300">{error}</p>}

      <div className="mt-6 flex gap-3">
        {stepIndex > 0 && (
          <button
            onClick={() => go(stepIndex - 1)}
            className="rounded-lg bg-slate-700 px-4 py-2.5 text-slate-200"
          >
            Back
          </button>
        )}
        {stepIndex < steps.length - 1 && (
          <button
            onClick={next}
            className="flex-1 rounded-lg bg-indigo-500 py-2.5 font-semibold text-white"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}