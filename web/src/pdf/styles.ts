export type TemplateStyle = {
  id: "classic" | "modern" | "compact";
  label: string;
  fontSize: number;
  nameSize: number;
  headingSize: number;
  lineHeight: number;
  margins: [number, number, number, number];
  accent: string;
  muted: string;
  align: "left" | "center";
  headingRule: boolean;
  sectionGap: number;
  entryGap: number;
};

export const CLASSIC: TemplateStyle = {
  id: "classic",
  label: "Classic",
  fontSize: 10.5,
  nameSize: 20,
  headingSize: 11,
  lineHeight: 1.15,
  margins: [50, 45, 50, 45],
  accent: "#000000",
  muted: "#444444",
  align: "center",
  headingRule: true,
  sectionGap: 10,
  entryGap: 5,
};

export const MODERN: TemplateStyle = {
  id: "modern",
  label: "Modern",
  fontSize: 10.5,
  nameSize: 22,
  headingSize: 11,
  lineHeight: 1.2,
  margins: [48, 44, 48, 44],
  accent: "#1E40AF",
  muted: "#555555",
  align: "left",
  headingRule: true,
  sectionGap: 12,
  entryGap: 6,
};

export const COMPACT: TemplateStyle = {
  id: "compact",
  label: "Compact",
  fontSize: 9.5,
  nameSize: 17,
  headingSize: 10,
  lineHeight: 1.1,
  margins: [36, 32, 36, 32],
  accent: "#000000",
  muted: "#444444",
  align: "left",
  headingRule: true,
  sectionGap: 7,
  entryGap: 3,
};

export const TEMPLATES: TemplateStyle[] = [CLASSIC, MODERN, COMPACT];

export type TemplateId = TemplateStyle["id"];

export function templateById(id: string): TemplateStyle {
  return TEMPLATES.find((t) => t.id === id) ?? CLASSIC;
}