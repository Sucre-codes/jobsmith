import { useState, type ReactNode } from "react";
import { Copy, Loader, SendHorizontal, Trash2 } from "lucide-react";
import {
  MAX_QA,
  countWords,
  parseLimit,
  type ProfileDraft,
  type QaItem,
} from "@jobsmith/shared";
import { askQuestion, describeAnswerError } from "../answer";
import type { Analysis } from "../api";
import { copyText } from "../clipboard";
import { buildRequest } from "../generate";
import { useToast } from "../toast";

type Props = {
  analysis: Analysis;
  draft: ProfileDraft;
  items: QaItem[];
  onChange: (items: QaItem[]) => void;
};

const HAS_PLACEHOLDER = /\[[^\]\n]{2,80}\]/;
const SPLIT_PLACEHOLDER = /(\[[^\]\n]{2,80}\])/g;

function highlight(text: string): ReactNode[] {
  return text.split(SPLIT_PLACEHOLDER).map((part, i) =>
    i % 2 === 1 ? (
      <mark key={i} className="rounded bg-amber-400/20 px-1 text-amber-200">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

export default function QuestionHelper({ analysis, draft, items, onChange }: Props) {
  const toast = useToast();
  const [question, setQuestion] = useState("");
  const [sending, setSending] = useState(false);

  const trimmed = question.trim();
  const limit = parseLimit(trimmed);
  const canSend = trimmed.length >= 5 && !sending;

  async function send() {
    if (!canSend) return;

    const built = buildRequest(analysis, draft);
    if (!built.ok) {
      toast.error(built.message);
      return;
    }

    setSending(true);
    const outcome = await askQuestion({ ...built.request, question: trimmed });
    setSending(false);

    if (!outcome.ok) {
      toast.error(describeAnswerError(outcome.error, outcome.retryAfter));
      return;
    }

    const item: QaItem = {
      id: crypto.randomUUID(),
      question: trimmed,
      kind: outcome.reply.kind,
      text: outcome.reply.text,
    };
    onChange([item, ...items].slice(0, MAX_QA));
    setQuestion("");
  }

  async function copy(item: QaItem) {
    const ok = await copyText(item.text);
    if (!ok) {
      toast.error("Couldn't copy. Select the text and copy it by hand.");
      return;
    }
    toast.success(
      HAS_PLACEHOLDER.test(item.text)
        ? "Answer copied. Fill in the [brackets] before you send it."
        : "Answer copied"
    );
  }

  function remove(id: string) {
    onChange(items.filter((i) => i.id !== id));
  }

  return (
    <section className="mt-6">
      <h3 className="text-base font-semibold text-white">Ask about this application</h3>
      <p className="mt-1 text-sm text-slate-400">
        Paste a question from the application form. Answers use only your details and this job.
      </p>

      <label htmlFor="qa-question" className="sr-only">
        Application question
      </label>
      <textarea
        id="qa-question"
        rows={3}
        maxLength={800}
        value={question}
        disabled={sending}
        placeholder="e.g. Why do you want to work here? (max 100 words)"
        onChange={(e) => setQuestion(e.target.value)}
        onKeyDown={(e) => {
          if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
            e.preventDefault();
            void send();
          }
        }}
        className="mt-3 w-full rounded-lg bg-slate-900 p-3 text-slate-100 outline-none ring-1 ring-slate-700 focus:ring-indigo-500 disabled:opacity-60"
      />

      <div className="mt-2 flex items-center justify-between gap-3">
        <p className="text-xs text-slate-400">
          {limit ? `Limit found: ${limit.max} ${limit.unit}. The answer will stay under it.` : ""}
        </p>
        <button
          type="button"
          onClick={send}
          disabled={!canSend}
          className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {sending ? (
            <Loader aria-hidden="true" className="h-4 w-4 animate-spin" />
          ) : (
            <SendHorizontal aria-hidden="true" className="h-4 w-4" />
          )}
          {sending ? "Writing..." : "Get answer"}
        </button>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {items.map((item) => {
          const itemLimit = parseLimit(item.question);
          const size = itemLimit
            ? itemLimit.unit === "words"
              ? countWords(item.text)
              : item.text.length
            : 0;
          const over = itemLimit !== null && size > itemLimit.max;
          const declined = item.kind === "declined";

          return (
            <article
              key={item.id}
              className={`rounded-xl p-4 ring-1 ${
                declined ? "bg-amber-500/10 ring-amber-400/40" : "bg-slate-900/60 ring-slate-700"
              }`}
            >
             <p className="line-clamp-3 text-xs text-slate-400" title={item.question}>
                {item.question}
              </p>
              {declined && (
                <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-amber-300">
                  Answer this one yourself
                </p>
              )}
              <p className="mt-2 whitespace-pre-wrap text-sm text-slate-100">
                {highlight(item.text)}
              </p>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <p className={`text-xs ${over ? "text-red-300" : "text-slate-400"}`}>
                                  {over && itemLimit ? (
                  <p className="text-xs text-red-300">
                    Over the limit of {itemLimit.max} {itemLimit.unit}
                  </p>
                ) : (
                  <span />
                )}
                </p>
                <div className="flex gap-1">
                  {!declined && (
                    <button
                      type="button"
                      onClick={() => copy(item)}
                      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-slate-200 hover:bg-slate-700"
                    >
                      <Copy aria-hidden="true" className="h-4 w-4" />
                      Copy
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => remove(item.id)}
                    aria-label="Remove this answer"
                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-700 hover:text-white"
                  >
                    <Trash2 aria-hidden="true" className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}