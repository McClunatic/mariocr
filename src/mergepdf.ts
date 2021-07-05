import { PDFDocument } from 'pdf-lib'


export async function mergePdfs(pdfsToMerge: Uint8Array[]) {
  const mergedPdf = await PDFDocument.create();
  for (const pdfBytes of pdfsToMerge) {
    const pdf = await PDFDocument.load(pdfBytes);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => {
      mergedPdf.addPage(page);
    });
  }
  const mergedPdfFile = await mergedPdf.save();
  return mergedPdfFile;
}
