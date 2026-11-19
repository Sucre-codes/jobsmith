import { emptyEducation, type EducationItem } from "@jobsmith/shared";
import RepeatableGroup from "./RepeatableGroup";
import TextField from "./TextField";
import YearInput from "./YearInput";

type Props = {
  items: EducationItem[];
  onChange: (items: EducationItem[]) => void;
  label?: string;
  required?: boolean;
};

export default function EducationList({
  items,
  onChange,
  label = "Education",
  required,
}: Props) {
  return (
    <RepeatableGroup
      label={label}
      required={required}
      items={items}
      onChange={onChange}
      makeEmpty={emptyEducation}
      max={5}
      addLabel="Add education"
      itemTitle={(item, i) => item.school || `School ${i + 1}`}
      renderItem={(item, update) => (
        <>
          <TextField
            label="School"
            value={item.school}
            onChange={(v) => update({ school: v })}
            placeholder="e.g. University of Uyo"
          />
          <TextField
            label="Degree or course"
            value={item.degree}
            onChange={(v) => update({ degree: v })}
            placeholder="e.g. BSc Computer Science"
          />
          <YearInput
            label="Graduation year (or expected)"
            value={item.year}
            onChange={(v) => update({ year: v })}
          />
        </>
      )}
    />
  );
}