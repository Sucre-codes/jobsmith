import { useState } from "react";
import { analyze, describeError, type Analysis } from "../api";

type Mode = "text" | "link";

export default function JobInput({ onDone }: { onDone: (a: Analysis) => void }) {
  const [mode, setMode] = useState<Mode>("text");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  const value = mode === "text" ? text : url;

  async function submit() {
    setProblem(null);
    setLoading(true);
    const outcome = await analyze(mode === "text" ? { text } : { url });
    setLoading(false);

    if (outcome.ok) {
      onDone(outcome.analysis);
      return;
    }
    const info = describeError(outcome.error, outcome.retryAfter);
    setProblem(info.message);
    if (info.suggestPaste) setMode("text");
  }

  return (
    <div className="w-full max-w-xl rounded-2xl bg-slate-800 p-6 shadow-lg">
      <h2 className="text-2xl font-semibold text-white">
        Which job are you applying for?
      </h2>
      <p className="mt-1 text-sm text-slate-400">
        Paste the job description or a link to it.
      </p>

      <div className="mt-4 flex gap-2">
        {(["text", "link"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              mode === m ? "bg-indigo-500 text-white" : "bg-slate-700 text-slate-300"
            }`}
          >
            {m === "text" ? "Paste description" : "Paste link"}
          </button>
        ))}
      </div>

      {mode === "text" ? (
        <textarea
          rows={10}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste the full job description here..."
          className="mt-4 w-full rounded-lg bg-slate-900 p-3 text-slate-100 outline-none ring-1 ring-slate-700 focus:ring-indigo-500"
        />
      ) : (
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://..."
          className="mt-4 w-full rounded-lg bg-slate-900 p-3 text-slate-100 outline-none ring-1 ring-slate-700 focus:ring-indigo-500"
        />
      )}

      {problem && <p className="mt-3 text-sm text-amber-300">{problem}</p>}

      <button
        onClick={submit}
        disabled={loading || value.trim().length === 0}
        className="mt-4 w-full rounded-lg bg-indigo-500 py-2.5 font-semibold text-white disabled:opacity-50"
      >
        {loading ? "Reading the job..." : "Next"}
      </button>
    </div>
  );
}