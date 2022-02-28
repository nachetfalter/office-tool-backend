import fs from 'fs';
import { Readable } from 'stream';
import { downloadFile } from './s3';
import * as s3Module from './s3';

describe('s3', () => {
  describe('downloadFile', () => {
    it('returns false when s3 fails to get the stream', async () => {
      jest.spyOn(s3Module, 'getS3FileStream').mockResolvedValue(null);
      expect(await downloadFile('test.pdf', './__test__/test.pdf')).toBe(false);
    });

    it('return true when the read stream is successfully downloaded', async () => {
      const readable = Readable.from(fs.readFileSync('src/utility/__test__/wide-page.pdf'));
      jest.spyOn(s3Module, 'getS3FileStream').mockResolvedValue(readable);
      const fileDownloadedSuccessfully = await downloadFile(
        'test.pdf',
        'src/utility/__test__/754315fb-4183-4ba8-960a-a0cb80d4fd5d.pdf',
      );
      expect(fileDownloadedSuccessfully).toBe(true);

      expect(fs.existsSync('src/utility/__test__/754315fb-4183-4ba8-960a-a0cb80d4fd5d.pdf')).toBeTruthy();
      fs.rmSync('src/utility/__test__/754315fb-4183-4ba8-960a-a0cb80d4fd5d.pdf');
    });

    it('return false when the read stream is not successfully downloaded', async () => {
      const readable = Readable.from(fs.readFileSync('src/utility/__test__/wide-page.pdf'));
      jest.spyOn(s3Module, 'getS3FileStream').mockResolvedValue(readable);

      // deliberately use a wrong path
      await expect(downloadFile('test.pdf', 'nonExistPath/test.pdf')).rejects.toBe(false);
    });
  });
});
