import {
  Basics,
  isFieldValid,
  type FieldKey,
  type ProfileDraft,
} from "@jobsmith/shared";
import type { Analysis } from "./api";

type Field = Analysis["fields"][number];

const FRIENDLY: Record<FieldKey, string> = {
  github: "Check your GitHub username.",
  portfolio: "Check your portfolio link.",
  linkedin: "Check your LinkedIn username.",
  behance: "Check your Behance username.",
  certifications: "Check your certifications.",
  tools: "Check your tools.",
  spokenLanguages: "Check your spoken languages.",
  skills: "Check your skills.",
  experience:
    "For each job, add a title, company and start date, and make sure the end date isn't before the start. Remove any blank job.",
  education: "Each school needs a name. Remove any blank entry.",
  projects: "Each project needs a name. Remove any blank entry.",
};

function isEmpty(value: unknown): boolean {
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "string") return value.trim() === "";
  return value == null;
}

export function validateBasics(draft: ProfileDraft): string | null {
  const result = Basics.safeParse(draft.basics);
  if (result.success) return null;
  const bad = result.error.issues[0]?.path[0];
  return bad === "email"
    ? "Enter a valid email address."
    : "Enter your name and a valid email address.";
}

export function validateFields(fields: Field[], draft: ProfileDraft): string | null {
  for (const f of fields) {
    const value = draft[f.key];
    if (f.required && isEmpty(value)) return `${f.label} is required.`;
    if (!isFieldValid(f.key, value)) return FRIENDLY[f.key];
  }
  return null;
}