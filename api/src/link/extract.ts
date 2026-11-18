import * as cheerio from "cheerio";
import { LinkError } from "./safeFetch.js";

type Obj = Record<string, unknown>;

const MIN_CHARS = 200;

function clean(s: string): string {
  return s
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function htmlToText(html: string): string {
  const $ = cheerio.load(html);
  $("script, style, noscript, svg, iframe, nav, footer, form, aside").remove();
  $("br").replaceWith("\n");
  $("li").prepend("- ");
  $("p, div, li, h1, h2, h3, h4, h5, h6, tr").append("\n");
  return clean($("body").text());
}

function findJobPosting(node: unknown): Obj | null {
  if (Array.isArray(node)) {
    for (const item of node) {
      const found = findJobPosting(item);
      if (found) return found;
    }
    return null;
  }
  if (!node || typeof node !== "object") return null;
  const obj = node as Obj;
  const type = obj["@type"];
  const types = Array.isArray(type) ? type : [type];
  if (types.includes("JobPosting")) return obj;
  return findJobPosting(obj["@graph"]);
}

function fromStructuredData($: cheerio.CheerioAPI): string | null {
  for (const el of $('script[type="application/ld+json"]').toArray()) {
    let data: unknown;
    try {
      data = JSON.parse($(el).text());
    } catch {
      continue;
    }

    const job = findJobPosting(data);
    if (!job) continue;

    const title = typeof job.title === "string" ? job.title : "";
    const org = job.hiringOrganization;
    const company =
      org && typeof org === "object" && typeof (org as Obj).name === "string"
        ? ((org as Obj).name as string)
        : "";

    let description = typeof job.description === "string" ? job.description : "";
    if (description.includes("&lt;")) {
      description = cheerio.load(description).root().text();
    }

    const text = clean(`${title}\n${company}\n\n${htmlToText(description)}`);
    if (text.length >= MIN_CHARS) return text;
  }
  return null;
}

export function extractJobText(html: string): string {
  const $ = cheerio.load(html);

  const structured = fromStructuredData($);
  if (structured) return structured;

  const text = htmlToText(html);
  if (text.length < MIN_CHARS) throw new LinkError("no_text");
  return text;
}