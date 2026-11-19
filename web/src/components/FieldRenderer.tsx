import { specOf, type ProfileDraft } from "@jobsmith/shared";
import type { Analysis } from "../api";
import UrlInput from "./UrlInput";
import TagInput from "./TagInput";
import ExperienceList from "./ExperienceList";
import ExperienceNotice from "./ExperienceNotice";
import EducationList from "./EducationList";
import ProjectList from "./ProjectList";

type Props = {
  field: Analysis["fields"][number];
  draft: ProfileDraft;
  yearsRequired: number | null;
  onSet: <K extends keyof ProfileDraft>(key: K, value: ProfileDraft[K]) => void;
};

export default function FieldRenderer({ field, draft, yearsRequired, onSet }: Props) {
  switch (field.key) {
    case "github":
    case "portfolio":
    case "linkedin":
    case "behance": {
      const spec = specOf(field.key);
      return (
        <UrlInput
          label={field.label}
          required={field.required}
          prefix={spec.prefix}
          placeholder={spec.placeholder}
          value={draft[field.key]}
          onChange={(v) => onSet(field.key, v)}
        />
      );
    }

    case "skills":
    case "tools":
    case "certifications":
    case "spokenLanguages": {
      const spec = specOf(field.key);
      return (
        <TagInput
          label={field.label}
          required={field.required}
          placeholder={spec.placeholder}
          hint={
            field.options.length > 0
              ? "Pre-filled from the job. Tap × to remove any you don't have."
              : undefined
          }
          value={draft[field.key]}
          onChange={(v) => onSet(field.key, v)}
        />
      );
    }

    case "experience":
      return (
        <div className="flex flex-col gap-3">
          <ExperienceNotice items={draft.experience} yearsRequired={yearsRequired} />
          <ExperienceList
            label={field.label}
            required={field.required}
            items={draft.experience}
            onChange={(v) => onSet("experience", v)}
          />
        </div>
      );

    case "education":
      return (
        <EducationList
          label={field.label}
          required={field.required}
          items={draft.education}
          onChange={(v) => onSet("education", v)}
        />
      );

    case "projects":
      return (
        <ProjectList
          label={field.label}
          required={field.required}
          items={draft.projects}
          onChange={(v) => onSet("projects", v)}
        />
      );
  }
}