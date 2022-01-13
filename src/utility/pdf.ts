import fs from 'fs';
import { PDFDocument, PDFPage } from 'pdf-lib';

export const createTestPdf = async (path: string, text: string) => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([800, 600]);
  page.drawText(text);
  const pdfBinary = await pdfDoc.save();
  fs.writeFileSync(path, pdfBinary);
};

export const getPdfSizeAdjustedForRotation = (page: PDFPage) => {
  const size = page.getSize();
  const rotation = page.getRotation().angle;
  const isFlipped = (rotation / 90) % 2 !== 0;

  return isFlipped ? { width: size.height, height: size.width } : { width: size.width, height: size.height };
};
