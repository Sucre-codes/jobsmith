import { useState } from "react";
import {
  contactLine,
  dateRange,
  educationLine,
  linkText,
  type GenerateResponse,
} from "@jobsmith/shared";
import DownloadPanel from "./DownloadPanel";
import type { JobInfo } from "../pdf/download";
import type { TemplateId } from "../pdf/styles";

type Props = {
  result: GenerateResponse;
  busy: boolean;
  error: string | null;
  onEdit: () => void;
  onRegenerate: () => void;
  onRestart: () => void;
    job: JobInfo;
    template: TemplateId;
  onTemplate: (id: TemplateId) => void;
};

export default function Results({ result, busy, error, onEdit, onRegenerate, onRestart,job,template,onTemplate }: Props) {
  const { resume: r, coverLetter } = result;
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);

  async function copyLetter() {
    try {
      await navigator.clipboard.writeText(coverLetter);
      setCopyFailed(false);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopyFailed(true);
    }
  }

  const contact = contactLine(r.basics);
  const heading = "mt-5 border-b border-slate-600 pb-1 text-sm font-semibold uppercase tracking-wide text-slate-300";

  return (
    <div className="w-full max-w-xl rounded-2xl bg-slate-800 p-6 shadow-lg">
      <h2 className="text-2xl font-semibold text-white">Your resume is ready</h2>

      <div className="mt-3 rounded-lg bg-amber-500/10 p-3 text-sm text-amber-200">
        Review before you send. This was written by AI from your details and the job posting, so
        edit anything that doesn't match what you actually did.
      </div>
             <DownloadPanel result={result} job={job} template={template} onTemplate={onTemplate} />

      <div className="mt-5 text-slate-200">
        <p className="text-xl font-bold text-white">{r.basics.name}</p>
        <p className="text-sm text-slate-400">{contact}</p>
        {r.links.length > 0 && (
          <p className="text-sm text-slate-400">
            {r.links.map(linkText).join(" | ")}
          </p>
        )}

        <h3 className={heading}>Summary</h3>
        <p className="mt-2 text-sm">{r.summary}</p>

        {r.experience.length > 0 && <h3 className={heading}>Experience</h3>}
        {r.experience.map((e, i) => (
          <div key={i} className="mt-3 text-sm">
            <p className="font-semibold text-white">
              {e.title}, {e.company}
            </p>
            <p className="text-slate-400">
              {dateRange(e.start, e.end, e.current)}
            </p>
            <ul className="mt-1 list-disc pl-5">
              {e.bullets.map((b, j) => (
                <li key={j}>{b}</li>
              ))}
            </ul>
          </div>
        ))}

        {r.projects.length > 0 && <h3 className={heading}>Projects</h3>}
        {r.projects.map((p, i) => (
          <div key={i} className="mt-3 text-sm">
            <p className="font-semibold text-white">
              {p.name}
              {p.url ? ` (${p.url})` : ""}
            </p>
            {p.bullets.length > 0 && (
              <ul className="mt-1 list-disc pl-5">
                {p.bullets.map((b, j) => (
                  <li key={j}>{b}</li>
                ))}
              </ul>
            )}
          </div>
        ))}

        {r.education.length > 0 && <h3 className={heading}>Education</h3>}
        {r.education.map((e, i) => (
          <p key={i} className="mt-2 text-sm">
            {educationLine(e)}
          </p>
        ))}

        {(r.skills.length > 0 || r.tools.length > 0) && <h3 className={heading}>Skills</h3>}
        {r.skills.length > 0 && <p className="mt-2 text-sm">{r.skills.join(", ")}</p>}
        {r.tools.length > 0 && <p className="mt-1 text-sm">Tools: {r.tools.join(", ")}</p>}
        {r.certifications.length > 0 && (
          <p className="mt-1 text-sm">Certifications: {r.certifications.join(", ")}</p>
        )}
        {r.spokenLanguages.length > 0 && (
          <p className="mt-1 text-sm">Languages: {r.spokenLanguages.join(", ")}</p>
        )}
      </div>

      <details className="mt-5 rounded-lg bg-slate-900 p-3">
        <summary className="cursor-pointer text-sm font-medium text-slate-200">
          Cover letter
        </summary>
        <p className="mt-3 whitespace-pre-wrap text-sm text-slate-300">{coverLetter}</p>
      </details>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={copyLetter}
          className="rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white"
        >
          {copied ? "Copied!" : "Copy cover letter"}
        </button>
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

      {copyFailed && (
        <p className="mt-2 text-sm text-amber-300">
          Copying didn't work here. Open the cover letter above and copy it by hand.
        </p>
      )}
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