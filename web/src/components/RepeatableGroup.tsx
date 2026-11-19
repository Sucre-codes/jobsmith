import type { ReactNode } from "react";

type Props<T> = {
  label: string;
  items: T[];
  onChange: (items: T[]) => void;
  makeEmpty: () => T;
  max: number;
  addLabel: string;
  itemTitle: (item: T, index: number) => string;
  renderItem: (item: T, update: (patch: Partial<T>) => void) => ReactNode;
  required?: boolean;
};

export default function RepeatableGroup<T extends object>({
  label,
  items,
  onChange,
  makeEmpty,
  max,
  addLabel,
  itemTitle,
  renderItem,
  required,
}: Props<T>) {
  function updateAt(index: number, patch: Partial<T>) {
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function removeAt(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  function add() {
    if (items.length < max) onChange([...items, makeEmpty()]);
  }

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-slate-200">
        {label}
        {required && <span className="text-amber-300"> *</span>}
      </p>

      <div className="flex flex-col gap-4">
        {items.map((item, index) => (
          <div key={index} className="rounded-xl bg-slate-900/60 p-4 ring-1 ring-slate-700">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-white">{itemTitle(item, index)}</p>
              <button
                type="button"
                onClick={() => removeAt(index)}
                className="text-sm text-slate-400 hover:text-red-300"
              >
                Remove
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {renderItem(item, (patch) => updateAt(index, patch))}
            </div>
          </div>
        ))}
      </div>

      {items.length < max && (
        <button
          type="button"
          onClick={add}
          className="mt-3 w-full rounded-lg border border-dashed border-slate-600 py-2.5 text-sm text-slate-300 hover:border-indigo-400 hover:text-white"
        >
          + {addLabel}
        </button>
      )}
    </div>
  );
}