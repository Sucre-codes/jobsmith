import { useId } from "react";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

const selectClass =
  "w-full rounded-lg bg-slate-900 px-3 py-2.5 text-slate-100 outline-none ring-1 ring-slate-700 focus:ring-indigo-500 disabled:opacity-40";

export default function MonthYearInput({ label, value, onChange, disabled }: Props) {
  const id = useId();
  const [year = "", month = ""] = value.split("-");

  const thisYear = new Date().getFullYear();
  const years = Array.from({ length: thisYear - 1969 }, (_, i) => String(thisYear - i));

  function update(nextYear: string, nextMonth: string) {
    onChange(nextYear || nextMonth ? `${nextYear}-${nextMonth}` : "");
  }

  return (
    <div>
      <p id={id} className="mb-1 text-sm font-medium text-slate-200">
        {label}
      </p>
      <div className="grid grid-cols-2 gap-2" role="group" aria-labelledby={id}>
        <select
          aria-label={`${label} month`}
          value={month}
          disabled={disabled}
          onChange={(e) => update(year, e.target.value)}
          className={selectClass}
        >
          <option value="">Month</option>
          {MONTHS.map((name, i) => (
            <option key={name} value={String(i + 1).padStart(2, "0")}>
              {name}
            </option>
          ))}
        </select>
        <select
          aria-label={`${label} year`}
          value={year}
          disabled={disabled}
          onChange={(e) => update(e.target.value, month)}
          className={selectClass}
        >
          <option value="">Year</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}