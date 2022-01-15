import fs from 'fs';
import { mergeImagesToPdf } from './mergeImagesToPdf';
import { createTestImage } from '../../utility/image';

describe('mergeImagesToPdf', () => {
  afterEach(() => {
    fs.rmSync('/tmp/pdf/merge/testJob/test.pdf');
  });

  it('can merge images to pdf and return the path to the pdf file', async () => {
    await createTestImage('./src/pdf/merge/__test__/testImage1.png');
    await createTestImage('./src/pdf/merge/__test__/testImage2.png');
    await mergeImagesToPdf(
      ['./src/pdf/merge/__test__/testImage1.png', './src/pdf/merge/__test__/testImage2.png'],
      'testJob',
      'test',
    );
    expect(fs.existsSync('/tmp/pdf/merge/testJob/test.pdf')).toBe(true);
    fs.rmSync('./src/pdf/merge/__test__/testImage1.png');
    fs.rmSync('./src/pdf/merge/__test__/testImage2.png');
  }, 10000);
});
