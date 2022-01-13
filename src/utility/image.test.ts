import fs from 'fs';
import { createTestImage, getImageSize, convertToPng } from './image';

describe('Image', () => {
  describe('createTestImage', () => {
    it('can create test image', async () => {
      expect(await createTestImage()).toBeTruthy();
    });
  });

  describe('getImageSize', () => {
    it('can get image size from a path', async () => {
      await createTestImage('./src/utility/__test__/testImage.png');
      expect(await getImageSize('./src/utility/__test__/testImage.png')).toStrictEqual({ width: 300, height: 530 });
      fs.rmSync('./src/utility/__test__/testImage.png');
    });
  });

  describe('convertToPng', () => {
    it('can convert jpg to png', async () => {
      await createTestImage('./src/utility/__test__/testImage.jpg');
      await convertToPng('./src/utility/__test__/testImage.jpg', './src/utility/__test__/testImage.png');
      expect(fs.existsSync('./src/utility/__test__/testImage.png')).toBeTruthy();
      fs.rmSync('./src/utility/__test__/testImage.jpg');
      fs.rmSync('./src/utility/__test__/testImage.png');
    });
  });
});
