import { useId, useState } from "react";

type Props = {
  label: string;
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  required?: boolean;
};

const MAX_TAGS = 30;

export default function TagInput({
  label,
  value,
  onChange,
  placeholder,
  required,
}: Props) {
  const id = useId();
  const [draft, setDraft] = useState("");
  

  function addMany(raws: string[]) {
    const next = [...value];
    for (const raw of raws) {
      const tag = raw.trim().slice(0, 60);
      if (!tag || next.length >= MAX_TAGS) continue;
      if (next.some((t) => t.toLowerCase() === tag.toLowerCase())) continue;
      next.push(tag);
    }
    if (next.length !== value.length) onChange(next);
  }

  function remove(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-200">
        {label}
        {required && <span className="text-amber-300"> *</span>}
      </label>

      <div className="flex flex-wrap gap-2 rounded-lg bg-slate-900 p-2 ring-1 ring-slate-700 focus-within:ring-indigo-500">
        {value.map((tag, i) => (
          <span
            key={tag}
            className="flex items-center gap-1 rounded-full bg-indigo-500/20 px-3 py-1 text-sm text-indigo-100"
          >
            {tag}
            <button
              type="button"
              onClick={() => remove(i)}
              aria-label={`Remove ${tag}`}
              className="text-indigo-200 hover:text-white"
            >
              ×
            </button>
          </span>
        ))}

        <input
          id={id}
          type="text"
          value={draft}
          placeholder={value.length === 0 ? placeholder : ""}
          autoCapitalize="none"
          onChange={(e) => {
            const v = e.target.value;
            if (v.includes(",")) {
              const parts = v.split(",");
              const last = parts.pop() ?? "";
              addMany(parts);
              setDraft(last);
            } else {
              setDraft(v);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addMany([draft]);
              setDraft("");
            } else if (e.key === "Backspace" && draft === "" && value.length > 0) {
              remove(value.length - 1);
            }
          }}
          onBlur={() => {
            addMany([draft]);
            setDraft("");
          }}
          className="min-w-[8rem] flex-1 bg-transparent px-1 py-1 text-slate-100 outline-none"
        />
      </div>
    </div>
  );
}