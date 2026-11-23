import { z } from "zod";

export const FIELD_CATALOG = [
  "github",
  "portfolio",
  "linkedin",
  "behance",
  "certifications",
  "tools",
  "spokenLanguages",
  "skills",
  "experience",
  "education",
  "projects",
] as const;

export const ROLE_TYPES = [
  "software",
  "data",
  "design",
  "security",
  "marketing",
  "writing",
  "product",
  "support",
  "sales",
  "operations",
  "other",
] as const;

export type RoleType = (typeof ROLE_TYPES)[number];

export const JobAnalysis = z.object({
  title: z.string(),
  company: z.string().optional(),
  roleType: z.enum(ROLE_TYPES),
 yearsRequired: z.number().nullable(),
   jobText: z.string(),
  fields: z.array(
    z.object({
      key: z.enum(FIELD_CATALOG),
      label: z.string(),
      required: z.boolean(),
      options: z.array(z.string()).default([]),
    })
  ),
});

export type JobAnalysis = z.infer<typeof JobAnalysis>;

const Options = z.array(z.string()).default([]);

export const AiReading = z.object({
  title: z.string(),
  company: z.string().optional(),
  roleType: z.enum(ROLE_TYPES),
  yearsRequired: z.number().int().min(0).max(40).nullable().catch(null),
  skills: Options,
  tools: Options,
  certifications: Options,
  spokenLanguages: Options,
});

export type AiReading = z.infer<typeof AiReading>;

export const AiResult = z.discriminatedUnion("kind", [
  AiReading.extend({ kind: z.literal("job_posting") }),
  z.object({ kind: z.literal("job_list") }),
  z.object({ kind: z.literal("not_a_job") }),
]);

export const AnalysisResult = z.discriminatedUnion("kind", [
  JobAnalysis.extend({ kind: z.literal("job_posting") }),
  z.object({ kind: z.literal("job_list") }),
  z.object({ kind: z.literal("not_a_job") }),
]);

export type AnalysisResult = z.infer<typeof AnalysisResult>;

const Text = z.string().trim().max(200);
const Url = z.union([
  z.literal(""),
  z.string().trim().url().max(300).regex(/^https?:\/\//i),
]);
const TagList = z.array(z.string().trim().min(1).max(60)).max(30);

export const Basics = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(200),
  phone: Text.default(""),
  location: Text.default(""),
});

const MONTH_FORMAT = /^\d{4}-(0[1-9]|1[0-2])$/;
const MonthText = z.string().regex(MONTH_FORMAT);

export const ExperienceItem = z
  .object({
    company: z.string().trim().min(1).max(150),
    title: z.string().trim().min(1).max(150),
    start: MonthText,
    end: z.string().default(""),
    current: z.boolean().default(false),
  })
  .refine((e) => e.current || (MONTH_FORMAT.test(e.end) && e.end >= e.start), {
    path: ["end"],
    message: "End date must be a real month, not before the start",
  });

export const EducationItem = z.object({
  school: z.string().trim().min(1).max(150),
  degree: Text.default(""),
  year: z.string().regex(/^(\d{4})?$/).default(""),
});

export const ProjectItem = z.object({
  name: z.string().trim().min(1).max(150),
  url: Url.default(""),
  description: Text.default(""),
});

export const Profile = z.object({
  basics: Basics,
  github: Url.default(""),
  portfolio: Url.default(""),
  linkedin: Url.default(""),
  behance: Url.default(""),
  certifications: TagList.default([]),
  tools: TagList.default([]),
  skills: TagList.default([]),
  spokenLanguages: TagList.default([]),
  experience: z.array(ExperienceItem).max(10).default([]),
  education: z.array(EducationItem).max(5).default([]),
  projects: z.array(ProjectItem).max(8).default([]),
});

export type Profile = z.infer<typeof Profile>;
export type ProfileDraft = Profile;

export function emptyProfile(): ProfileDraft {
  return {
    basics: { name: "", email: "", phone: "", location: "" },
    github: "",
    portfolio: "",
    linkedin: "",
    behance: "",
    certifications: [],
    tools: [],
    skills: [],
    spokenLanguages: [],
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
  spokenLanguages: { kind: "tags", label: "spoken Languages", placeholder: "English, French" },
  experience: { kind: "list", label: "Work experience" },
  education: { kind: "list", label: "Education" },
  projects: { kind: "list", label: "Projects" },
    skills: { kind: "tags", label: "Skills", placeholder: "Type one, then press Enter" },
} satisfies Record<FieldKey, FieldSpec>;

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

export const TAG_KEYS = ["skills", "tools", "certifications", "spokenLanguages"] as const;
export type TagKey = (typeof TAG_KEYS)[number];

export function prefillFromAnalysis(
  draft: ProfileDraft,
  fields: { key: FieldKey; options: string[] }[]
): ProfileDraft {
  const next: ProfileDraft = { ...draft };
  for (const key of TAG_KEYS) {
    const field = fields.find((f) => f.key === key);
    if (!field) continue;
    const merged = [...(next[key] ?? [])];
    for (const option of field.options) {
      if (merged.length >= 30) break;
      if (merged.some((t) => t.toLowerCase() === option.toLowerCase())) continue;
      merged.push(option);
    }
    next[key] = merged;
  }
  return next;
}

export const ROLE_FIELDS: Record<RoleType, FieldKey[]> = {
  software: ["experience", "education", "skills", "tools", "projects", "github", "portfolio", "linkedin"],
  data: ["experience", "education", "skills", "tools", "projects", "github", "portfolio", "linkedin"],
  design: ["experience", "education", "skills", "tools", "portfolio", "behance", "linkedin"],
  security: ["experience", "education", "skills", "tools", "certifications", "projects", "github", "linkedin"],
  marketing: ["experience", "education", "skills", "tools", "portfolio", "linkedin"],
  writing: ["experience", "education", "skills", "tools", "portfolio", "linkedin"],
  product: ["experience", "education", "skills", "tools", "portfolio", "linkedin"],
  support: ["experience", "education", "skills", "tools", "linkedin"],
  sales: ["experience", "education", "skills", "tools", "linkedin"],
  operations: ["experience", "education", "skills", "tools", "linkedin"],
  other: ["experience", "education", "skills", "tools", "linkedin"],
};

export const REQUIRED_FIELDS: FieldKey[] = ["skills","education","experience"];

export type ExperienceItem = z.infer<typeof ExperienceItem>;
export type EducationItem = z.infer<typeof EducationItem>;
export type ProjectItem = z.infer<typeof ProjectItem>;

export const emptyExperience = (): ExperienceItem => ({
  company: "",
  title: "",
  start: "",
  end: "",
  current: false,
  
});
export const emptyProject = (): ProjectItem => ({ name: "", url: "", description: "" });
export const emptyEducation = (): EducationItem => ({ school: "", degree: "", year: "" });


function monthIndex(ym: string): number | null {
  if (!MONTH_FORMAT.test(ym)) return null;
  const [y, m] = ym.split("-").map(Number);
  return y * 12 + (m - 1);
}

export function experienceMonths(
  items: { start: string; end: string; current: boolean }[],
  now: Date = new Date()
): number {
  const nowIndex = now.getFullYear() * 12 + now.getMonth();
  const spans: [number, number][] = [];

  for (const item of items) {
    const s = monthIndex(item.start);
    const rawEnd = item.current ? nowIndex : monthIndex(item.end);
    if (s === null || rawEnd === null) continue;
    const e = Math.min(rawEnd, nowIndex);
    if (e < s) continue;
    spans.push([s, e]);
  }

  spans.sort((a, b) => a[0] - b[0]);

  let total = 0;
  let open: [number, number] | null = null;
  for (const [s, e] of spans) {
    if (open && s <= open[1]) {
      open[1] = Math.max(open[1], e);
    } else {
      if (open) total += open[1] - open[0] + 1;
      open = [s, e];
    }
  }
  if (open) total += open[1] - open[0] + 1;
  return total;
}

export function formatDuration(months: number): string {
  const y = Math.floor(months / 12);
  const m = months % 12;
  const parts: string[] = [];
  if (y) parts.push(`${y} year${y === 1 ? "" : "s"}`);
  if (m || !y) parts.push(`${m} month${m === 1 ? "" : "s"}`);
  return parts.join(" ");
}

export const specOf = (key: FieldKey): FieldSpec => FIELD_SPECS[key];

export function isFieldValid(key: FieldKey, value: unknown): boolean {
  return (Profile.shape[key] as z.ZodType).safeParse(value).success;
}

const L = z.string();
const LA = z.array(z.string());

export const DraftSchema = z.object({
  basics: z.object({ name: L, email: L, phone: L, location: L }),
  github: L,
  portfolio: L,
  linkedin: L,
  behance: L,
  certifications: LA,
  tools: LA,
  spokenLanguages: LA,
  skills: LA,
  experience: z.array(
    z.object({ company: L, title: L, start: L, end: L, current: z.boolean() })
  ),
  education: z.array(z.object({ school: L, degree: L, year: L })),
  projects: z.array(z.object({ name: L, url: L, description: L })),
});

export const GenerateRequest = z.object({
  jobText: z.string().trim().min(50).max(12_000),
  job: z.object({
    title: z.string().trim().min(1).max(150),
    company: z.string().trim().max(150).default(""),
    roleType: z.enum(ROLE_TYPES),
    keywords: z.array(z.string().trim().min(1).max(60)).max(50).default([]),
  }),
  profile: Profile,
});

export type GenerateRequest = z.infer<typeof GenerateRequest>;

const Bullet = z.string().trim().min(10).max(300);

export const AiWriting = z.object({
  summary: z.string().trim().min(20).max(600),
  experience: z
    .array(z.object({ index: z.number().int().min(0), bullets: z.array(Bullet).min(1).max(6) }))
    .default([]),
  projects: z
    .array(z.object({ index: z.number().int().min(0), bullets: z.array(Bullet).min(1).max(3) }))
    .default([]),
  coverLetter: z.string().trim().min(100).max(3000),
});

export type AiWriting = z.infer<typeof AiWriting>;

export const ResumeDoc = z.object({
  basics: Basics,
  links: z.array(z.object({ label: z.string(), url: z.string() })),
  summary: z.string(),
  experience: z.array(
    z.object({
      title: z.string(),
      company: z.string(),
      start: z.string(),
      end: z.string(),
      current: z.boolean(),
      bullets: z.array(z.string()),
    })
  ),
  projects: z.array(
    z.object({ name: z.string(), url: z.string(), bullets: z.array(z.string()) })
  ),
  education: z.array(z.object({ school: z.string(), degree: z.string(), year: z.string() })),
  skills: z.array(z.string()),
  tools: z.array(z.string()),
  certifications: z.array(z.string()),
  spokenLanguages: z.array(z.string()),
});

export type ResumeDoc = z.infer<typeof ResumeDoc>;

export const GenerateResponse = z.object({
  resume: ResumeDoc,
  coverLetter: z.string(),
});

export type GenerateResponse = z.infer<typeof GenerateResponse>;

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatMonth(ym: string): string {
  if (!MONTH_FORMAT.test(ym)) return ym;
  const [y, m] = ym.split("-");
  return `${MONTH_NAMES[Number(m) - 1]} ${y}`;
}

export function dateRange(start: string, end: string, current: boolean): string {
  return `${formatMonth(start)} - ${current ? "Present" : formatMonth(end)}`;
}

export function contactLine(b: { email: string; phone: string; location: string }): string {
  return [b.email, b.phone, b.location].filter(Boolean).join(" | ");
}

export function linkText(l: { label: string; url: string }): string {
  return `${l.label}: ${l.url}`;
}

export function educationLine(e: { school: string; degree: string; year: string }): string {
  return [e.degree, e.school, e.year].filter(Boolean).join(", ");
}

export function skillLines(r: ResumeDoc): string[] {
  const lines: string[] = [];
  if (r.skills.length > 0) lines.push(`Skills: ${r.skills.join(", ")}`);
  if (r.tools.length > 0) lines.push(`Tools: ${r.tools.join(", ")}`);
  if (r.certifications.length > 0) lines.push(`Certifications: ${r.certifications.join(", ")}`);
  if (r.spokenLanguages.length > 0) lines.push(`Languages: ${r.spokenLanguages.join(", ")}`);
  return lines;
}

function safeName(s: string): string {
  return s
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/g, "");
}

export function fileNames(name: string, company: string, jobTitle: string) {
  const who = safeName(name) || "Candidate";
  const where = safeName(company) || safeName(jobTitle) || "Job";
  return {
    resumePdf: `${who}-Resume-${where}.pdf`,
    letterPdf: `${who}-Cover-Letter-${where}.pdf`,
    letterTxt: `${who}-Cover-Letter-${where}.txt`,
  };
}
export function experienceCopy(e: ResumeDoc["experience"][number]): string {
  return [
    `${e.title}, ${e.company}`,
    dateRange(e.start, e.end, e.current),
    ...e.bullets.map((b) => `- ${b}`),
  ].join("\n");
}

export function projectCopy(p: ResumeDoc["projects"][number]): string {
  return [p.url ? `${p.name} (${p.url})` : p.name, ...p.bullets.map((b) => `- ${b}`)].join("\n");
}

export const AnswerRequest = GenerateRequest.extend({
  question: z.string().trim().min(5).max(600),
});

export type AnswerRequest = z.infer<typeof AnswerRequest>;

export const AnswerResponse = z.object({
  kind: z.enum(["answer", "declined"]),
  text: z.string().trim().min(1).max(3000),
});

export type AnswerResponse = z.infer<typeof AnswerResponse>;

export const QaItem = z.object({
  id: z.string().min(1).max(64),
  question: z.string().max(800),
  kind: z.enum(["answer", "declined"]),
  text: z.string().max(3000),
});

export type QaItem = z.infer<typeof QaItem>;

export const MAX_QA = 20;

export function countWords(text: string): number {
  const t = text.trim();
  return t ? t.split(/\s+/).length : 0;
}

export function parseLimit(
  question: string
): { unit: "words" | "characters"; max: number } | null {
  const pattern = /(?<!\d)(\d{1,5})\s*(words?|characters?|chars?)\b/gi;
  let best: { unit: "words" | "characters"; max: number } | null = null;

  for (const m of question.matchAll(pattern)) {
    const start = m.index ?? 0;
    const before = question.slice(Math.max(0, start - 14), start).toLowerCase();
    if (/(at least|minimum|min\.?)\s*$/.test(before)) continue;

    const max = Number(m[1]);
    const unit = m[2].toLowerCase().startsWith("w") ? "words" : "characters";
    if (max > 0 && (!best || (best.unit === unit && max > best.max))) best = { unit, max };
  }
  return best;
}

export const QaList = z.array(QaItem).max(MAX_QA);