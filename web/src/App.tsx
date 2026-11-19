import { useState } from "react";
import JobInput from "./components/JobInput";
import Wizard from "./components/Wizard";
import type { Analysis } from "./api";
import { clearSession, loadSession, type Session } from "./storage";
import { clearAllSavedData } from "./saved";

export default function App() {
  const [restored, setRestored] = useState<Session | null>(() => loadSession());
  const [analysis, setAnalysis] = useState<Analysis | null>(restored?.analysis ?? null);

  function startNewJob() {
    clearSession();
    setRestored(null);
    setAnalysis(null);
  }

  function deleteMyData() {
    const ok = window.confirm(
      "Delete everything Jobsmith saved on this device, including saved details?"
    );
    if (!ok) return;
    clearSession();
    clearAllSavedData();
    setRestored(null);
    setAnalysis(null);
  }

  return (
    <div className="flex min-h-screen flex-col items-center gap-6 bg-slate-900 p-4 py-10">
      <h1 className="text-4xl font-bold text-white">Jobsmith</h1>

      {analysis === null ? (
        <JobInput
          onDone={(a) => {
            setRestored(null);
            setAnalysis(a);
          }}
        />
      ) : (
        <Wizard
          analysis={analysis}
          initialDraft={restored?.draft}
          initialStep={restored?.step}
          onRestart={startNewJob}
        />
      )}

      <p className="mt-auto pt-6 text-xs text-slate-500">
        Saved details are kept on this device only.{" "}
        <button type="button" onClick={deleteMyData} className="underline hover:text-slate-300">
          Delete my data
        </button>
      </p>
    </div>
  );
}