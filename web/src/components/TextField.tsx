import { useId } from "react";

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
};

export default function TextField({
  label,
  value,
  onChange,
  placeholder,
  required,
  maxLength = 150,
}: Props) {
  const id = useId();

  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-200">
        {label}
        {required && <span className="text-amber-300"> *</span>}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg bg-slate-900 px-3 py-2.5 text-slate-100 outline-none ring-1 ring-slate-700 focus:ring-indigo-500"
      />
    </div>
  );
}