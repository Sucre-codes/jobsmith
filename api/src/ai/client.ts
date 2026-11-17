import { getPool } from "./keyPool.js";

export class AiBusyError extends Error {
  retryAfter: number;
  constructor(retryAfter: number) {
    super("AI is busy");
    this.retryAfter = retryAfter;
  }
}

export class AiRequestError extends Error {}

type Message = { role: "system" | "user"; content: string };

type ChatReply = { choices?: { message?: { content?: unknown } }[] };

export async function chatJson(messages: Message[]): Promise<string> {
  const pool = getPool();
  const baseUrl = process.env.AI_BASE_URL;
  const model = process.env.AI_MODEL;
  if (!baseUrl || !model || pool.size === 0) {
    throw new Error("AI is not configured");
  }

  const maxAttempts = Math.max(3, pool.size);

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const k = pool.acquire();
    if (!k) break;

    try {
      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${k.key}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.2,
          response_format: { type: "json_object" },
        }),
        signal: AbortSignal.timeout(30_000),
      });

      if (res.ok) {
        const data = (await res.json()) as ChatReply;
        const text = data.choices?.[0]?.message?.content;
        if (typeof text === "string") return text;
        pool.cooldown(k, 10);
        continue;
      }

      if (res.status === 429) {
        const wait = Number(res.headers.get("retry-after")) || 60;
        pool.cooldown(k, Math.min(wait, 3600));
        continue;
      }

      if (res.status === 401 || res.status === 403) {
        console.warn(`AI key ${pool.label(k)} rejected (${res.status}), disabling`);
        pool.disable(k);
        continue;
      }

     if (res.status >= 400 && res.status < 500) {
  const detail = (await res.text()).slice(0, 300);
  throw new AiRequestError(`AI request rejected (${res.status}): ${detail}`);
}

      pool.cooldown(k, 10);
    } catch (err) {
      if (err instanceof AiRequestError) throw err;
      pool.cooldown(k, 10);
    }
  }

  const wait = pool.secondsUntilFree();
  if (wait > 0) throw new AiBusyError(wait);
  throw new Error("No working AI keys");
}