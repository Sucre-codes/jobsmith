import type { SavedApplication } from "../application";

type Props = {
  app: SavedApplication;
  onContinue: () => void;
  onNew: () => void;
};

export default function WelcomeBack({ app, onContinue, onNew }: Props) {
  const days = Math.floor((Date.now() - app.savedAt) / 86_400_000);
  const when = days <= 0 ? "today" : days === 1 ? "yesterday" : `${days} days ago`;
  const { title, company } = app.analysis;

  return (
    <div className="w-full max-w-xl rounded-2xl bg-slate-800 p-6 shadow-lg">
      <h2 className="text-2xl font-semibold text-white">Welcome back</h2>
      <p className="mt-2 text-sm text-slate-300">
        Your resume and cover letter for{" "}
        <span className="font-semibold text-white">
          {title}
          {company ? ` at ${company}` : ""}
        </span>{" "}
        are still here. You made them {when}.
      </p>
      <p className="mt-1 text-xs text-slate-400">Saved on this device only.</p>

      <div className="mt-5 flex flex-col gap-3">
        <button
          type="button"
          onClick={onContinue}
          className="rounded-lg bg-indigo-500 py-2.5 font-semibold text-white"
        >
          Continue with this job
        </button>
        <button
          type="button"
          onClick={onNew}
          className="rounded-lg bg-slate-700 py-2.5 text-slate-100"
        >
          Apply for another job
        </button>
      </div>
    </div>
  );
}