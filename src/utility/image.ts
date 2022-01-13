import jimp from 'jimp';

export const createTestImage = async (savePath?: string) => {
  const image = new jimp(300, 530, 'green');
  if (savePath) {
    return image.writeAsync(savePath);
  } else {
    return image;
  }
};

export const getImageSize = async (imageSource: string) => {
  return await jimp.read(imageSource).then(async (image) => {
    return { width: image.bitmap.width, height: image.bitmap.height };
  });
};

export const convertToPng = async (imageSource: string, savePath: string) => {
  const absoluteImagePath = imageSource;

  return jimp.read(absoluteImagePath).then((image) => {
    return image.writeAsync(savePath);
  });
};
