import { useState } from "react";
import { Copy, Download } from "lucide-react";
import type { GenerateResponse } from "@jobsmith/shared";
import { copyText } from "../clipboard";
import { makeFile, type FileKind, type JobInfo } from "../pdf/download";
import { saveBlob } from "../pdf/save";
import type { TemplateId } from "../pdf/styles";
import { useToast } from "../toast";

type Props = {
  result: GenerateResponse;
  job: JobInfo;
  template: TemplateId;
};

const FILES: { kind: FileKind; label: string }[] = [
  { kind: "resume", label: "Resume PDF" },
  { kind: "letterPdf", label: "Cover letter PDF" },
  { kind: "letterTxt", label: "Cover letter TXT" },
];

const buttonClass =
  "inline-flex items-center gap-2 rounded-lg bg-slate-700 px-3 py-2 text-sm text-slate-100 disabled:opacity-60";

export default function DownloadPanel({ result, job, template }: Props) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  async function one(kind: FileKind) {
    setBusy(true);
    try {
      const file = await makeFile(kind, result, job, template);
      saveBlob(file.blob, file.name);
    } catch {
      toast.error("Couldn't make that file. Please try again.");
    }
    setBusy(false);
  }

  async function copyLetter() {
    const ok = await copyText(result.coverLetter);
    if (ok) toast.success("Cover letter copied");
    else toast.error("Couldn't copy. Use the TXT download instead.");
  }

  return (
    <div className="mt-4">
      <p className="mb-2 text-xs uppercase tracking-wide text-slate-400">Your files</p>
      <div className="flex flex-wrap gap-2">
        {FILES.map((f) => (
          <button
            key={f.kind}
            type="button"
            onClick={() => one(f.kind)}
            disabled={busy}
            className={buttonClass}
          >
            <Download aria-hidden="true" className="h-4 w-4" />
            {f.label}
          </button>
        ))}
        <button type="button" onClick={copyLetter} className={buttonClass}>
          <Copy aria-hidden="true" className="h-4 w-4" />
          Copy cover letter
        </button>
      </div>
    </div>
  );
}