import fs from 'fs';
import gm from 'gm';
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

export const loadPdf = async (source: string) => {
  let pdfDoc;
  try {
    pdfDoc = await PDFDocument.load(fs.readFileSync(source));
  } catch (err) {
    console.error(err);
    throw Error('The document is encrypted and cannot be operated on');
  }
  return pdfDoc;
};

export const getNumberOfPages = async (source: string) => {
  const pdfDoc = await loadPdf(source);
  return pdfDoc.getPages().length;
};

export const convertPdfToImage = async (
  source: string,
  destDirectory: string,
  outputPageName: string,
): Promise<void> => {
  const pdfPages = (await loadPdf(source)).getPages();
  let batch = [];
  for (const page of pdfPages) {
    // Unfortunately it would seem that Ghostscript has problem
    // converting if all jobs are allowed to go concurrently
    if (batch.length === 50) {
      await Promise.all(batch);
      batch = [];
    }
    const pageNumber = pdfPages.indexOf(page);
    const { width, height } = getPdfSizeAdjustedForRotation(page);
    batch.push(
      new Promise((resolve, reject) => {
        gm(`${source}[${pageNumber}]`)
          .setFormat('png')
          .resize(width, height)
          .quality(100)
          .density(400, 400)
          .write(`${destDirectory}/${outputPageName}-${pageNumber + 1}.png`, (err) => {
            if (err) {
              console.error(err);
              return reject(false);
            }
            console.log(`${destDirectory}/${outputPageName}-${pageNumber + 1}.png finished`);
            const { size } = fs.statSync(`${destDirectory}/${outputPageName}-${pageNumber + 1}.png`);
            console.log(`File ${destDirectory}/${outputPageName}-${pageNumber + 1}.png has ${size}`);
            return resolve(true);
          });
      }),
    );
  }
  if (batch.length) {
    await Promise.all(batch);
  }
};
