import { Copy } from "lucide-react";
import { copyText } from "../clipboard";
import { useToast } from "../toast";

type Props = {
  label: string;
  value: string;
  display?: string;
};

export default function CopyChip({ label, value, display }: Props) {
  const toast = useToast();

  async function copy() {
    const ok = await copyText(value);
    if (ok) toast.success(`${label} copied`);
    else toast.error("Couldn't copy. Select the text and copy it by hand.");
  }

  return (
    <button
      type="button"
      onClick={copy}
      title={`Copy ${label.toLowerCase()}`}
      aria-label={`Copy ${label}: ${value}`}
      className="group inline-flex max-w-full items-center gap-2 rounded-lg bg-slate-700/60 px-3 py-1.5 text-left text-sm text-slate-100 hover:bg-slate-700"
    >
      <span className="truncate">{display ?? value}</span>
      <Copy aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-slate-400 group-hover:text-white" />
    </button>
  );
}