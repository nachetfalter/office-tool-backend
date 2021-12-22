import { fromBuffer } from 'pdf2pic';
import path = require('path');
import rimraf from 'rimraf';
import jimp from 'jimp';
import fs from 'fs';
import JSZip from 'jszip';
import { PDFDocument } from 'pdf-lib';
import { v4 as uuid } from 'uuid';
import { PageOptions } from './splitPdf.d';
import { getSizeAdjustedForRotation } from './../../utility/imageProcess';

// I used any type here because the actual types of jimp image are too complicated
const writeToFile = async (filePath: string, pageName: string, image: any, pageCounter: number): Promise<number> => {
  await image.writeAsync(`${filePath}/${pageName}-${pageCounter}.png`);
  pageCounter += 1;
  return pageCounter;
};

const convertPdfToImage = async (fileBuffer: Buffer, savePath: string, pageName: string): Promise<void> => {
  const pdfDoc = await PDFDocument.load(fileBuffer);
  const pages = pdfDoc.getPages();
  const { width, height } = getSizeAdjustedForRotation(pages[0]);

  const baseOptions = {
    width: width,
    height: height,
    savePath: savePath,
    density: 600,
    saveFilename: pageName,
  };
  const convert = fromBuffer(fileBuffer, baseOptions);

  if (convert) {
    await Promise.all(
      pages.map(async (_, pageNumber) => {
        // ts ignore is used here due to 'cannot invoke object which is possibly undefined
        // this cannot be resolved no matter what for some reason
        /* @ts-ignore */
        await convert.bulk(pageNumber + 1);
      }),
    );
  } else {
    throw new Error('PDF-image converter initialisation failed');
  }
};

const subSplitPage = async (
  originalFilePath: string,
  processedFilePath: string,
  pageName: string,
  splitOption: 'vertical' | 'horizontal',
): Promise<void> => {
  const files = fs.readdirSync(originalFilePath);
  let pageCounter = 1;
  for (const file of files) {
    await jimp.read(`${originalFilePath}/${file}`).then(async (image) => {
      const width = image.bitmap.width;
      const height = image.bitmap.height;

      if (splitOption === 'vertical') {
        const topHalf = image.clone();
        const bottomHalf = image.clone();
        topHalf.crop(0, 0, width, height / 2);
        bottomHalf.crop(0, height / 2, width, height / 2);

        pageCounter = await writeToFile(processedFilePath, pageName, topHalf, pageCounter);
        pageCounter = await writeToFile(processedFilePath, pageName, bottomHalf, pageCounter);
      } else if (splitOption === 'horizontal') {
        const leftHalf = image.clone();
        const rightHalf = image.clone();
        leftHalf.crop(0, 0, width / 2, height);
        rightHalf.crop(width / 2, 0, width / 2 - 4, height);

        pageCounter = await writeToFile(processedFilePath, pageName, leftHalf, pageCounter);
        pageCounter = await writeToFile(processedFilePath, pageName, rightHalf, pageCounter);
      }
    });
  }
};

const makeZipFile = async (fileName: string, filePath: string, savePath: string) => {
  const zip = new JSZip();
  const files = fs.readdirSync(filePath);
  files.forEach((file) => {
    zip.file(file, fs.readFileSync(`${filePath}/${file}`));
  });

  return new Promise((resolve, reject) =>
    zip
      .generateNodeStream({ type: 'nodebuffer', streamFiles: true })
      .pipe(fs.createWriteStream(`${savePath}/${fileName}.zip`))
      .on('finish', () => {
        resolve(1);
      }),
  );
};

const cleanUpTempFiles = (...filePaths: string[]) => {
  for (const filePath of filePaths) {
    fs.rmSync(filePath, { recursive: true });
  }
};

const splitPdf = async (fileName: string, fileBuffer: Buffer, pageName: string, pageOptions: PageOptions) => {
  const jobId = uuid();
  const originalFilePath = path.resolve(__dirname, `../../../uploads/pdf/split/${jobId}/original`);
  const resultZiptPath = path.resolve(__dirname, `../../../uploads/pdf/split/${jobId}`);
  fs.mkdirSync(originalFilePath, { recursive: true });

  await convertPdfToImage(fileBuffer, originalFilePath, pageName);

  if (pageOptions && pageOptions.split && pageOptions.split !== 'no-split') {
    const processedFilePath = path.resolve(__dirname, `../../../uploads/pdf/split/${jobId}/processed`);
    rimraf.sync(processedFilePath);
    fs.mkdirSync(processedFilePath, { recursive: true });

    await subSplitPage(originalFilePath, processedFilePath, pageName, pageOptions.split);
    await makeZipFile(fileName, processedFilePath, resultZiptPath);
    cleanUpTempFiles(originalFilePath, processedFilePath);
  } else {
    await makeZipFile(fileName, originalFilePath, resultZiptPath);
    cleanUpTempFiles(originalFilePath);
  }
  return `${resultZiptPath}/${fileName}.zip`;
};

export default splitPdf;
