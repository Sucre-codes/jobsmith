import { useId } from "react";
import {
  cleanUsername,
  buildUrl,
  usernameFromUrl,
  normalizeWebsite,
} from "@jobsmith/shared";

type Props = {
  label: string;
  value: string;
  onChange: (url: string) => void;
  prefix?: string;
  placeholder?: string;
  required?: boolean;
};

export default function UrlInput({
  label,
  value,
  onChange,
  prefix,
  placeholder,
  required,
}: Props) {
  const id = useId();
  const shown = prefix ? prefix.replace(/^https?:\/\/(www\.)?/i, "") : "";

  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-200">
        {label}
        {required && <span className="text-amber-300"> *</span>}
      </label>

      <div className="flex overflow-hidden rounded-lg bg-slate-900 ring-1 ring-slate-700 focus-within:ring-indigo-500">
        {prefix && (
          <span className="select-none whitespace-nowrap bg-slate-700 px-3 py-2.5 text-sm text-slate-300">
            {shown}
          </span>
        )}
        <input
          id={id}
          type="text"
          inputMode={prefix ? "text" : "url"}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          value={prefix ? usernameFromUrl(value, prefix) : value}
          placeholder={placeholder}
          onChange={(e) =>
            onChange(
              prefix
                ? buildUrl(prefix, cleanUsername(e.target.value, prefix))
                : e.target.value
            )
          }
          onBlur={() => {
            if (!prefix) onChange(normalizeWebsite(value));
          }}
          className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-slate-100 outline-none"
        />
      </div>
    </div>
  );
}