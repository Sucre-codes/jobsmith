import { Copy } from "lucide-react";
import { copyText } from "../clipboard";
import { useToast } from "../toast";

type Props = {
  label: string;
  text: string;
};

export default function CopyIconButton({ label, text }: Props) {
  const toast = useToast();

  async function copy() {
    const ok = await copyText(text);
    if (ok) toast.success(`${label} copied`);
    else toast.error("Couldn't copy. Please try again.");
  }

  return (
    <button
      type="button"
      onClick={copy}
      title={`Copy ${label.toLowerCase()}`}
      aria-label={`Copy ${label.toLowerCase()}`}
      className="shrink-0 rounded-lg p-2 text-slate-300 hover:bg-slate-700 hover:text-white"
    >
      <Copy aria-hidden="true" className="h-4 w-4" />
    </button>
  );
}