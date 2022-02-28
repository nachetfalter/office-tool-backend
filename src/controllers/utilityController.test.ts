import { mockReq, mockRes } from '../utility/expressTestHelper';
import * as s3Module from '../utility/s3';
import { uploadUrlController } from './utilityController';

describe('utilityController', () => {
  describe('uploadUrlController', () => {
    let mockedReq: any;
    let mockedCreateUploadUrl: any;

    beforeAll(() => {
      mockedReq = mockReq(undefined, { fileName: 'testFile' });
      mockedCreateUploadUrl = jest.spyOn(s3Module, 'createUploadUrl').mockResolvedValue('testLink');
    });

    it('returns 200 if everything goes well', async () => {
      const mockedRes = mockRes();
      await uploadUrlController(mockedReq, mockedRes);
      expect(mockedCreateUploadUrl).toBeCalledWith('testFile');
      expect(mockedRes.status).toBeCalledWith(200);
      expect(mockedRes.json).toBeCalledWith({
        uploadUrl: 'testLink',
      });
    });
  });
});
