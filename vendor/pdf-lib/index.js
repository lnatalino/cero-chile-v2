class PDFDocument {
  static async create() {
    return new PDFDocument();
  }

  addPage() {
    return { drawText: () => {} };
  }

  async save() {
    return new Uint8Array();
  }
}

module.exports = { PDFDocument };
