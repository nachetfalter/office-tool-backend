import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import { getSizeAdjustedForRotation } from './imageProcess';

describe('ImageProcess', () => {
  describe('getSizeAdjustedForRotation', () => {
    it('can detect proper width and height when the image is very wide', async () => {
      const pdfDoc = await PDFDocument.load(fs.readFileSync('./src/utility/__test__/wide-page.pdf'));
      const pages = pdfDoc.getPages();
      const { width, height } = getSizeAdjustedForRotation(pages[0]);
      expect(Math.round(width)).toBe(842);
      expect(Math.round(height)).toBe(595);
    });
  });
});
