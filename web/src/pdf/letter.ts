import { contactLine, type ResumeDoc } from "@jobsmith/shared";
import { A4_WIDTH, linkParts } from "./resume";
import type { TemplateStyle } from "./styles";

export function letterText(letter: string): string {
  return letter.replace(/\r\n/g, "\n").trim() + "\n";
}

export function letterBlob(letter: string): Blob {
  return new Blob([letterText(letter)], { type: "text/plain;charset=utf-8" });
}

export function buildLetterDoc(
  letter: string,
  r: ResumeDoc,
  s: TemplateStyle,
  date: Date = new Date()
): object {
  const margins = s.margins.map((m) => Math.max(m, 56)) as [number, number, number, number];
  const width = A4_WIDTH - margins[0] - margins[2];
  const paragraphs = letter
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  const links = linkParts(r.links);
  const dateText = date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return {
    info: { title: `${r.basics.name} - Cover Letter`, author: r.basics.name },
    pageSize: "A4",
    pageMargins: margins,
    defaultStyle: { font: "Roboto", fontSize: Math.max(s.fontSize, 10.5), lineHeight: 1.25 },
    content: [
      { text: r.basics.name, fontSize: s.nameSize, bold: true, color: s.accent, alignment: s.align },
      { text: contactLine(r.basics), alignment: s.align, margin: [0, 3, 0, 0] },
      ...(links.length > 0 ? [{ text: links, alignment: s.align, margin: [0, 1, 0, 0] }] : []),
      ...(s.headingRule
        ? [
            {
              canvas: [
                { type: "line", x1: 0, y1: 0, x2: width, y2: 0, lineWidth: 0.6, lineColor: s.accent },
              ],
              margin: [0, 8, 0, 0],
            },
          ]
        : []),
      { text: dateText, margin: [0, 16, 0, 14] },
      ...paragraphs.map((p) => ({ text: p, margin: [0, 0, 0, 10] })),
    ],
  };
}