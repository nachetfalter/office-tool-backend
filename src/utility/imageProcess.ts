import { PDFPage } from 'pdf-lib';

export const getSizeAdjustedForRotation = (page: PDFPage) => {
  const size = page.getSize();
  const rotation = page.getRotation().angle;
  const isFlipped = (rotation / 90) % 2 !== 0;

  return isFlipped ? { width: size.height, height: size.width } : { width: size.width, height: size.height };
};
