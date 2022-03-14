import fs from 'fs';
import { mergeImagesToPdf } from './mergeImagesToPdf';
import { createTestImage } from '../../../utility/image';
import { deleteFolders } from '../../../utility/file';

describe('mergeImagesToPdf', () => {
  let originalStorageDirectory: string;
  beforeAll(() => {
    originalStorageDirectory = process.env.STORAGE_DIRECTORY ?? '';
    process.env.STORAGE_DIRECTORY = './__test__';
  });

  afterAll(() => {
    process.env.STORAGE_DIRECTORY = originalStorageDirectory;
    deleteFolders('./__test__');
  });

  afterEach(() => {
    if (fs.existsSync(`${process.env.STORAGE_DIRECTORY}/pdf/merge/testJob/test.pdf`)) {
      fs.rmSync(`${process.env.STORAGE_DIRECTORY}/pdf/merge/testJob/test.pdf`);
    }
  });

  it('can merge images to pdf and return the path to the pdf file', async () => {
    await createTestImage('./src/services/pdf/merge/__test__/testImage1.png');
    await createTestImage('./src/services/pdf/merge/__test__/testImage2.png');
    await mergeImagesToPdf(
      ['./src/services/pdf/merge/__test__/testImage1.png', './src/services/pdf/merge/__test__/testImage2.png'],
      'testJob',
      'test',
    );
    expect(fs.existsSync(`${process.env.STORAGE_DIRECTORY}/pdf/merge/testJob/test.pdf`)).toBe(true);
    fs.rmSync('./src/services/pdf/merge/__test__/testImage1.png');
    fs.rmSync('./src/services/pdf/merge/__test__/testImage2.png');
  }, 10000);
});
