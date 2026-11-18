import { Agent, fetch, type Response } from "undici";
import dns from "node:dns";
import net from "node:net";

export class LinkError extends Error {
  code: string;
  constructor(code: string) {
    super(code);
    this.code = code;
  }
}

const MAX_BYTES = 1_000_000;
const MAX_REDIRECTS = 3;

function isPrivateIp(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split(".").map(Number);
    return (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      a >= 224
    );
  }
  if (net.isIPv6(ip)) {
    const v = ip.toLowerCase();
    if (v.startsWith("::ffff:")) {
      const rest = v.slice(7);
      if (rest.includes(".")) return isPrivateIp(rest);
      const parts = rest.split(":");
      if (parts.length === 2) {
        const hi = parseInt(parts[0], 16);
        const lo = parseInt(parts[1], 16);
        return isPrivateIp(`${hi >> 8}.${hi & 255}.${lo >> 8}.${lo & 255}`);
      }
      return true;
    }
    return (
      v === "::" ||
      v === "::1" ||
      v.startsWith("fc") ||
      v.startsWith("fd") ||
      /^fe[89ab]/.test(v) ||
      v.startsWith("ff")
    );
  }
  return true;
}

const guardedLookup: net.LookupFunction = (hostname, options, callback) => {
  dns.lookup(hostname, { ...options, all: true }, (err, addrs) => {
    if (err) return callback(err, "");
    if (addrs.length === 0 || addrs.some((a) => isPrivateIp(a.address))) {
      return callback(new Error("blocked_address"), "");
    }
    if (options.all) return callback(null, addrs);
    return callback(null, addrs[0].address, addrs[0].family);
  });
};

const agent = new Agent({
  connect: { lookup: guardedLookup },
  headersTimeout: 10_000,
  bodyTimeout: 10_000,
});

function parseUrl(raw: string): URL {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new LinkError("invalid_url");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new LinkError("invalid_url");
  }
  if (url.username || url.password) throw new LinkError("invalid_url");
  if (url.port && url.port !== "80" && url.port !== "443") {
    throw new LinkError("invalid_url");
  }
  const host = url.hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local") ||
    host.endsWith(".internal")
  ) {
    throw new LinkError("blocked");
  }
  if (net.isIP(host) && isPrivateIp(host)) throw new LinkError("blocked");
  return url;
}

async function readCapped(res: Response): Promise<string> {
  const reader = res.body?.getReader();
  if (!reader) return "";
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_BYTES) {
      await reader.cancel();
      throw new LinkError("too_large");
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks).toString("utf8");
}

export async function fetchPage(
  rawUrl: string
): Promise<{ html: string; finalUrl: string }> {
  let url = parseUrl(rawUrl);

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    let res: Response;
    try {
      res = await fetch(url, {
        dispatcher: agent,
        redirect: "manual",
        signal: AbortSignal.timeout(10_000),
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; JobsmithBot/1.0)",
          Accept: "text/html,application/xhtml+xml",
        },
      });
    } catch (err) {
      const cause = err instanceof Error ? (err.cause as Error | undefined) : undefined;
      throw new LinkError(cause?.message === "blocked_address" ? "blocked" : "unreachable");
    }

    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location");
      await res.body?.cancel();
      if (!location) throw new LinkError("bad_redirect");
      url = parseUrl(new URL(location, url).toString());
      continue;
    }

    if (!res.ok) {
  console.warn(`page_error ${res.status} from ${url.hostname}`);
  await res.body?.cancel();
  throw new LinkError("page_error");
}

    const type = res.headers.get("content-type") ?? "";
    if (!/text\/html|application\/xhtml\+xml/i.test(type)) {
      await res.body?.cancel();
      throw new LinkError("not_html");
    }

    return { html: await readCapped(res), finalUrl: url.toString() };
  }

  throw new LinkError("too_many_redirects");
}