import { z } from "zod";

export const FIELD_CATALOG = [
  "github",
  "portfolio",
  "linkedin",
  "behance",
  "certifications",
  "tools",
  "languages",
  "experience",
  "education",
  "projects",
] as const;

export const JobAnalysis = z.object({
  title: z.string(),
  company: z.string().optional(),
  skills: z.array(z.string()),
  fields: z.array(
    z.object({
      key: z.enum(FIELD_CATALOG),
      label: z.string(),
      required: z.boolean(),
    })
  ),
});

export const AnalysisResult = z.discriminatedUnion("kind", [
  JobAnalysis.extend({ kind: z.literal("job_posting") }),
  z.object({ kind: z.literal("job_list") }),
  z.object({ kind: z.literal("not_a_job") }),
]);

const Text = z.string().trim().max(200);
const Url = z.union([
  z.literal(""),
  z.string().trim().url().max(300).regex(/^https?:\/\//i),
]);
const TagList = z.array(z.string().trim().min(1).max(60)).max(30);
const Bullets = z.array(z.string().trim().min(1).max(300)).max(8);

export const Basics = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(200),
  phone: Text.default(""),
  location: Text.default(""),
});

export const ExperienceItem = z.object({
  company: z.string().trim().min(1).max(150),
  title: z.string().trim().min(1).max(150),
  start: Text,
  end: Text.default(""),
  bullets: Bullets.default([]),
});

export const EducationItem = z.object({
  school: z.string().trim().min(1).max(150),
  degree: Text.default(""),
  year: Text.default(""),
});

export const ProjectItem = z.object({
  name: z.string().trim().min(1).max(150),
  url: Url.default(""),
  bullets: Bullets.default([]),
});

export const Profile = z.object({
  basics: Basics,
  github: Url.default(""),
  portfolio: Url.default(""),
  linkedin: Url.default(""),
  behance: Url.default(""),
  certifications: TagList.default([]),
  tools: TagList.default([]),
  languages: TagList.default([]),
  experience: z.array(ExperienceItem).max(10).default([]),
  education: z.array(EducationItem).max(5).default([]),
  projects: z.array(ProjectItem).max(8).default([]),
});

export type Profile = z.infer<typeof Profile>;
export type ProfileDraft = z.input<typeof Profile>;

export function emptyProfile(): ProfileDraft {
  return {
    basics: { name: "", email: "", phone: "", location: "" },
    github: "",
    portfolio: "",
    linkedin: "",
    behance: "",
    certifications: [],
    tools: [],
    languages: [],
    experience: [],
    education: [],
    projects: [],
  };
}

export type FieldKey = (typeof FIELD_CATALOG)[number];

export type FieldKind = "url" | "tags" | "list";

export type FieldSpec = {
  kind: FieldKind;
  label: string;
  placeholder?: string;
  prefix?: string;
};

export const FIELD_SPECS = {
   github: { kind: "url", label: "GitHub profile", prefix: "https://github.com/", placeholder: "yourname" },
  portfolio: { kind: "url", label: "Portfolio website", placeholder: "yourwebsite.com" },
  linkedin: { kind: "url", label: "LinkedIn profile", prefix: "https://www.linkedin.com/in/", placeholder: "yourname" },
  behance: { kind: "url", label: "Behance profile", prefix: "https://www.behance.net/", placeholder: "yourname" },
  certifications: { kind: "tags", label: "Certifications", placeholder: "Type one, then press Enter" },
  tools: { kind: "tags", label: "Tools", placeholder: "Type one, then press Enter" },
  languages: { kind: "tags", label: "Languages", placeholder: "Type one, then press Enter" },
  experience: { kind: "list", label: "Work experience" },
  education: { kind: "list", label: "Education" },
  projects: { kind: "list", label: "Projects" },
} satisfies Record<FieldKey, FieldSpec>;

export type AnalysisResult = z.infer<typeof AnalysisResult>;

export type JobAnalysis = z.infer<typeof JobAnalysis>;


export function cleanUsername(input: string, prefix: string): string {
  const bare = prefix.replace(/^https?:\/\/(www\.)?/i, "").toLowerCase();
  let v = input.trim().replace(/^https?:\/\//i, "").replace(/^www\./i, "");
  if (v.toLowerCase().startsWith(bare)) v = v.slice(bare.length);
  v = v.replace(/^@+/, "").replace(/^\/+/, "");
  v = v.split(/[/?#]/)[0];
  return v.replace(/[^A-Za-z0-9._-]/g, "").slice(0, 60);
}

export function buildUrl(prefix: string, username: string): string {
  return username ? prefix + username : "";
}

export function usernameFromUrl(url: string, prefix: string): string {
  return url.startsWith(prefix) ? url.slice(prefix.length) : cleanUsername(url, prefix);
}

export function normalizeWebsite(input: string): string {
  const v = input.trim();
  if (!v) return "";
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}