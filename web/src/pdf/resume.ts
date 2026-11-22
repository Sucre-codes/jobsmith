import {
  contactLine,
  dateRange,
  educationLine,
  skillLines,
  type ResumeDoc,
} from "@jobsmith/shared";
import type { TemplateStyle } from "./styles";

type Node = Record<string, unknown>;

export const A4_WIDTH = 595.28;

export function linkParts(links: ResumeDoc["links"]): Node[] {
  return links.flatMap((l, i) => [
    ...(i > 0 ? [{ text: " | " }] : []),
    { text: `${l.label}: ` },
    { text: l.url, link: l.url },
  ]);
}

export function buildResumeDoc(r: ResumeDoc, s: TemplateStyle): object {
  const width = A4_WIDTH - s.margins[0] - s.margins[2];

  const heading = (title: string): Node => ({
    stack: [
      {
        text: title.toUpperCase(),
        bold: true,
        fontSize: s.headingSize,
        color: s.accent,
        margin: [0, s.sectionGap, 0, 2],
      },
      ...(s.headingRule
        ? [
            {
              canvas: [
                { type: "line", x1: 0, y1: 0, x2: width, y2: 0, lineWidth: 0.6, lineColor: s.accent },
              ],
              margin: [0, 0, 0, 4],
            },
          ]
        : []),
    ],
  });

  const section = (title: string, entries: Node[]): Node[] => {
    if (entries.length === 0) return [];
    const [first, ...rest] = entries;
    return [{ stack: [heading(title), first], unbreakable: true }, ...rest];
  };

    const bullets = (list: string[]): Node[] =>
    list.length > 0 ? [{ ul: [...list], margin: [0, 2, 0, 0] }] : [];
  const summary: Node[] = r.summary ? [{ text: r.summary }] : [];

  const experience: Node[] = r.experience.map((e) => ({
    stack: [
      { text: `${e.title}, ${e.company}`, bold: true, margin: [0, s.entryGap, 0, 0] },
      { text: dateRange(e.start, e.end, e.current), color: s.muted },
      ...bullets(e.bullets),
    ],
    unbreakable: true,
  }));

  const projects: Node[] = r.projects.map((p) => ({
    stack: [
      {
        text: [
          { text: p.name, bold: true },
          ...(p.url ? [{ text: " (" }, { text: p.url, link: p.url }, { text: ")" }] : []),
        ],
        margin: [0, s.entryGap, 0, 0],
      },
      ...bullets(p.bullets),
    ],
    unbreakable: true,
  }));

  const education: Node[] = r.education.map((e) => ({
    text: educationLine(e),
    margin: [0, 2, 0, 0],
  }));

  const skills: Node[] = skillLines(r).map((line) => ({
    text: line,
    margin: [0, 1, 0, 0],
  }));

  const links = linkParts(r.links);

  return {
    info: { title: `${r.basics.name} - Resume`, author: r.basics.name },
    pageSize: "A4",
    pageMargins: s.margins,
    defaultStyle: { font: "Roboto", fontSize: s.fontSize, lineHeight: s.lineHeight },
    content: [
      { text: r.basics.name, fontSize: s.nameSize, bold: true, color: s.accent, alignment: s.align },
      { text: contactLine(r.basics), alignment: s.align, margin: [0, 3, 0, 0] },
      ...(links.length > 0
        ? [{ text: links, alignment: s.align, margin: [0, 1, 0, 0] }]
        : []),
      ...section("Summary", summary),
      ...section("Experience", experience),
      ...section("Projects", projects),
      ...section("Education", education),
      ...section("Skills", skills),
    ],
  };
}