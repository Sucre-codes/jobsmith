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

export type AnalysisResult = z.infer<typeof AnalysisResult>;

export type JobAnalysis = z.infer<typeof JobAnalysis>;