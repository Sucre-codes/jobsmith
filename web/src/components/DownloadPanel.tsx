import { useState } from "react";
import type { GenerateResponse } from "@jobsmith/shared";
import { downloadAll, makeFile, type FileKind, type JobInfo } from "../pdf/download";
import { saveBlob } from "../pdf/save";
import type { TemplateId } from "../pdf/styles";
import { useToast } from "../toast";
import TemplatePicker from "./TemplatePicker";

type Props = {
  result: GenerateResponse;
  job: JobInfo;
  template: TemplateId;
  onTemplate: (id: TemplateId) => void;
};

const SINGLE: { kind: FileKind; label: string }[] = [
  { kind: "resume", label: "Resume (PDF)" },
  { kind: "letterPdf", label: "Cover letter (PDF)" },
  { kind: "letterTxt", label: "Cover letter (TXT)" },
];

export default function DownloadPanel({ result, job, template, onTemplate }: Props) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  async function all() {
    setBusy(true);
    try {
      await downloadAll(result, job, template);
      toast.success(
        "Downloading 3 files. If your browser asks to allow multiple downloads, choose Allow."
      );
    } catch {
      toast.error("Couldn't make the files. Please try again.");
    }
    setBusy(false);
  }

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

  return (
    <div className="mt-4 rounded-xl bg-slate-900/60 p-4 ring-1 ring-slate-700">
      <TemplatePicker value={template} onChange={onTemplate} />

      <button
        type="button"
        onClick={all}
        disabled={busy}
        className="mt-4 w-full rounded-lg bg-indigo-500 py-3 font-semibold text-white disabled:opacity-60"
      >
        {busy ? "Preparing files..." : "Download all (3 files)"}
      </button>

      <div className="mt-3 flex flex-wrap gap-2">
        {SINGLE.map((f) => (
          <button
            key={f.kind}
            type="button"
            onClick={() => one(f.kind)}
            disabled={busy}
            className="rounded-lg bg-slate-700 px-3 py-2 text-sm text-slate-100 disabled:opacity-60"
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}