import { fileNames, type GenerateResponse } from "@jobsmith/shared";
import { makePdfBlob } from "./engine";
import { buildLetterDoc, letterBlob } from "./letter";
import { buildResumeDoc } from "./resume";
import { saveBlob } from "./save";
import { templateById } from "./styles";

export type JobInfo = { title: string; company: string };
export type FileKind = "resume" | "letterPdf" | "letterTxt";

export async function makeFile(
  kind: FileKind,
  result: GenerateResponse,
  job: JobInfo,
  templateId: string
): Promise<{ name: string; blob: Blob }> {
  const style = templateById(templateId);
  const names = fileNames(result.resume.basics.name, job.company, job.title);

  switch (kind) {
    case "resume":
      return {
        name: names.resumePdf,
        blob: await makePdfBlob(buildResumeDoc(result.resume, style)),
      };
    case "letterPdf":
      return {
        name: names.letterPdf,
        blob: await makePdfBlob(buildLetterDoc(result.coverLetter, result.resume, style)),
      };
    case "letterTxt":
      return { name: names.letterTxt, blob: letterBlob(result.coverLetter) };
  }
}

const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function downloadAll(
  result: GenerateResponse,
  job: JobInfo,
  templateId: string
): Promise<void> {
  const kinds: FileKind[] = ["resume", "letterPdf", "letterTxt"];
  const files = await Promise.all(kinds.map((k) => makeFile(k, result, job, templateId)));

  for (const file of files) {
    saveBlob(file.blob, file.name);
    await pause(400);
  }
}