import { useId } from "react";

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

export default function YearInput({ label, value, onChange }: Props) {
  const id = useId();
  const top = new Date().getFullYear() + 6;
  const years = Array.from({ length: top - 1969 }, (_, i) => String(top - i));

  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-200">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg bg-slate-900 px-3 py-2.5 text-slate-100 outline-none ring-1 ring-slate-700 focus:ring-indigo-500"
      >
        <option value="">Select year</option>
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </div>
  );
}