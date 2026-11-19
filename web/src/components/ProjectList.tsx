import { emptyProject, type ProjectItem } from "@jobsmith/shared";
import RepeatableGroup from "./RepeatableGroup";
import TextField from "./TextField";
import UrlInput from "./UrlInput";

type Props = {
  items: ProjectItem[];
  onChange: (items: ProjectItem[]) => void;
  label?: string;
  required?: boolean;
};

export default function ProjectList({
  items,
  onChange,
  label = "Projects",
  required,
}: Props) {
  return (
    <RepeatableGroup
      label={label}
      required={required}
      items={items}
      onChange={onChange}
      makeEmpty={emptyProject}
      max={8}
      addLabel="Add a project"
      itemTitle={(item, i) => item.name || `Project ${i + 1}`}
      renderItem={(item, update) => (
        <>
          <TextField
            label="Project name"
            value={item.name}
            onChange={(v) => update({ name: v })}
          />
          <TextField
            label="What is it? (one line)"
            value={item.description}
            maxLength={200}
            onChange={(v) => update({ description: v })}
            placeholder="e.g. A mobile app that tailors resumes to job posts"
          />
          <UrlInput
            label="Link (optional)"
            value={item.url}
            onChange={(v) => update({ url: v })}
            placeholder="yourproject.com"
          />
        </>
      )}
    />
  );
}