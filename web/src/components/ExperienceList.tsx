import { emptyExperience, type ExperienceItem } from "@jobsmith/shared";
import RepeatableGroup from "./RepeatableGroup";
import TextField from "./TextField";
import MonthYearInput from "./MonthYearInput";

type Props = {
  items: ExperienceItem[];
  onChange: (items: ExperienceItem[]) => void;
  label?: string;
  required?: boolean;
};

export default function ExperienceList({
  items,
  onChange,
  label = "Work experience",
  required,
}: Props) {
  return (
    <RepeatableGroup
      label={label}
      required={required}
      items={items}
      onChange={onChange}
      makeEmpty={emptyExperience}
      max={10}
      addLabel="Add a job"
      itemTitle={(item, i) => item.title || item.company || `Job ${i + 1}`}
      renderItem={(item, update) => (
        <>
          <TextField
            label="Job title"
            value={item.title}
            onChange={(v) => update({ title: v })}
            placeholder="e.g. Frontend Developer"
          />
          <TextField
            label="Company"
            value={item.company}
            onChange={(v) => update({ company: v })}
          />
          <MonthYearInput
            label="Start date"
            value={item.start}
            onChange={(v) => update({ start: v })}
          />
          <MonthYearInput
            label="End date"
            value={item.end}
            disabled={item.current}
            onChange={(v) => update({ end: v })}
          />
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={item.current}
              onChange={(e) => update({ current: e.target.checked, end: "" })}
            />
            I currently work here
          </label>
            <TextField
            label="A result you're proud of (optional)"
            value={item.result}
            maxLength={200}
            onChange={(v) => update({ result: v })}
            placeholder="Only if you have one, with its real number"
          />
        </>
      )}
    />
  );
}