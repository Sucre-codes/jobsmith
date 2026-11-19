import { useEffect, useMemo, useState } from "react";
import {
  emptyProfile,
  prefillFromAnalysis,
  type FieldKey,
  type ProfileDraft,
} from "@jobsmith/shared";
import type { Analysis } from "../api";
import { validateBasics, validateFields } from "../validate";
import TextField from "./TextField";
import FieldRenderer from "./FieldRenderer";
import { saveSession } from "../storage";
import SavedProfilePicker from "./SavedProfilePicker";
import { saveProfile, touchProfile, type SavedProfile } from "../saved";

type Props = {
  analysis: Analysis;
  initialDraft?: ProfileDraft;
  initialStep?: number;
  onRestart: () => void;
};

type Step = { id: string; title: string; keys: FieldKey[] };

const PAGES: { title: string; keys: FieldKey[] }[] = [
  { title: "Your background", keys: ["experience", "education", "projects"] },
  { title: "Skills and tools", keys: ["skills", "tools", "certifications", "spokenLanguages"] },
  { title: "Your links", keys: ["github", "portfolio", "linkedin", "behance"] },
];

export default function Wizard({ analysis, initialDraft, initialStep, onRestart }: Props) {
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

  useEffect(() => {
    saveSession({ analysis, draft, step: stepIndex });
  }, [analysis, draft, stepIndex]);

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
              Your details are ready. Generating the resume comes next.
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
            <pre className="max-h-96 overflow-auto rounded-lg bg-slate-900 p-3 text-xs text-slate-300">
              {JSON.stringify(draft, null, 2)}
            </pre>
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