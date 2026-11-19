import { useState } from "react";
import JobInput from "./components/JobInput";
import Wizard from "./components/Wizard";
import type { Analysis } from "./api";

export default function App() {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);

  return (
    <div className="flex min-h-screen flex-col items-center gap-6 bg-slate-900 p-4 py-10">
      <h1 className="text-4xl font-bold text-white">Jobsmith</h1>

      {analysis === null ? (
        <JobInput onDone={setAnalysis} />
      ) : (
        <Wizard analysis={analysis} onRestart={() => setAnalysis(null)} />
      )}
    </div>
  );
}