import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

type Props = {
  title: string;
  count: number;
  children: ReactNode;
};

export default function Accordion({ title, count, children }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <section className="rounded-xl bg-slate-900/60 ring-1 ring-slate-700">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="text-sm font-semibold text-white">
          {title}
          {count > 1 ? ` (${count})` : ""}
        </span>
        <ChevronDown
          aria-hidden="true"
          className={`h-4 w-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="flex flex-col gap-2 px-4 pb-4">{children}</div>}
    </section>
  );
}