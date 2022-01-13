import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import { getPdfSizeAdjustedForRotation, createTestPdf } from './pdf';

describe('pdf', () => {
  describe('getPdfSizeAdjustedForRotation', () => {
    it('can detect proper width and height when the image is very wide', async () => {
      const pdfDoc = await PDFDocument.load(fs.readFileSync('./src/utility/__test__/wide-page.pdf'));
      const pages = pdfDoc.getPages();
      const { width, height } = getPdfSizeAdjustedForRotation(pages[0]);
      expect(Math.round(width)).toBe(842);
      expect(Math.round(height)).toBe(595);
    });
  });

  describe('createTestPdf', () => {
    it('can create pdf file', async () => {
      await createTestPdf('./src/utility/__test__/test.pdf', 'test');
      expect(fs.existsSync('./src/utility/__test__/test.pdf')).toBeTruthy();
      fs.rmSync('./src/utility/__test__/test.pdf');
    });
  });
});
