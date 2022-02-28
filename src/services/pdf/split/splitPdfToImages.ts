import path = require('path');
import jimp from 'jimp';
import fs from 'fs';
import { PageOptions } from './splitPdfToImages.d';
import { convertPdfToImage } from '../../../utility/pdf';
import { makeZipFile, deleteFolders, recreatePath } from '../../../utility/file';

// I used any type here because the actual types of jimp image are too complicated
export const writeImageToFile = async (
  filePath: string,
  pageName: string,
  image: any,
  pageCounter: number,
): Promise<number> => {
  console.log(`Writing image to file`);
  await image.writeAsync(`${filePath}/${pageName}.${pageCounter}.png`);
  pageCounter += 1;
  return pageCounter;
};

export const subSplitPage = async (
  unprocessedImagePath: string,
  processedImagePath: string,
  pageName: string,
  splitOption: 'vertical' | 'horizontal' | 'no-split',
): Promise<void> => {
  console.log('Conducting sub split');
  const files = fs.readdirSync(unprocessedImagePath);
  for (const file of files) {
    await jimp.read(`${unprocessedImagePath}/${file}`).then((image) => {
      const width = image.bitmap.width;
      const height = image.bitmap.height;
      const parentPageIndex = files.indexOf(file);

      if (splitOption === 'vertical') {
        const topHalf = image.clone();
        const bottomHalf = image.clone();
        topHalf.crop(0, 0, width, height / 2);
        bottomHalf.crop(0, height / 2, width, height / 2);
        return Promise.all([
          writeImageToFile(processedImagePath, pageName, topHalf, 2 * parentPageIndex + 1),
          writeImageToFile(processedImagePath, pageName, bottomHalf, 2 * parentPageIndex + 2),
        ]);
      } else if (splitOption === 'horizontal') {
        const leftHalf = image.clone();
        const rightHalf = image.clone();
        leftHalf.crop(0, 0, width / 2, height);
        rightHalf.crop(width / 2, 0, width / 2 - 4, height);
        console.log(parentPageIndex);
        return Promise.all([
          writeImageToFile(processedImagePath, pageName, leftHalf, 2 * parentPageIndex + 1),
          writeImageToFile(processedImagePath, pageName, rightHalf, 2 * parentPageIndex + 2),
        ]);
      }
    });
  }
};

export const splitPdfToImages = async (fileId: string, pageName: string, pageOptions: PageOptions) => {
  console.log(`Entered split pdf function`);
  const unprocessedImagePath = path.resolve(__dirname, `/tmp/pdf/split/${fileId}/original`);
  const resultZiptPath = path.resolve(__dirname, `/tmp/pdf/split/${fileId}`);
  const sourcePath = `/tmp/pdf/split/${fileId}/${fileId}.pdf`;
  recreatePath(unprocessedImagePath);

  await convertPdfToImage(sourcePath, unprocessedImagePath, pageName);
  const pageNeedsSplitting = pageOptions && pageOptions.split && pageOptions.split !== 'no-split';

  if (pageNeedsSplitting) {
    const processedImagePath = path.resolve(__dirname, `/tmp/pdf/split/${fileId}/processed`);
    recreatePath(processedImagePath);

    await subSplitPage(unprocessedImagePath, processedImagePath, pageName, pageOptions.split);
    await makeZipFile(fileId, processedImagePath, resultZiptPath);
    deleteFolders(unprocessedImagePath, processedImagePath);
  } else {
    await makeZipFile(fileId, unprocessedImagePath, resultZiptPath);
    deleteFolders(unprocessedImagePath);
  }
  return `${resultZiptPath}/${fileId}.zip`;
};
