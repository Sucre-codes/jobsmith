export type PreviewOutcome = "ok" | "blocked" | "failed";

export async function openPreview(make: () => Promise<Blob>): Promise<PreviewOutcome> {
  const tab = window.open("", "_blank");
  if (!tab) return "blocked";
  tab.opener = null;

  try {
    const blob = await make();
    const url = URL.createObjectURL(blob);
    tab.location.href = url;
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
    return "ok";
  } catch {
    tab.close();
    return "failed";
  }
}