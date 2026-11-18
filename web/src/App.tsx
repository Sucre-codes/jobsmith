import { useState } from "react";
import JobInput from "./components/JobInput";
import type { Analysis } from "./api";

export default function App() {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-900 p-4">
      <h1 className="text-4xl font-bold text-white">Jobsmith</h1>

      {analysis === null ? (
        <JobInput onDone={setAnalysis} />
      ) : (
        <div className="w-full max-w-xl rounded-2xl bg-slate-800 p-6 text-slate-200">
          <p className="text-sm text-slate-400">Detected job</p>
          <h2 className="text-2xl font-semibold text-white">{analysis.title}</h2>
          {analysis.company && <p>{analysis.company}</p>}

          <p className="mt-3 text-sm text-slate-400">We will ask for</p>
          <ul className="list-disc pl-5">
            {analysis.fields.map((f) => (
              <li key={f.key}>
                {f.label}
                {f.required ? " (required)" : ""}
              </li>
            ))}
          </ul>

          <button
            onClick={() => setAnalysis(null)}
            className="mt-4 text-sm text-indigo-300 underline"
          >
            Start over
          </button>
        </div>
      )}
    </div>
  );
}