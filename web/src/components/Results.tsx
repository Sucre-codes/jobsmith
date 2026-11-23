import {
  dateRange,
  educationLine,
  experienceCopy,
  projectCopy,
  type GenerateResponse,
  type ProfileDraft,
  type QaItem
} from "@jobsmith/shared";
import type { JobInfo } from "../pdf/download";
import type { TemplateId } from "../pdf/styles";
import Accordion from "./Accordion";
import CopyChip from "./CopyChip";
import CopyIconButton from "./CopyIconButton";
import DownloadPanel from "./DownloadPanel";
import type { Analysis } from "../api";
import QuestionHelper from "./QuestionHelper";

type Props = {
  result: GenerateResponse;
  busy: boolean;
  error: string | null;
  onEdit: () => void;
  onRegenerate: () => void;
  onRestart: () => void;
  job: JobInfo;
  template: TemplateId;
  analysis: Analysis;
  draft: ProfileDraft;
  qa: QaItem[];
  onQa: (items: QaItem[]) => void;
};

const row = "flex items-start justify-between gap-3 rounded-lg bg-slate-800 p-3";

export default function Results({
  result,
  busy,
  error,
  onEdit,
  onRegenerate,
  onRestart,
  job,
  template,
  analysis,
  draft,
  qa,
  onQa
}: Props) {
  const r = result.resume;

  return (
    <div className="w-full max-w-xl rounded-2xl bg-slate-800 p-6 shadow-lg">
      <h2 className="text-2xl font-semibold text-white">Your resume is ready</h2>

      <div className="mt-3 rounded-lg bg-amber-500/10 p-3 text-sm text-amber-200">
        Review before you send. This was written by AI from your details and the job posting, so
        edit anything that doesn't match what you actually did.
      </div>

      <DownloadPanel result={result} job={job} template={template} />

            <div className="mt-6">
        <p className="text-2xl font-bold tracking-tight text-white">{r.basics.name}</p>
        <p className="mb-2 mt-1 text-xs uppercase tracking-wide text-slate-400">
          your details
        </p>
        <div className="flex flex-wrap gap-2">
          <CopyChip label="Email" value={r.basics.email} />
          {r.basics.phone && <CopyChip label="Phone" value={r.basics.phone} />}
          {r.basics.location && <CopyChip label="Location" value={r.basics.location} />}
          {r.links.map((l) => (
            <CopyChip
              key={l.label}
              label={`${l.label} link`}
              value={l.url}
              display={`${l.label}: ${l.url}`}
            />
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3">
        {r.experience.length > 0 && (
          <Accordion title="Experience" count={r.experience.length}>
            {r.experience.map((e, i) => (
              <div key={i} className={row}>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-white">{e.title}</p>
                  <p className="truncate text-sm text-slate-300">{e.company}</p>
                  <p className="text-xs text-slate-400">
                    {dateRange(e.start, e.end, e.current)}
                  </p>
                </div>
                <CopyIconButton label="Experience" text={experienceCopy(e)} />
              </div>
            ))}
          </Accordion>
        )}

        {r.projects.length > 0 && (
          <Accordion title="Projects" count={r.projects.length}>
            {r.projects.map((p, i) => (
              <div key={i} className={row}>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-white">{p.name}</p>
                  {p.url && <p className="truncate text-sm text-slate-300">{p.url}</p>}
                </div>
                <CopyIconButton label="Project" text={projectCopy(p)} />
              </div>
            ))}
          </Accordion>
        )}

        {r.education.length > 0 && (
          <Accordion title="Education" count={r.education.length}>
            {r.education.map((e, i) => (
              <div key={i} className={row}>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-white">{e.degree || e.school}</p>
                  <p className="truncate text-sm text-slate-300">
                    {[e.degree ? e.school : "", e.year].filter(Boolean).join(" | ")}
                  </p>
                </div>
                <CopyIconButton label="Education" text={educationLine(e)} />
              </div>
            ))}
          </Accordion>
        )}
      </div>
      <QuestionHelper analysis={analysis} draft={draft} items={qa} onChange={onQa} />

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onRegenerate}
          disabled={busy}
          className="rounded-lg bg-slate-700 px-4 py-2.5 text-sm text-slate-100 disabled:opacity-50"
        >
          {busy ? "Writing again..." : "Write it again"}
        </button>
        <button
          type="button"
          onClick={onEdit}
          className="rounded-lg bg-slate-700 px-4 py-2.5 text-sm text-slate-100"
        >
          Edit my details
        </button>
      </div>

      {error && <p className="mt-2 text-sm text-amber-300">{error}</p>}

      <button
        type="button"
        onClick={onRestart}
        className="mt-3 text-sm text-indigo-300 underline"
      >
        Apply for another job
      </button>
    </div>
  );
}