import { useEffect, useRef } from "react";
import { X } from "lucide-react";

type Props = {
  open: boolean;
  title: string;
  src: string;
  alt: string;
  actionLabel: string;
  onAction: () => void;
  onClose: () => void;
};

export default function Lightbox({
  open,
  title,
  src,
  alt,
  actionLabel,
  onAction,
  onClose,
}: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className="m-auto w-[min(92vw,32rem)] rounded-2xl bg-slate-800 p-0 text-slate-100 backdrop:bg-black/70"
    >
      <div className="flex items-center justify-between px-4 py-3">
        <p className="text-sm font-semibold text-white">{title}</p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close preview"
          className="rounded-lg p-1.5 text-slate-300 hover:bg-slate-700 hover:text-white"
        >
          <X aria-hidden="true" className="h-5 w-5" />
        </button>
      </div>

      <div className="max-h-[70vh] overflow-auto bg-white">
        <img src={src} alt={alt} className="w-full" />
      </div>

      <div className="p-3">
        <button
          type="button"
          onClick={onAction}
          className="w-full rounded-lg bg-indigo-500 py-2.5 text-sm font-semibold text-white"
        >
          {actionLabel}
        </button>
      </div>
    </dialog>
  );
}