import { useState } from "react";
import { makePdfBlob } from "../pdf/engine";
import { openPreview } from "../pdf/preview";
import { buildResumeDoc } from "../pdf/resume";
import { previewResume } from "../pdf/sample";
import { TEMPLATES, templateById, type TemplateId } from "../pdf/styles";
import { useToast } from "../toast";

const BLURB: Record<TemplateId, string> = {
  classic: "Centered header, black and white. The safest choice.",
  modern: "Left-aligned with blue headings.",
  compact: "Smaller type, so longer careers fit on fewer pages.",
};

type Props = {
  value: TemplateId;
  onChange: (id: TemplateId) => void;
  withPreview?: boolean;
};

export default function TemplatePicker({ value, onChange, withPreview }: Props) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  async function preview() {
    setBusy(true);
    const outcome = await openPreview(() =>
      makePdfBlob(buildResumeDoc(previewResume(), templateById(value)))
    );
    setBusy(false);
    if (outcome === "blocked") {
      toast.error("Your browser blocked the preview. Allow pop-ups for this site and try again.");
    } else if (outcome === "failed") {
      toast.error("Couldn't make the preview. Please try again.");
    }
  }

  return (
    <div>
      <p className="mb-1 text-sm font-medium text-slate-200">Resume look</p>
      <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Resume look">
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            type="button"
            role="radio"
            aria-checked={value === t.id}
            onClick={() => onChange(t.id)}
            className={`rounded-lg px-3 py-2 text-sm ${
              value === t.id ? "bg-indigo-500 text-white" : "bg-slate-700 text-slate-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {withPreview && (
        <>
          <p className="mt-2 text-xs text-slate-400">
            {BLURB[value]} Every look is single-column plain text, which ATS software reads well.
          </p>
          <button
            type="button"
            onClick={preview}
            disabled={busy}
            className="mt-2 rounded-lg border border-slate-600 px-3 py-2 text-sm text-slate-200 disabled:opacity-60"
          >
            {busy ? "Opening preview..." : "Preview this look (sample)"}
          </button>
        </>
      )}
    </div>
  );
}