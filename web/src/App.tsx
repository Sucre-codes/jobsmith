import { useState } from "react";
import JobInput from "./components/JobInput";
import Wizard from "./components/Wizard";
import WelcomeBack from "./components/WelcomeBack";
import type { Analysis } from "./api";
import { clearSession, loadSession, type Session } from "./storage";
import { clearAllSavedData } from "./saved";
import {
  clearApplication,
  loadApplication,
  touchApplication,
  type SavedApplication,
} from "./application";

export default function App() {
  const [boot] = useState(() => {
    const session = loadSession();
    return { session, app: session ? null : loadApplication() };
  });
  const [restored, setRestored] = useState<Session | null>(boot.session);
  const [waiting, setWaiting] = useState<SavedApplication | null>(boot.app);
  const [analysis, setAnalysis] = useState<Analysis | null>(boot.session?.analysis ?? null);

  function startNewJob() {
    clearSession();
    setRestored(null);
    setAnalysis(null);
  }

  function applyForAnother() {
    const ok = window.confirm(
      "Apply for another job? This removes the current job, resume and cover letter from this device."
    );
    if (!ok) return;
    clearSession();
    clearApplication();
    setRestored(null);
    setWaiting(null);
    setAnalysis(null);
  }

  function continueSaved() {
    if (!waiting) return;
    touchApplication();
    setRestored({
      analysis: waiting.analysis,
      draft: waiting.draft,
      step: 99,
      result: waiting.result,
    });
    setAnalysis(waiting.analysis);
    setWaiting(null);
  }

  function deleteMyData() {
    const ok = window.confirm(
      "Delete everything Jobsmith saved on this device, including saved details and your current resume?"
    );
    if (!ok) return;
    clearSession();
    clearApplication();
    clearAllSavedData();
    setRestored(null);
    setWaiting(null);
    setAnalysis(null);
  }

  return (
    <div className="flex min-h-screen flex-col items-center gap-6 bg-slate-900 p-4 py-10">
      <h1 className="text-4xl font-bold text-white">Jobsmith</h1>

      {analysis !== null ? (
        <Wizard
          analysis={analysis}
          initialDraft={restored?.draft}
          initialStep={restored?.step}
          initialResult={restored?.result}
          onRestart={startNewJob}
          onFinish={applyForAnother}
        />
      ) : waiting ? (
        <WelcomeBack app={waiting} onContinue={continueSaved} onNew={applyForAnother} />
      ) : (
        <JobInput
          onDone={(a) => {
            setRestored(null);
            setAnalysis(a);
          }}
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