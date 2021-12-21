import { fromBuffer } from 'pdf2pic';
import path = require('path');
import rimraf from 'rimraf';
import jimp from 'jimp';
import fs from 'fs';
import { PDFDocument } from 'pdf-lib';
import { v4 as uuid } from 'uuid';

const splitPdf = async (file: Buffer, pageName: string, pageOptions: Record<string, any>) => {
  const jobId = uuid();
  const originalPath = path.resolve(__dirname, `../../../uploads/pdf/split/${jobId}/original`);
  fs.mkdirSync(originalPath, { recursive: true });

  const pdfDoc = await PDFDocument.load(file);
  const pages = pdfDoc.getPages();
  const { width, height } = pages[0].getSize();

  const baseOptions = {
    width: width,
    height: height,
    originalPath: originalPath,
    saveFilename: `./uploads/pdf/split/${jobId}/original/${pageName}`,
  };
  const convert = fromBuffer(file, baseOptions);

  for (let page = 1; page < 4; ++page) {
    console.log(page);
    /* @ts-ignore */
    await convert.bulk(page);
  }

  if (pageOptions && pageOptions.split && pageOptions.split !== 'no-split') {
    const processedFilePath = path.resolve(__dirname, `../../../uploads/pdf/split/${jobId}/processed`);

    rimraf.sync(processedFilePath);
    fs.mkdirSync(processedFilePath, { recursive: true });

    const files = fs.readdirSync(originalPath);
    let pageCounter = 0;
    for (const file of files) {
      await jimp.read(`${originalPath}/${file}`).then((image) => {
        const width = image.bitmap.width;
        const height = image.bitmap.height;

        if (pageOptions.split === 'vertical') {
          const topHalf = image.clone();
          const bottomHalf = image.clone();

          topHalf.crop(0, 0, width, height / 2);
          bottomHalf.crop(0, height / 2, width, height / 2);
          topHalf.write(`${processedFilePath}/${pageName}-${pageCounter}.png`);
          pageCounter += 1;
          bottomHalf.write(`${processedFilePath}/${pageName}-${pageCounter}.png`);
          pageCounter += 1;
        } else if (pageOptions.split === 'horizontal') {
          const leftHalf = image.clone();
          const rightHalf = image.clone();

          leftHalf.crop(0, 0, width / 2, height);
          rightHalf.crop(width / 2, 0, width / 2, height);
          leftHalf.write(`${processedFilePath}/${pageName}-${pageCounter}.png`);
          pageCounter += 1;
          rightHalf.write(`${processedFilePath}/${pageName}-${pageCounter}.png`);
          pageCounter += 1;
        }
      });
      // await sharp(fileBuffer)
      //   .resize(2550, 1650)
      //   .toFile(`${processedFilePath}/${pageName}-${files.indexOf(file)}.png`);
    }
  }
};

export default splitPdf;
