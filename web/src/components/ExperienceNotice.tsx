import { experienceMonths, formatDuration, type ExperienceItem } from "@jobsmith/shared";

type Props = {
  items: ExperienceItem[];
  yearsRequired: number | null;
};

export default function ExperienceNotice({ items, yearsRequired }: Props) {
  if (!yearsRequired) return null;

  const months = experienceMonths(items);
  const enough = months >= yearsRequired * 12;
  const asked = `${yearsRequired}+ year${yearsRequired === 1 ? "" : "s"}`;

  return (
    <div
      className={`rounded-lg p-3 text-sm ${
        enough ? "bg-emerald-500/10 text-emerald-200" : "bg-amber-500/10 text-amber-200"
      }`}
    >
      <p>
        This job asks for {asked} of experience. Your jobs add up to {formatDuration(months)}.
      </p>
      {!enough && (
        <p className="mt-1">
          Enter your real dates, because employers check them. Being a little short doesn't
          always rule you out.
        </p>
      )}
    </div>
  );
}