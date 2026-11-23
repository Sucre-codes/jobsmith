import { useState } from "react";
import { Check, ZoomIn } from "lucide-react";
import { TEMPLATES, type TemplateId } from "../pdf/styles";
import Lightbox from "./Lightbox";

const BLURB: Record<TemplateId, string> = {
  classic: "Centered header, black and white. The safest choice.",
  modern: "Left-aligned with blue headings.",
  compact: "Smaller type, so longer careers fit on fewer pages.",
};

type Props = {
  value: TemplateId;
  onChange: (id: TemplateId) => void;
};

export default function TemplatePicker({ value, onChange }: Props) {
  const [zoomId, setZoomId] = useState<TemplateId | null>(null);
  const zoomed = TEMPLATES.find((t) => t.id === zoomId) ?? TEMPLATES[0];

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-slate-200">Resume look</p>

      <div className="grid grid-cols-3 gap-3" role="radiogroup" aria-label="Resume look">
        {TEMPLATES.map((t) => {
          const selected = value === t.id;
          return (
            <div key={t.id} className="relative">
              <button
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onChange(t.id)}
                className={`block w-full overflow-hidden rounded-lg bg-white ring-2 ${
                  selected ? "ring-indigo-500" : "ring-slate-600"
                }`}
              >
                <img
                  src={`/templates/${t.id}.png`}
                  alt={`${t.label} look, sample resume`}
                  loading="lazy"
                  className="aspect-[1/1.414] w-full object-cover object-top"
                />
              </button>

              {selected && (
                <span className="pointer-events-none absolute left-1.5 top-1.5 rounded-full bg-indigo-500 p-1 text-white">
                  <Check aria-hidden="true" className="h-3 w-3" />
                </span>
              )}

              <button
                type="button"
                onClick={() => setZoomId(t.id)}
                aria-label={`Preview ${t.label} look`}
                className="absolute right-1.5 top-1.5 rounded-full bg-slate-900/80 p-1.5 text-white hover:bg-slate-900"
              >
                <ZoomIn aria-hidden="true" className="h-3.5 w-3.5" />
              </button>

              <p
                className={`mt-1 text-center text-xs ${
                  selected ? "font-semibold text-white" : "text-slate-400"
                }`}
              >
                {t.label}
              </p>
            </div>
          );
        })}
      </div>

      <p className="mt-2 text-xs text-slate-400">
        {BLURB[value]} Every look is single-column plain text, which ATS software reads well.
      </p>

      <Lightbox
        open={zoomId !== null}
        title={`${zoomed.label} look (sample)`}
        src={`/templates/${zoomed.id}.png`}
        alt={`${zoomed.label} look, full sample resume`}
        actionLabel={value === zoomed.id ? "Selected" : `Use ${zoomed.label}`}
        onAction={() => {
          onChange(zoomed.id);
          setZoomId(null);
        }}
        onClose={() => setZoomId(null)}
      />
    </div>
  );
}