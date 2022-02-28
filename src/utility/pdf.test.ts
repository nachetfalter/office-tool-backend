import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import { getPdfSizeAdjustedForRotation, createTestPdf, getNumberOfPages, convertPdfToImage } from './pdf';

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
      expect(fs.existsSync('./src/utility/__test__/test.pdf')).toBe(true);
      fs.rmSync('./src/utility/__test__/test.pdf');
    });
  });

  describe('getNumberOfPages', () => {
    it('can get number of pages from a pdf file', async () => {
      expect(await getNumberOfPages('./src/utility/__test__/wide-page.pdf')).toBe(1);
    });

    it('throws error if an encrypted pdf is given', async () => {
      expect(getNumberOfPages('./src/utility/__test__/encrypted.pdf')).rejects.toThrow(
        'The document is encrypted and cannot be operated on',
      );
    });
  });

  describe('convertPdfToImage', () => {
    it('can convert pdf to image', async () => {
      await convertPdfToImage('./src/utility/__test__/wide-page.pdf', './src/utility/__test__/', 'test');
      expect(fs.existsSync('./src/utility/__test__/test-1.png')).toBe(true);
      fs.rmSync('./src/utility/__test__/test-1.png');
    });
  });
});
