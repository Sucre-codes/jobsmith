type PdfMake = {
  addVirtualFileSystem: (vfs: unknown) => void;
  createPdf: (doc: object) => { getBlob: () => Promise<Blob> };
};

const pick = <T>(m: unknown): T => ((m as { default?: T }).default ?? m) as T;

let ready: Promise<PdfMake> | null = null;

export function loadPdfMake(): Promise<PdfMake> {
  if (!ready) {
    ready = (async () => {
      const [core, fonts] = await Promise.all([
        import("pdfmake/build/pdfmake"),
        import("pdfmake/build/vfs_fonts"),
      ]);
      const pdfMake = pick<PdfMake>(core);
      pdfMake.addVirtualFileSystem(pick<object>(fonts));
      return pdfMake;
    })();
    ready.catch(() => {
      ready = null;
    });
  }
  return ready;
}

export async function makePdfBlob(doc: object): Promise<Blob> {
  const pdfMake = await loadPdfMake();
  return pdfMake.createPdf(structuredClone(doc)).getBlob();
}