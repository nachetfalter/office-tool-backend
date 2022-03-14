import fs from 'fs';
import { PDFDocument } from 'pdf-lib';
import { getImageSize, convertToPng } from '../../../utility/image';

export const mergeImagesToPdf = async (
  imagePaths: string[],
  jobFolder: string,
  outputFileName: string,
): Promise<string> => {
  const pdfDoc = await PDFDocument.create();
  let pageCount = 0;
  await Promise.all(
    imagePaths.map(async (imagePath, imageIndex) => {
      await convertToPng(imagePath, `${process.env.STORAGE_DIRECTORY}/pdf/merge/${jobFolder}/${imageIndex}.png`);
      const image = await pdfDoc.embedPng(
        fs.readFileSync(`${process.env.STORAGE_DIRECTORY}/pdf/merge/${jobFolder}/${imageIndex}.png`),
      );
      const { width, height } = await getImageSize(imagePath);
      const page = pdfDoc.insertPage(pageCount, [width, height]);
      pageCount += 1;
      page.drawImage(image, {
        x: 0,
        y: 0,
        width: width,
        height: height,
      });
    }),
  );
  const pdfBinary = await pdfDoc.save();
  const resultPdfPath = `${process.env.STORAGE_DIRECTORY}/pdf/merge/${jobFolder}/${outputFileName}.pdf`;
  fs.writeFileSync(resultPdfPath, pdfBinary);
  return resultPdfPath;
};
