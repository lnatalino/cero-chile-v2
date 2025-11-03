export class PDFDocument {
  static create(): Promise<PDFDocument>;
  addPage(options?: { size?: [number, number] }): { drawText(text: string, options?: Record<string, unknown>): void };
  save(): Promise<Uint8Array>;
}
