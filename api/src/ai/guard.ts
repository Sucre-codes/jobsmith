import type { AiWriting, GenerateRequest } from "@jobsmith/shared";

export type Banned = { resume: string[]; letter: string[] };

const COMMON_TECH = [
  "HTML", "CSS", "JavaScript", "TypeScript", "React", "React Native", "Vue", "Angular", "Svelte",
  "Next.js", "Node.js", "Python", "Django", "Java", "Spring Boot", "C#", ".NET", "C++", "Go",
  "Rust", "PHP", "Laravel", "Ruby", "Rails", "Swift", "Kotlin", "SQL", "MySQL", "PostgreSQL",
  "MongoDB", "Redis", "GraphQL", "Docker", "Kubernetes", "AWS", "Azure", "Google Cloud", "Git",
  "GitHub", "GitLab", "Linux", "Jenkins", "Terraform", "Figma", "Photoshop", "Illustrator",
  "Jira", "Tailwind CSS", "Bootstrap", "Sass", "Webpack", "Vite", "Jest", "Cypress", "Selenium",
  "Tableau", "Power BI", "Salesforce", "HubSpot", "Zendesk", "TensorFlow", "PyTorch", "Pandas",
  "Firebase", "cross-browser", "continuous integration", "CI/CD", "unit testing", "test-driven",
];

const CASE_SENSITIVE = new Set(["Go", "Rust", "Swift", "Ruby", "Rails"]);

const GLUED = /\b[A-Z]{2,}[a-z]{4,}\b/g;

export function mentions(text: string, term: string): boolean {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const flags = CASE_SENSITIVE.has(term) ? "" : "i";
  return new RegExp(`(^|[^A-Za-z0-9])${escaped}($|[^A-Za-z0-9])`, flags).test(text);
}

const norm = (s: string) => s.trim().toLowerCase().replace(/\.?js$/, "");

export function forbiddenTerms(req: GenerateRequest): Banned {
  const kept = new Set(
    [...req.profile.skills, ...req.profile.tools, ...req.profile.certifications].map(norm)
  );
  const notKept = (t: string) => !kept.has(norm(t));

  const resume = [...new Set([...COMMON_TECH, ...req.job.keywords])].filter(notKept);
  const letter = COMMON_TECH.filter((t) => notKept(t) && !mentions(req.jobText, t));
  return { resume, letter };
}

function resumeText(w: AiWriting): string {
  return [
    w.summary,
    ...w.experience.flatMap((e) => e.bullets),
    ...w.projects.flatMap((p) => p.bullets),
  ].join("\n");
}

export function findProblems(w: AiWriting, banned: Banned): string | null {
  const body = resumeText(w);
  const terms = new Set<string>();
  for (const t of banned.resume) if (mentions(body, t)) terms.add(t);
  for (const t of banned.letter) if (mentions(w.coverLetter, t)) terms.add(t);

  const glued = [...new Set(`${body}\n${w.coverLetter}`.match(GLUED) ?? [])];

  const parts: string[] = [];
  if (terms.size > 0) {
    parts.push(
      `You mentioned technologies the candidate did not list: ${[...terms].join(", ")}. Remove every mention of them.`
    );
  }
  if (glued.length > 0) {
    parts.push(`These look like words stuck together: ${glued.join(", ")}. Fix the spacing.`);
  }
  return parts.length > 0 ? parts.join(" ") : null;
}