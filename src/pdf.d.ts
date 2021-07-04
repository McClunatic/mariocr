import { PDFDocumentProxy } from "pdfjs-dist/types/display/api";

export function getDocument(file: File): Promise<PDFDocumentProxy>
export function getDataURLs(pdf: PDFDocumentProxy): Promise<string[]>
