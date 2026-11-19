import { useState } from "react";
import { deleteProfile, listProfiles, type SavedProfile } from "../saved";

type Props = {
  onUse: (profile: SavedProfile) => void;
};

export default function SavedProfilePicker({ onUse }: Props) {
  const [profiles, setProfiles] = useState<SavedProfile[]>(() => listProfiles());

  if (profiles.length === 0) return null;

  function remove(p: SavedProfile) {
    const who = p.draft.basics.name || p.draft.basics.email;
    if (!window.confirm(`Delete the saved details for ${who}?`)) return;
    deleteProfile(p.id);
    setProfiles(listProfiles());
  }

  return (
    <div className="rounded-xl bg-slate-900/60 p-4 ring-1 ring-slate-700">
      <p className="text-sm font-medium text-white">Use saved details?</p>
      <p className="mb-3 text-xs text-slate-400">Saved on this device only.</p>

      <div className="flex flex-col gap-2">
        {profiles.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between gap-3 rounded-lg bg-slate-800 p-3"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{p.draft.basics.name}</p>
              <p className="truncate text-xs text-slate-400">{p.draft.basics.email}</p>
            </div>
            <div className="flex shrink-0 gap-3 text-sm">
              <button
                type="button"
                onClick={() => onUse(p)}
                className="font-semibold text-indigo-300"
              >
                Use
              </button>
              <button
                type="button"
                onClick={() => remove(p)}
                className="text-slate-400 hover:text-red-300"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}